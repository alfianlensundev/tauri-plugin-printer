use std::{
    marker::PhantomData,
    path::{Path, PathBuf},
};

use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::{PrintJob, PrintResult, PrinterCapabilities, PrinterItem, Result};

#[cfg(target_os = "windows")]
macro_rules! platform {
    ($method:ident($($argument:expr),* $(,)?)) => {
        crate::desktopapp::windows::$method($($argument),*)
    };
}

#[cfg(not(target_os = "windows"))]
macro_rules! platform {
    ($method:ident($($argument:expr),* $(,)?)) => {{
        $(let _ = &$argument;)*
        Err(crate::Error::UnsupportedPlatform(std::env::consts::OS.into()))
    }};
}

pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> Result<Printer<R>> {
    #[cfg(target_os = "windows")]
    {
        Ok(Printer {
            executable: crate::desktopapp::windows::init()?,
            runtime: PhantomData,
        })
    }

    #[cfg(not(target_os = "windows"))]
    Err(crate::Error::UnsupportedPlatform(
        std::env::consts::OS.into(),
    ))
}

/// Rust-side access to the printer APIs.
pub struct Printer<R: Runtime> {
    executable: PathBuf,
    runtime: PhantomData<fn() -> R>,
}

impl<R: Runtime> Printer<R> {
    pub fn get_printers(&self) -> Result<Vec<PrinterItem>> {
        platform!(get_printers())
    }

    pub fn get_printer(&self, id: &str) -> Result<PrinterItem> {
        platform!(get_printer(id))
    }

    pub fn get_printer_by_name(&self, name: &str) -> Result<PrinterItem> {
        platform!(get_printer_by_name(name))
    }

    pub fn get_default_printer(&self) -> Result<Option<PrinterItem>> {
        platform!(get_default_printer())
    }

    pub fn set_default_printer(&self, name: &str) -> Result<PrinterItem> {
        platform!(set_default_printer(name))
    }

    pub fn get_printer_capabilities(&self, name: &str) -> Result<PrinterCapabilities> {
        platform!(get_printer_capabilities(name))
    }

    pub fn get_jobs(&self, printer_name: &str) -> Result<Vec<PrintJob>> {
        platform!(get_jobs(printer_name))
    }

    pub fn get_job(&self, printer_name: &str, job_id: i32) -> Result<PrintJob> {
        platform!(get_job(printer_name, job_id))
    }

    pub fn resume_job(&self, printer_name: &str, job_id: i32) -> Result<PrintResult> {
        platform!(resume_job(printer_name, job_id))
    }

    pub fn restart_job(&self, printer_name: &str, job_id: i32) -> Result<PrintResult> {
        platform!(restart_job(printer_name, job_id))
    }

    pub fn pause_job(&self, printer_name: &str, job_id: i32) -> Result<PrintResult> {
        platform!(pause_job(printer_name, job_id))
    }

    pub fn remove_job(&self, printer_name: &str, job_id: i32) -> Result<PrintResult> {
        platform!(remove_job(printer_name, job_id))
    }

    pub fn print_pdf(
        &self,
        printer_name: Option<&str>,
        path: &Path,
        settings: &str,
        remove_after_print: bool,
    ) -> Result<PrintResult> {
        platform!(print_pdf(
            &self.executable,
            printer_name,
            path,
            settings,
            remove_after_print
        ))
    }

    pub fn print_pdf_data(
        &self,
        printer_name: Option<&str>,
        data: &str,
        settings: &str,
    ) -> Result<PrintResult> {
        platform!(print_pdf_data(
            &self.executable,
            printer_name,
            data,
            settings
        ))
    }
}
