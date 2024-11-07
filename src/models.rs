use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingRequest {
  pub value: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResponse {
  pub value: Option<String>,
}



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
    pub priority: Option<i32>
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PrinterRaw {
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
}