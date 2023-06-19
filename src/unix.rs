use tauri::api::process::{Command};

/**
 * Get printers on linux using lp
 */
pub fn get_printers() -> String {
    let output = Command::new("powershell").args(["lpstat -e"]).output().unwrap();
    return output.stdout.to_string();
}