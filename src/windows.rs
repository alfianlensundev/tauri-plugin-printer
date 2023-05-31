

use std::process::Command;
use std::str;
use std::io::Write;
use std::fs::File;
use std::env;
use std::os::windows::process::CommandExt;


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
    let result  = create_file(dir.display().to_string(),sm);
    if result.is_err() {
        panic!("Gagal")
    }
}

/**
 * Get printers on windows using powershell
 */
pub fn get_printers() -> String {
    let command = Command::new("powershell")
        .arg("-Command")
        .arg("Get-Printer | ConvertTo-Json")
        .creation_flags(0x00000008)
        .output()
        .unwrap();
    let out_str = str::from_utf8(&command.stdout).unwrap();
    return out_str.to_string();
}

pub fn print_pdf(path: String, printer_name: String) -> String {
    let dir = env::temp_dir();
    let command = Command::new("powershell")
                                    .arg("-Command")
                                    .arg(format!("{}sm.exe -print-to {} -silent {}", dir.display(), printer_name, path))
                                    .creation_flags(0x00000008)
                                    .output()
                                    .unwrap();

    let out_str = str::from_utf8(&command.stdout).unwrap();

    return out_str.to_string();

}

