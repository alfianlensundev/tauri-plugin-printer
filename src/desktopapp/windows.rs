use std::{
    env,
    ffi::OsStr,
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    process::Command,
};

use base64::{engine::general_purpose, Engine as _};
use sysinfo::System;

use crate::{
    Error, PrintJob, PrintJobRaw, PrintResult, PrinterCapabilities, PrinterCapabilitiesRaw,
    PrinterItem, PrinterRaw, Result,
};

const PRINTER_FIELDS: &str = "Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority";

pub fn init() -> Result<PathBuf> {
    let directory = plugin_temp_dir()?;
    let executable = directory.join("sm.exe");
    let bytes = include_bytes!("../../bin/sm");

    let needs_write = fs::metadata(&executable)
        .map(|metadata| metadata.len() != bytes.len() as u64)
        .unwrap_or(true);
    if needs_write {
        let temporary = directory.join("sm.exe.tmp");
        fs::write(&temporary, bytes)?;
        if executable.exists() {
            fs::remove_file(&executable)?;
        }
        fs::rename(temporary, &executable)?;
    }

    Ok(executable)
}

pub fn get_printers() -> Result<Vec<PrinterItem>> {
    let script = format!(
        "$defaultName = (Get-CimInstance Win32_Printer -Filter 'Default = TRUE' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Name); $items = @(Get-Printer -ErrorAction Stop | Select-Object {PRINTER_FIELDS}, @{{Name='IsDefault';Expression={{$_.Name -eq $defaultName}}}}); ConvertTo-Json -InputObject $items -Depth 3 -Compress"
    );
    let output = powershell(&script, &[])?;
    let printers: Vec<PrinterRaw> = serde_json::from_str(empty_array_if_blank(&output))?;
    printers.into_iter().map(printer_from_raw).collect()
}

pub fn get_printer(id: &str) -> Result<PrinterItem> {
    let name = decode_id(id, "printer")?;
    get_printer_by_name(&name)
}

pub fn get_printer_by_name(name: &str) -> Result<PrinterItem> {
    require_non_empty(name, "printer name")?;
    let script = format!(
        "$defaultName = (Get-CimInstance Win32_Printer -Filter 'Default = TRUE' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Name); $item = Get-Printer -Name $env:TAURI_PRINTER_NAME -ErrorAction Stop | Select-Object {PRINTER_FIELDS}, @{{Name='IsDefault';Expression={{$_.Name -eq $defaultName}}}}; ConvertTo-Json -InputObject $item -Depth 3 -Compress"
    );
    let output = powershell(&script, &[("TAURI_PRINTER_NAME", name)])?;
    if output.trim().is_empty() {
        return Err(Error::PrinterNotFound(name.to_owned()));
    }
    printer_from_raw(serde_json::from_str(&output)?)
}

pub fn get_default_printer() -> Result<Option<PrinterItem>> {
    let output = powershell(
        "$item = Get-CimInstance Win32_Printer -Filter 'Default = TRUE' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($null -ne $item) { $item.Name }",
        &[],
    )?;
    let name = output.trim();
    if name.is_empty() {
        Ok(None)
    } else {
        get_printer_by_name(name).map(Some)
    }
}

pub fn set_default_printer(name: &str) -> Result<PrinterItem> {
    get_printer_by_name(name)?;
    powershell(
        "$network = New-Object -ComObject WScript.Network; $network.SetDefaultPrinter($env:TAURI_PRINTER_NAME)",
        &[("TAURI_PRINTER_NAME", name)],
    )?;
    get_printer_by_name(name)
}

pub fn get_printer_capabilities(name: &str) -> Result<PrinterCapabilities> {
    get_printer_by_name(name)?;
    let output = powershell(
        "$item = Get-PrintConfiguration -PrinterName $env:TAURI_PRINTER_NAME -ErrorAction Stop; [PSCustomObject]@{ PrinterName=$item.PrinterName; Color=$item.Color; Collate=$item.Collate; DuplexingMode=$item.DuplexingMode.ToString(); PaperSize=$item.PaperSize.ToString() } | ConvertTo-Json -Compress",
        &[("TAURI_PRINTER_NAME", name)],
    )?;
    let raw: PrinterCapabilitiesRaw = serde_json::from_str(&output)?;
    Ok(PrinterCapabilities {
        printer_name: raw.printer_name.unwrap_or_else(|| name.to_owned()),
        color: raw.color,
        collate: raw.collate,
        duplexing_mode: raw.duplexing_mode,
        paper_size: raw.paper_size,
    })
}

