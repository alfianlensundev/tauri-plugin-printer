use std::{env, fs::File, io::Write, process::Command};

use crate::PrinterItem;
use base64::{Engine as _, engine::general_purpose};


pub async fn init() -> Result<bool, crate::Error>{
    let sm = include_bytes!("../../bin/sm");
    let dir = env::temp_dir();
    let mut f = File::create(format!("{}sm.exe", dir.display().to_string())).unwrap();
    f.write_all(sm)?;
    f.sync_all()?;
    Ok(true)
}

pub async fn get_printers() -> Result<Vec<crate::models::PrinterItem>, crate::Error>{
    let output = Command::new("powershell").args(["Get-Printer | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json"]).output().expect("Failed to execute PowerShell command");
    let output_str = String::from_utf8_lossy(&output.stdout);

    let printers: Vec<crate::models::PrinterRaw> = serde_json::from_str(&output_str).expect("Failed to parse printer data to JSON");

    let mut response_item = Vec::new();
    for printer in printers {
        let name: String = printer.name.unwrap_or("".to_owned());
        response_item.push(PrinterItem{
            id: general_purpose::STANDARD.encode(&name),
            computer_name: printer.computer_name,
            driver_name: printer.driver_name,
            job_count: printer.job_count,
            name,
            port_name: printer.port_name,
            print_processor: printer.print_processor,
            printer_status: printer.printer_status,
            printer_type: printer.printer_type,
            priority: printer.priority,
            share_name: printer.share_name,
            shared: printer.shared.unwrap_or(false),
        });
    }
    
    Ok(response_item)
}