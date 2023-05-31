mod windows;
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
fn print_pdf(path: String, printer_name: String) -> String {
  if cfg!(windows) {
      return windows::print_pdf(path, printer_name);
  }

  panic!("Unsupported OS");
}


pub fn init<R: Runtime>() -> TauriPlugin<R> {
  if cfg!(windows) {
    windows::init_windows();
}
  Builder::new("printer")
    .invoke_handler(tauri::generate_handler![get_printers, print_pdf])
    .build()
}