pub fn get_jobs(printer_name: &str) -> Result<Vec<PrintJob>> {
    get_printer_by_name(printer_name)?;
    let output = powershell(
        "$items = @(Get-PrintJob -PrinterName $env:TAURI_PRINTER_NAME -ErrorAction Stop | ForEach-Object { [PSCustomObject]@{ DocumentName=$_.DocumentName; Id=$_.Id; TotalPages=$_.TotalPages; Position=$_.Position; Size=$_.Size; UserName=$_.UserName; PagesPrinted=$_.PagesPrinted; JobTime=$_.JobTime; ComputerName=$_.ComputerName; Datatype=$_.Datatype; PrinterName=$_.PrinterName; Priority=$_.Priority; SubmittedTime=if ($null -eq $_.SubmittedTime) {$null} else {$_.SubmittedTime.ToString('o')}; JobStatus=[int]$_.JobStatus } }); ConvertTo-Json -InputObject $items -Depth 3 -Compress",
        &[("TAURI_PRINTER_NAME", printer_name)],
    )?;
    let jobs: Vec<PrintJobRaw> = serde_json::from_str(empty_array_if_blank(&output))?;
    jobs.into_iter()
        .map(|raw| job_from_raw(raw, printer_name))
        .collect()
}

pub fn get_job(printer_name: &str, job_id: i32) -> Result<PrintJob> {
    validate_job_id(job_id)?;
    let job_id_string = job_id.to_string();
    let output = powershell(
        "$item = Get-PrintJob -PrinterName $env:TAURI_PRINTER_NAME -ID ([int]$env:TAURI_PRINT_JOB_ID) -ErrorAction Stop; [PSCustomObject]@{ DocumentName=$item.DocumentName; Id=$item.Id; TotalPages=$item.TotalPages; Position=$item.Position; Size=$item.Size; UserName=$item.UserName; PagesPrinted=$item.PagesPrinted; JobTime=$item.JobTime; ComputerName=$item.ComputerName; Datatype=$item.Datatype; PrinterName=$item.PrinterName; Priority=$item.Priority; SubmittedTime=if ($null -eq $item.SubmittedTime) {$null} else {$item.SubmittedTime.ToString('o')}; JobStatus=[int]$item.JobStatus } | ConvertTo-Json -Compress",
        &[
            ("TAURI_PRINTER_NAME", printer_name),
            ("TAURI_PRINT_JOB_ID", &job_id_string),
        ],
    )?;
    job_from_raw(serde_json::from_str(&output)?, printer_name)
}

pub fn resume_job(printer_name: &str, job_id: i32) -> Result<PrintResult> {
    run_job_action("Resume-PrintJob", "resumed", printer_name, job_id)
}

pub fn restart_job(printer_name: &str, job_id: i32) -> Result<PrintResult> {
    run_job_action("Restart-PrintJob", "restarted", printer_name, job_id)
}

pub fn pause_job(printer_name: &str, job_id: i32) -> Result<PrintResult> {
    run_job_action("Suspend-PrintJob", "paused", printer_name, job_id)
}

pub fn remove_job(printer_name: &str, job_id: i32) -> Result<PrintResult> {
    run_job_action("Remove-PrintJob", "removed", printer_name, job_id)
}

pub fn create_temp_pdf(data: &str, filename: &str) -> Result<PathBuf> {
    let file_name = Path::new(filename)
        .file_name()
        .and_then(OsStr::to_str)
        .ok_or_else(|| Error::InvalidInput("invalid temporary filename".into()))?;
    if file_name != filename || !file_name.to_ascii_lowercase().ends_with(".pdf") {
        return Err(Error::InvalidInput(
            "temporary filename must be a plain .pdf filename".into(),
        ));
    }

    let bytes = general_purpose::STANDARD.decode(data)?;
    validate_pdf_bytes(&bytes)?;
    let path = documents_temp_dir()?.join(file_name);
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)?;
    file.write_all(&bytes)?;
    file.sync_all()?;
    Ok(path)
}

