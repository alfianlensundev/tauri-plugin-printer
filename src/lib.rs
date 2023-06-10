mod windows;
mod declare;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

#[tauri::command]
// this will be accessible with `invoke('plugin:printer|get_printers')`.
fn get_printers() -> String {
  if cfg!(windows) {
      return windows::get_printers();
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
      get_printers, 
      print_pdf,
      get_jobs,
      restart_job,
      pause_job,
      remove_job
    ])
    .build()
}

