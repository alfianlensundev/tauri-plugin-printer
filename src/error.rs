use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Base64(#[from] base64::DecodeError),
    #[error(transparent)]
    Utf8(#[from] std::string::FromUtf8Error),
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("printer command failed: {0}")]
    CommandFailed(String),
    #[error("printer was not found: {0}")]
    PrinterNotFound(String),
    #[error("tauri-plugin-printer is not supported on {0}")]
    UnsupportedPlatform(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
