use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

#[cfg(desktop)]
use tauri::Manager;

pub use models::*;

#[cfg(desktop)]
mod desktop;

#[cfg(desktop)]
mod commands;
#[cfg(desktop)]
mod desktopapp;
mod error;
mod models;
pub use error::{Error, Result};

#[cfg(desktop)]
pub use desktop::Printer;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the printer APIs.
#[cfg(desktop)]
pub trait PrinterExt<R: Runtime> {
    fn printer(&self) -> &Printer<R>;
}

#[cfg(desktop)]
impl<R: Runtime, T: Manager<R>> crate::PrinterExt<R> for T {
    fn printer(&self) -> &Printer<R> {
        self.state::<Printer<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let builder = Builder::new("printer");

    #[cfg(desktop)]
    let builder = builder
        .invoke_handler(tauri::generate_handler![
            commands::get_printers,
            commands::get_printer,
            commands::get_default_printer,
            commands::set_default_printer,
            commands::get_printer_capabilities,
            commands::get_jobs,
            commands::get_job,
            commands::resume_job,
            commands::restart_job,
            commands::pause_job,
            commands::remove_job,
            commands::print_pdf,
            commands::print_pdf_data,
        ])
        .setup(|app, api| {
            let printer = desktop::init(app, api)?;
            app.manage(printer);
            Ok(())
        });

    builder.build()
}
