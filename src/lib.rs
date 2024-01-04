mod windows;
mod declare;
mod fsys;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

use std::env;

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
      return windows::get_printers();
  }

  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|get_printer_by_name')`.
fn get_printers_by_name(printername: String) -> String {
  if cfg!(windows) {
      return windows::get_printers_by_name(printername);
  }

  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|print_pdf')`.
fn print_pdf(
    id: String,
    path: String, 
    printer_setting: String
) -> String {
  if cfg!(windows) {
    let options = declare::PrintOptions{
        id,
        path,
        print_setting: printer_setting,
        remove_after_print: false
    };
    return windows::print_pdf(options);
  }

  return "Unsupported OS".to_string();
}


#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|get_jobs')`.
fn get_jobs(printername: String) -> String {
  if cfg!(windows) {
    return windows::get_jobs(printername);
  }
  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|get_jobs_by_id')`.
fn get_jobs_by_id(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::get_jobs_by_id(printername, jobid);
  }
  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|restart_job')`.
fn resume_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::resume_job(printername,jobid);
  }
  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|restart_job')`.
fn restart_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::restart_job(printername,jobid);
  }
  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|pause_job')`.
fn pause_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::pause_job(printername, jobid);
  }
  return "Unsupported OS".to_string();
}

#[tauri::command(rename_all = "snake_case")]
// this will be accessible with `invoke('plugin:printer|remove_job')`.
fn remove_job(printername: String, jobid: String) -> String {
  if cfg!(windows) {
    return windows::remove_job(printername, jobid);
  }
  return "Unsupported OS".to_string();
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

