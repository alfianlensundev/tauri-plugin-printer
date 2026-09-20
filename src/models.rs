use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct PrinterItem {
    pub id: String,
    pub name: String,
    pub driver_name: Option<String>,
    pub job_count: Option<i32>,
    pub print_processor: Option<String>,
    pub port_name: Option<String>,
    pub share_name: Option<String>,
    pub computer_name: Option<String>,
    pub printer_status: Option<i32>,
    pub shared: bool,
    pub printer_type: Option<i32>,
    pub priority: Option<i32>,
    pub is_default: bool,
}

#[derive(Debug, Deserialize)]
#[cfg(target_os = "windows")]
pub(crate) struct PrinterRaw {
    #[serde(rename = "Name")]
    pub name: Option<String>,
    #[serde(rename = "DriverName")]
    pub driver_name: Option<String>,
    #[serde(rename = "JobCount")]
    pub job_count: Option<i32>,
    #[serde(rename = "PrintProcessor")]
    pub print_processor: Option<String>,
    #[serde(rename = "PortName")]
    pub port_name: Option<String>,
    #[serde(rename = "ShareName")]
    pub share_name: Option<String>,
    #[serde(rename = "ComputerName")]
    pub computer_name: Option<String>,
    #[serde(rename = "PrinterStatus")]
    pub printer_status: Option<i32>,
    #[serde(rename = "Shared")]
    pub shared: Option<bool>,
    #[serde(rename = "Type")]
    pub printer_type: Option<i32>,
    #[serde(rename = "Priority")]
    pub priority: Option<i32>,
    #[serde(rename = "IsDefault")]
    pub is_default: Option<bool>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct PrintJob {
    pub id: String,
    pub job_id: i32,
    pub document_name: Option<String>,
    pub total_pages: Option<i32>,
    pub position: Option<i32>,
    pub size: Option<i64>,
    pub username: Option<String>,
    pub pages_printed: Option<i32>,
    pub job_time: Option<i64>,
    pub computer_name: Option<String>,
    pub data_type: Option<String>,
    pub printer_name: String,
    pub priority: Option<i32>,
    pub submitted_time: Option<String>,
    pub job_status: i32,
}

#[derive(Debug, Deserialize)]
#[cfg(target_os = "windows")]
pub(crate) struct PrintJobRaw {
    #[serde(rename = "DocumentName")]
    pub document_name: Option<String>,
    #[serde(rename = "Id")]
    pub id: Option<i32>,
    #[serde(rename = "TotalPages")]
    pub total_pages: Option<i32>,
    #[serde(rename = "Position")]
    pub position: Option<i32>,
    #[serde(rename = "Size")]
    pub size: Option<i64>,
    #[serde(rename = "UserName")]
    pub username: Option<String>,
    #[serde(rename = "PagesPrinted")]
    pub pages_printed: Option<i32>,
    #[serde(rename = "JobTime")]
    pub job_time: Option<i64>,
    #[serde(rename = "ComputerName")]
    pub computer_name: Option<String>,
    #[serde(rename = "Datatype")]
    pub data_type: Option<String>,
    #[serde(rename = "PrinterName")]
    pub printer_name: Option<String>,
    #[serde(rename = "Priority")]
    pub priority: Option<i32>,
    #[serde(rename = "SubmittedTime")]
    pub submitted_time: Option<String>,
    #[serde(rename = "JobStatus")]
    pub job_status: Option<i32>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct PrinterCapabilities {
    pub printer_name: String,
    pub color: Option<bool>,
    pub collate: Option<bool>,
    pub duplexing_mode: Option<String>,
    pub paper_size: Option<String>,
}

#[derive(Debug, Deserialize)]
#[cfg(target_os = "windows")]
pub(crate) struct PrinterCapabilitiesRaw {
    #[serde(rename = "PrinterName")]
    pub printer_name: Option<String>,
    #[serde(rename = "Color")]
    pub color: Option<bool>,
    #[serde(rename = "Collate")]
    pub collate: Option<bool>,
    #[serde(rename = "DuplexingMode")]
    pub duplexing_mode: Option<String>,
    #[serde(rename = "PaperSize")]
    pub paper_size: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct PrintResult {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub(crate) struct IdPayload {
    pub value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PrinterNamePayload {
    pub printer_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct JobPayload {
    pub printer_name: String,
    pub job_id: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PrintPdfPayload {
    pub printer_name: Option<String>,
    pub path: String,
    #[serde(default)]
    pub settings: String,
    #[serde(default)]
    pub remove_after_print: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PrintPdfDataPayload {
    pub printer_name: Option<String>,
    pub data: String,
    #[serde(default)]
    pub settings: String,
}
