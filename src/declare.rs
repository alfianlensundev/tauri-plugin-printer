
use serde::{Serialize};

pub struct  PrintSettings {
    pub paper: String,
    pub method: String,
    pub scale: String,
    pub orientation: String,
    pub repeat: u8
}

pub struct PrintOptions {
    pub id: String,
    pub path: String,
    pub print_setting: PrintSettings,
}

#[derive(Serialize)]
pub struct ResultString {
    pub is_unix: bool,
    pub data: String
}