
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::{desktopapp, PrinterItem, ResponseError, ResponseOk, ResponseResult};


pub async fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<Printer<R>> {
  let os = std::env::consts::OS.to_string();

  if os == "windows" {
    match desktopapp::windows::init().await {
        Ok(_) => println!("Success load windows lib"),
        Err(_) => println!("Fail to load windows lib"),
    };
  }
  if os == "macos" {
    match desktopapp::macos::init().await {
      Ok(_) => println!("Success load macos lib"),
      Err(_) => println!("Fail to load macos lib"),
    };
  }

  Ok(Printer(app.clone()))
}

/// Access to the printer APIs.
pub struct Printer<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Printer<R> {
  pub async fn get_printers(&self) -> crate::Result<ResponseResult<Vec<PrinterItem>>> {
    let os: String = std::env::consts::OS.to_string();

    if os == "windows" {
        return match desktopapp::windows::get_printers().await {
            Ok(data) => Ok(ResponseResult::Success(ResponseOk{
                data
            })), 
            Err(e) => Ok(ResponseResult::Error(ResponseError{
                error: format!("{}", e)
            }))
        }
    }
    if os == "macos" {
        return match desktopapp::macos::get_printers().await {
            Ok(data) => Ok(ResponseResult::Success(ResponseOk{
                data
            })), 
            Err(e) => Ok(ResponseResult::Error(ResponseError{
                error: format!("{}", e)
            }))
        }
    }

    panic!("This plugin is not yet available for this operating system")
  }


  pub async fn get_printer(&self, id: String) -> crate::Result<ResponseResult<PrinterItem>> {
    let os: String = std::env::consts::OS.to_string();

    if os == "windows" {
        return match desktopapp::windows::get_printer(id).await {
            Ok(data) => Ok(ResponseResult::Success(ResponseOk{
                data
            })), 
            Err(e) => Ok(ResponseResult::Error(ResponseError{
                error: format!("{}", e)
            }))
        }
    }
    if os == "macos" {
        // return match desktopapp::macos::get_printers_by_id(id).await {
        //     Ok(data) => Ok(ResponseResult::Success(ResponseOk{
        //         data
        //     })), 
        //     Err(e) => Ok(ResponseResult::Error(ResponseError{
        //         error: format!("{}", e)
        //     }))
        // }
    }

    panic!("This plugin is not yet available for this operating system")
  }
}
