use std::collections::vec_deque;

use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::{desktopapp::{self, dto::PrinterItem}, PingRequest, PingResponse};


pub async fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<Printer<R>> {
  let os = std::env::consts::OS.to_string();

  if os == "windows" {
    match desktopapp::windows::init().await {
        Ok(_) => print!("Success load windows lib"),
        Err(_) => print!("Fail to load windows lib"),
    };
  }
  if os == "macos" {
    match desktopapp::macos::init().await {
      Ok(_) => print!("Success load macos lib"),
      Err(_) => print!("Fail to load macos lib"),
    };
  }

  Ok(Printer(app.clone()))
}

/// Access to the printer APIs.
pub struct Printer<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Printer<R> {
  pub async fn get_printers(&self) -> crate::Result<Vec<PrinterItem>> {
    let os: String = std::env::consts::OS.to_string();
    // if os == "windows" {
    //   match desktopapp::windows::init().await {
    //       Ok(_) => print!("Success load windows lib"),
    //       Err(_) => print!("Fail to load windows lib"),
    //   };
    // }
    if os == "macos" {
      let printers = desktopapp::macos::get_printers().await.unwrap();
      return Ok(printers)
    }
    Ok(vec![])
  }
}
