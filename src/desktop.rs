
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::{desktopapp, PrinterItem};


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
  pub async fn get_printers(&self) -> crate::Result<Vec<PrinterItem>> {
    let os: String = std::env::consts::OS.to_string();

    if os == "windows" {
        return desktopapp::windows::get_printers().await;
    }
    if os == "macos" {
        return desktopapp::macos::get_printers().await;
    }
    println!("disini");
    Ok(vec![])
  }
}
