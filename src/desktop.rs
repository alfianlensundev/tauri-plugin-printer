use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Manager, Runtime};

use crate::{desktopapp, PingRequest, PingResponse};


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
  
  println!("{}", os == "macos");
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
  pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    Ok(PingResponse {
      value: payload.value,
    })
  }
}
