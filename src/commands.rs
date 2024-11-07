use tauri::{AppHandle, command, Runtime};

use crate::desktopapp::dto::PrinterItem;
use crate::models::*;
use crate::Result;
use crate::PrinterExt;

#[command]
pub(crate) async fn get_printers<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<PrinterItem>> {
    app.printer().get_printers().await
}
