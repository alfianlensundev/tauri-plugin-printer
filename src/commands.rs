

use tauri::{AppHandle, command, Runtime};
use crate::{PrinterExt, PrinterItem, Result};

#[command]
pub(crate) async fn get_printers<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<PrinterItem>> {
    app.printer().get_printers().await
}
