use std::{env, fs::File, io::Write, process::Command, vec};

use crate::PrinterItem;
use base64::{Engine as _, engine::general_purpose};
use sysinfo::System;


pub async fn init() -> Result<bool, crate::Error>{
    let sm = include_bytes!("../../bin/sm");
    let dir = env::temp_dir();
    let mut f = File::create(format!("{}sm.exe", dir.display().to_string())).unwrap();
    f.write_all(sm)?;
    f.sync_all()?;
    Ok(true)
}

pub async fn get_printers() -> Result<Vec<crate::models::PrinterItem>, crate::Error>{
    let output = Command::new("powershell")
        .args(["Get-Printer | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json"])
        .output()
        .expect("Failed to execute PowerShell command");
    
    let output_str = String::from_utf8_lossy(&output.stdout);

    let printers: Vec<crate::models::PrinterRaw> = match serde_json::from_str(&output_str) {
        Ok(list_printer) => list_printer,
        Err(_) => {
            let single_printer: crate::models::PrinterRaw = serde_json::from_str(&output_str).expect("Failed to parse string");
            vec![single_printer]
        }
    };

    let mut response_item = Vec::new();
    
    for printer in printers {
        let name: String = printer.name.unwrap_or("".to_owned());
        let mut printer_data = PrinterItem{
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
        };

        if printer.shared.unwrap() == false {
            printer_data.computer_name = System::host_name();
        }
        
        response_item.push(printer_data);
    }
    
    Ok(response_item)
}


pub async fn get_printer(id: String) -> Result<crate::models::PrinterItem, crate::Error>{
    let findnamebuf = general_purpose::STANDARD.decode(id).expect("The printer ID does not match");
    let findname = String::from_utf8(findnamebuf).expect("The printer ID does not match");

    let output = Command::new("powershell").args([format!("Get-Printer -Name \"{}\" | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json", findname)]).output().expect("Failed to execute PowerShell command");
    let output_str = String::from_utf8_lossy(&output.stdout);

    let printer: crate::models::PrinterRaw = serde_json::from_str(&output_str).expect("Failed to parse printer data to JSON");
    
    let name: String = printer.name.unwrap_or("".to_owned());
    let mut printer_data = PrinterItem{
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
    };

    if printer.shared.unwrap() == false {
        printer_data.computer_name = System::host_name();
    }
    Ok(printer_data)
}