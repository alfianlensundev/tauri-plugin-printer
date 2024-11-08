

use tauri::{command, AppHandle, Runtime};
use crate::{PrinterExt, PrinterItem, RequestPayload, ResponseResult, Result};

#[command]
pub(crate) async fn get_printers<R: Runtime>(
    app: AppHandle<R>,
) -> Result<ResponseResult<Vec<PrinterItem>>> {
    app.printer().get_printers().await 
}


#[command]
pub(crate) async fn get_printer<R: Runtime>(
    app: AppHandle<R>,
    payload: RequestPayload<String>
) -> Result<ResponseResult<PrinterItem>> {
    app.printer().get_printer(payload.value).await 
}
