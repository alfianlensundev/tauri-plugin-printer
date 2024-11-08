use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;

mod commands;
mod error;
mod models;
mod desktopapp;
pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Printer;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the printer APIs.
pub trait PrinterExt<R: Runtime> {
  fn printer(&self) -> &Printer<R>;
}

impl<R: Runtime, T: Manager<R>> crate::PrinterExt<R> for T {
  fn printer(&self) -> &Printer<R> {
    self.state::<Printer<R>>().inner()
  }
}


/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("printer")
    .invoke_handler(tauri::generate_handler![commands::get_printers, commands::get_printer])
    .setup(|app, api| {
      #[cfg(desktop)]
      let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");

      rt.block_on(async {
        let printer = desktop::init(app, api).await.unwrap();
        app.manage(printer);
      });
      
      Ok(())
    })
    .build()
}
