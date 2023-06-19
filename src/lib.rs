mod windows;
mod unix;
mod declare;
mod fsys;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

use std::env;

use crate::declare::ResultString;

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|create_temp_file')`.
fn create_temp_file(buffer_data: String, filename: String) -> String {
    let dir = env::temp_dir();
    let result = fsys::create_file_from_base64(buffer_data.as_str(), format!("{}{}", dir.display(),filename).as_str());
    if result.is_ok() {
      return format!("{}{}", dir.display(),filename);
    }
  return "".to_owned()
}


#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|create_temp_file')`.
fn remove_temp_file(filename: String) -> bool {
    let dir = env::temp_dir();
    let result = fsys::remove_file(format!("{}{}", dir.display(),filename).as_str());
    if result.is_ok() {
      return true;
    }
  return false
}

#[tauri::command]
// this will be accessible with `invoke('plugin:printer|get_printers')`.
fn get_printers() -> String {
    if cfg!(windows) {
        let result = ResultString{
            is_unix: false,
            data: windows::get_printers() 
        };

        return serde_json::to_string(&result).unwrap();
    }
    if cfg!(unix) {
        let result = ResultString{
            is_unix: true,
            data: unix::get_printers()
        };
        
        return serde_json::to_string(&result).unwrap();
    }

    panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|get_printer_by_name')`.
fn get_printers_by_name(printername: String) -> String {
  if cfg!(windows) {
      return windows::get_printers_by_name(printername);
  }

  panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|print_pdf')`.
fn print_pdf(
    id: String,
    path: String, 
    printer_setting_paper: String,
    printer_setting_method: String,
    printer_setting_scale: String,
    printer_setting_orientation: String,
    printer_setting_repeat: u8,
) -> String {
  if cfg!(windows) {
    let options = declare::PrintOptions{
        id,
        path,
        print_setting: declare::PrintSettings{
            paper: printer_setting_paper,
            method: printer_setting_method,
            scale: printer_setting_scale,
            orientation: printer_setting_orientation,
            repeat: printer_setting_repeat
        }
    };
    return windows::print_pdf(options);
  }

  panic!("Unsupported OS");
}


#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|get_jobs')`.
fn get_jobs(printername: String) -> String {
  if cfg!(windows) {
    return windows::get_jobs(printername);
  }
  panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|get_jobs_by_id')`.
fn get_jobs_by_id(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::get_jobs_by_id(printername, jobid);
  }
  panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|restart_job')`.
fn resume_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::resume_job(printername,jobid);
  }
  panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|restart_job')`.
fn restart_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::restart_job(printername,jobid);
  }
  panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|pause_job')`.
fn pause_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::pause_job(printername, jobid);
  }
  panic!("Unsupported OS");
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|remove_job')`.
fn remove_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::remove_job(printername, jobid);
  }
  panic!("Unsupported OS");
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  if cfg!(windows) {
    windows::init_windows();
  }
  Builder::new("printer")
    .invoke_handler(tauri::generate_handler![
      create_temp_file,
      remove_temp_file,
      get_printers, 
      get_printers_by_name,
      print_pdf,
      get_jobs,
      get_jobs_by_id,
      resume_job,
      restart_job,
      pause_job,
      remove_job
    ])
    .build()
}

