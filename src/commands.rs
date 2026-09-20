use tauri::{command, AppHandle, Runtime};

use crate::{
    Error, IdPayload, JobPayload, PrintJob, PrintPdfDataPayload, PrintPdfPayload, PrintResult,
    PrinterCapabilities, PrinterExt, PrinterItem, PrinterNamePayload, Result,
};

async fn blocking<T, F>(task: F) -> Result<T>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|error| Error::CommandFailed(format!("printer task failed: {error}")))?
}

#[command]
pub(crate) async fn get_printers<R: Runtime>(app: AppHandle<R>) -> Result<Vec<PrinterItem>> {
    blocking(move || app.printer().get_printers()).await
}

#[command]
pub(crate) async fn get_printer<R: Runtime>(
    app: AppHandle<R>,
    payload: IdPayload,
) -> Result<PrinterItem> {
    blocking(move || app.printer().get_printer(&payload.value)).await
}

#[command]
pub(crate) async fn get_default_printer<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Option<PrinterItem>> {
    blocking(move || app.printer().get_default_printer()).await
}

#[command]
pub(crate) async fn set_default_printer<R: Runtime>(
    app: AppHandle<R>,
    payload: PrinterNamePayload,
) -> Result<PrinterItem> {
    blocking(move || app.printer().set_default_printer(&payload.printer_name)).await
}

#[command]
pub(crate) async fn get_printer_capabilities<R: Runtime>(
    app: AppHandle<R>,
    payload: PrinterNamePayload,
) -> Result<PrinterCapabilities> {
    blocking(move || {
        app.printer()
            .get_printer_capabilities(&payload.printer_name)
    })
    .await
}

#[command]
pub(crate) async fn get_jobs<R: Runtime>(
    app: AppHandle<R>,
    payload: PrinterNamePayload,
) -> Result<Vec<PrintJob>> {
    blocking(move || app.printer().get_jobs(&payload.printer_name)).await
}

#[command]
pub(crate) async fn get_job<R: Runtime>(
    app: AppHandle<R>,
    payload: JobPayload,
) -> Result<PrintJob> {
    blocking(move || app.printer().get_job(&payload.printer_name, payload.job_id)).await
}

#[command]
pub(crate) async fn resume_job<R: Runtime>(
    app: AppHandle<R>,
    payload: JobPayload,
) -> Result<PrintResult> {
    blocking(move || {
        app.printer()
            .resume_job(&payload.printer_name, payload.job_id)
    })
    .await
}

#[command]
pub(crate) async fn restart_job<R: Runtime>(
    app: AppHandle<R>,
    payload: JobPayload,
) -> Result<PrintResult> {
    blocking(move || {
        app.printer()
            .restart_job(&payload.printer_name, payload.job_id)
    })
    .await
}

#[command]
pub(crate) async fn pause_job<R: Runtime>(
    app: AppHandle<R>,
    payload: JobPayload,
) -> Result<PrintResult> {
    blocking(move || {
        app.printer()
            .pause_job(&payload.printer_name, payload.job_id)
    })
    .await
}

#[command]
pub(crate) async fn remove_job<R: Runtime>(
    app: AppHandle<R>,
    payload: JobPayload,
) -> Result<PrintResult> {
    blocking(move || {
        app.printer()
            .remove_job(&payload.printer_name, payload.job_id)
    })
    .await
}

#[command]
pub(crate) async fn print_pdf<R: Runtime>(
    app: AppHandle<R>,
    payload: PrintPdfPayload,
) -> Result<PrintResult> {
    blocking(move || {
        app.printer().print_pdf(
            payload.printer_name.as_deref(),
            payload.path.as_ref(),
            &payload.settings,
            payload.remove_after_print,
        )
    })
    .await
}

#[command]
pub(crate) async fn print_pdf_data<R: Runtime>(
    app: AppHandle<R>,
    payload: PrintPdfDataPayload,
) -> Result<PrintResult> {
    blocking(move || {
        app.printer().print_pdf_data(
            payload.printer_name.as_deref(),
            &payload.data,
            &payload.settings,
        )
    })
    .await
}
