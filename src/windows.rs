

// use std::process::{Command, Stdio};
use std::io::Write;
use std::fs::File;
use std::env;
use tauri::api::process::{Command};
use crate::declare::PrintOptions;
/**
 * Create sm.exe to temp
 */
 fn create_file(path: String, bin: &[u8]) -> std::io::Result<()> {
    let mut f = File::create(format!("{}sm.exe", path))?;
    f.write_all(bin)?;
  
    f.sync_all()?;
    Ok(())
  }

  
/**
 * init sm.exe
 */
pub fn init_windows() {
    let sm = include_bytes!("bin/sm.exe");
    let dir: std::path::PathBuf = env::temp_dir();
    let result: Result<(), std::io::Error>  = create_file(dir.display().to_string(),sm);
    if result.is_err() {
        panic!("Gagal")
    }
}

/**
 * Get printers on windows using powershell
 */
pub fn get_printers() -> String {
    let output = Command::new("powershell").args(["Get-Printer | ConvertTo-Json"]).output().unwrap();
    return output.stdout.to_string();
}

pub fn print_pdf (options: PrintOptions) -> String {
    let dir = env::temp_dir();
    let print_setting = format!(
                                    "-print-settings \"paper={},{},{},{}\" -print-settings \"{}x\"", 
                                    options.print_setting.paper,
                                    options.print_setting.method,
                                    options.print_setting.scale,
                                    options.print_setting.orientation,
                                    options.print_setting.repeat,
                                );
    let shell_command = format!("{}sm.exe -print-to {} {} -silent {}", dir.display(), options.id, print_setting, options.path);
    let output = Command::new("powershell").args([shell_command]).output().unwrap();
    return output.stdout.to_string();
}