pub fn print_pdf(
    executable: &Path,
    printer_name: Option<&str>,
    path: &Path,
    settings: &str,
    remove_after_print: bool,
) -> Result<PrintResult> {
    if !path.is_file() {
        return Err(Error::InvalidInput(format!(
            "PDF file does not exist: {}",
            path.display()
        )));
    }
    let mut header = [0_u8; 5];
    File::open(path)?.read_exact(&mut header)?;
    validate_pdf_bytes(&header)?;

    let mut command = Command::new(executable);
    match printer_name
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        Some(name) => {
            get_printer_by_name(name)?;
            command.args(["-print-to", name]);
        }
        None => {
            command.arg("-print-to-default");
        }
    }

    let normalized_settings = settings
        .trim()
        .strip_prefix("-print-settings")
        .unwrap_or(settings.trim())
        .trim();
    if !normalized_settings.is_empty() {
        command.args(["-print-settings", normalized_settings]);
    }
    command.arg("-silent").arg(path);

    let output = command.output()?;
    if remove_after_print && is_managed_temp_file(path) {
        let _ = fs::remove_file(path);
    }

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        return Err(Error::CommandFailed(if stderr.is_empty() {
            renderer_error_message(output.status.code()).to_owned()
        } else {
            stderr
        }));
    }

    Ok(PrintResult {
        success: true,
        message: "Print job submitted".into(),
    })
}

pub fn print_pdf_data(
    executable: &Path,
    printer_name: Option<&str>,
    data: &str,
    settings: &str,
) -> Result<PrintResult> {
    let filename = format!(
        "print-{}-{}.pdf",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|error| Error::InvalidInput(error.to_string()))?
            .as_nanos()
    );
    let path = create_temp_pdf(data, &filename)?;
    let result = print_pdf(executable, printer_name, &path, settings, false);
    let _ = fs::remove_file(path);
    result
}

fn printer_from_raw(raw: PrinterRaw) -> Result<PrinterItem> {
    let name = raw
        .name
        .filter(|name| !name.is_empty())
        .ok_or_else(|| Error::InvalidInput("printer response did not contain a name".into()))?;
    let shared = raw.shared.unwrap_or(false);
    Ok(PrinterItem {
        id: general_purpose::STANDARD.encode(name.as_bytes()),
        name,
        driver_name: raw.driver_name,
        job_count: raw.job_count,
        print_processor: raw.print_processor,
        port_name: raw.port_name,
        share_name: raw.share_name,
        computer_name: raw
            .computer_name
            .filter(|computer_name| !computer_name.is_empty())
            .or_else(|| (!shared).then(System::host_name).flatten()),
        printer_status: raw.printer_status,
        shared,
        printer_type: raw.printer_type,
        priority: raw.priority,
        is_default: raw.is_default.unwrap_or(false),
    })
}

fn job_from_raw(raw: PrintJobRaw, fallback_printer_name: &str) -> Result<PrintJob> {
    let job_id = raw
        .id
        .ok_or_else(|| Error::InvalidInput("print job response did not contain an id".into()))?;
    let printer_name = raw
        .printer_name
        .unwrap_or_else(|| fallback_printer_name.to_owned());
    Ok(PrintJob {
        id: general_purpose::STANDARD.encode(format!("{printer_name}_@_{job_id}")),
        job_id,
        document_name: raw.document_name,
        total_pages: raw.total_pages,
        position: raw.position,
        size: raw.size,
        username: raw.username,
        pages_printed: raw.pages_printed,
        job_time: raw.job_time,
        computer_name: raw.computer_name,
        data_type: raw.data_type,
        printer_name,
        priority: raw.priority,
        submitted_time: raw.submitted_time,
        job_status: raw.job_status.unwrap_or_default(),
    })
}

fn run_job_action(
    command: &str,
    verb: &str,
    printer_name: &str,
    job_id: i32,
) -> Result<PrintResult> {
    validate_job_id(job_id)?;
    get_job(printer_name, job_id)?;
    let script = format!(
        "{command} -PrinterName $env:TAURI_PRINTER_NAME -ID ([int]$env:TAURI_PRINT_JOB_ID) -ErrorAction Stop"
    );
    let job_id_string = job_id.to_string();
    powershell(
        &script,
        &[
            ("TAURI_PRINTER_NAME", printer_name),
            ("TAURI_PRINT_JOB_ID", &job_id_string),
        ],
    )?;
    Ok(PrintResult {
        success: true,
        message: format!("Print job {verb}"),
    })
}

fn powershell(script: &str, environment: &[(&str, &str)]) -> Result<String> {
    let mut command = Command::new("powershell.exe");
    command.args([
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        script,
    ]);
    for (name, value) in environment {
        command.env(name, value);
    }
    let output = command.output()?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        return Err(Error::CommandFailed(if stderr.is_empty() {
            format!("PowerShell exited with {}", output.status)
        } else {
            stderr
        }));
    }
    Ok(String::from_utf8(output.stdout)?.trim().to_owned())
}

fn decode_id(id: &str, label: &str) -> Result<String> {
    require_non_empty(id, &format!("{label} id"))?;
    let decoded = general_purpose::STANDARD.decode(id)?;
    let value = String::from_utf8(decoded)?;
    require_non_empty(&value, &format!("decoded {label} name"))?;
    Ok(value)
}

fn validate_job_id(job_id: i32) -> Result<()> {
    if job_id <= 0 {
        Err(Error::InvalidInput(
            "job id must be greater than zero".into(),
        ))
    } else {
        Ok(())
    }
}

fn require_non_empty(value: &str, label: &str) -> Result<()> {
    if value.trim().is_empty() {
        Err(Error::InvalidInput(format!("{label} cannot be empty")))
    } else {
        Ok(())
    }
}

fn validate_pdf_bytes(bytes: &[u8]) -> Result<()> {
    if bytes.len() < 5 || &bytes[..5] != b"%PDF-" {
        Err(Error::InvalidInput("only PDF files are supported".into()))
    } else {
        Ok(())
    }
}

fn renderer_error_message(code: Option<i32>) -> &'static str {
    match code {
        Some(2) => "PDF renderer could not open the file",
        Some(3) => "the PDF does not allow printing",
        Some(4) => "the selected printer does not exist",
        Some(5) => "the printer driver or device failed",
        Some(6) => "printing is disabled by policy",
        _ => "PDF renderer failed",
    }
}

fn plugin_temp_dir() -> Result<PathBuf> {
    let path = env::temp_dir().join("tauri-plugin-printer");
    fs::create_dir_all(&path)?;
    Ok(path)
}

fn documents_temp_dir() -> Result<PathBuf> {
    let path = plugin_temp_dir()?.join("documents");
    fs::create_dir_all(&path)?;
    Ok(path)
}

fn is_managed_temp_file(path: &Path) -> bool {
    let Some(filename) = path.file_name() else {
        return false;
    };
    documents_temp_dir()
        .and_then(|directory| Ok(path.canonicalize()? == directory.join(filename).canonicalize()?))
        .unwrap_or(false)
}

fn empty_array_if_blank(value: &str) -> &str {
    if value.trim().is_empty() {
        "[]"
    } else {
        value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_pdf_signature() {
        assert!(validate_pdf_bytes(b"%PDF-1.7").is_ok());
        assert!(validate_pdf_bytes(b"not a PDF").is_err());
        assert!(validate_pdf_bytes(b"").is_err());
    }

    #[test]
    fn decodes_unicode_printer_id() {
        let name = "Printer Kasir – Depan";
        let id = general_purpose::STANDARD.encode(name.as_bytes());
        assert_eq!(decode_id(&id, "printer").unwrap(), name);
        assert!(decode_id("not-base64", "printer").is_err());
    }

    #[test]
    fn maps_renderer_exit_codes() {
        assert_eq!(
            renderer_error_message(Some(4)),
            "the selected printer does not exist"
        );
        assert_eq!(
            renderer_error_message(Some(5)),
            "the printer driver or device failed"
        );
        assert_eq!(renderer_error_message(Some(99)), "PDF renderer failed");
    }

    #[test]
    fn blank_powershell_collection_becomes_json_array() {
        assert_eq!(empty_array_if_blank("  "), "[]");
        assert_eq!(empty_array_if_blank("[1]"), "[1]");
    }
}
