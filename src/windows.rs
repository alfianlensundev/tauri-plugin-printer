

// use std::process::{Command, Stdio};
use std::{sync::mpsc, io::Write};
use std::thread;
use std::fs::File;
use std::env;
use tauri::api::process::Command;
use crate::{declare::PrintOptions, fsys::remove_file};
/**
 * Create sm.exe to temp
 */
fn create_file(path: String, bin: &[u8]) -> std::io::Result<()> {
    let mut f = File::create(format!("{}sm.exe", path))?;
    f.write_all(bin)?;
  
    f.sync_all()?;
    Ok(())
}

  
/**
 * init sm.exe
 */
pub fn init_windows() {
    let sm = include_bytes!("bin/sm");
    let dir: std::path::PathBuf = env::temp_dir();
    let result: Result<(), std::io::Error>  = create_file(dir.display().to_string(),sm);
    if result.is_err() {
        panic!("Gagal")
    }
}

/**
 * Get printers on windows using powershell
 */
pub fn get_printers() -> String {
    // Create a channel for communication
    let (sender, receiver) = mpsc::channel();

    // Spawn a new thread
    thread::spawn(move || {
        let output: tauri::api::process::Output = Command::new("powershell").args(["Get-Printer | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json"]).output().unwrap();

        sender.send(output.stdout.to_string()).unwrap();
    });

    // Do other non-blocking work on the main thread

    // Receive the result from the spawned thread
    let result: String = receiver.recv().unwrap();


    return result
}

/**
 * Get printers by name on windows using powershell
 */
pub fn get_printers_by_name(printername: String) -> String {
    let output = Command::new("powershell").args([format!("Get-Printer -Name \"{}\" | Select-Object Name, DriverName, JobCount, PrintProcessor, PortName, ShareName, ComputerName, PrinterStatus, Shared, Type, Priority | ConvertTo-Json", printername)]).output().unwrap();
    return output.stdout.to_string();
}

/**
 * Print pdf file 
 */
pub fn print_pdf (options: PrintOptions) -> String {
    let dir: std::path::PathBuf = env::temp_dir();
    let print_setting: String = options.print_setting;
    let mut print: String = "-print-to-default".to_owned();
    if options.id.len() == 0 {
        print = format!("-print-to {}", options.id).to_owned();
    }
    let shell_command = format!("{}sm.exe {} {} -silent {}", dir.display(), print, print_setting, options.path);
    

    // Create a channel for communication
    let (sender, receiver) = mpsc::channel();
    println!("{}", shell_command);
    // Spawn a new thread
    thread::spawn(move || {
        let output: tauri::api::process::Output = Command::new("powershell").args([shell_command]).output().unwrap();

        sender.send(output.stdout.to_string()).unwrap();
    });

    // Do other non-blocking work on the main thread

    // Receive the result from the spawned thread
    let result = receiver.recv().unwrap();
    
    

    if options.remove_after_print == true {
        let _ = remove_file(&options.path);
    }
    
    return result;
}


/**
 * Get printer job on windows using powershell
 */
pub fn get_jobs(printername: String) -> String {
    let output = Command::new("powershell").args([format!("Get-PrintJob -PrinterName \"{}\"  | Select-Object DocumentName,Id,TotalPages,Position,Size,SubmmitedTime,UserName,PagesPrinted,JobTime,ComputerName,Datatype,PrinterName,Priority,SubmittedTime,JobStatus | ConvertTo-Json", printername)]).output().unwrap();
    return output.stdout.to_string();
}

/**
 * Get printer job by id on windows using powershell
 */
pub fn get_jobs_by_id(printername: String, jobid: String) -> String {
    let output = Command::new("powershell").args([format!("Get-PrintJob -PrinterName \"{}\" -ID \"{}\"  | Select-Object DocumentName,Id,TotalPages,Position,Size,SubmmitedTime,UserName,PagesPrinted,JobTime,ComputerName,Datatype,PrinterName,Priority,SubmittedTime,JobStatus | ConvertTo-Json", printername, jobid)]).output().unwrap();
    return output.stdout.to_string();
}


/**
 * Resume printers job on windows using powershell
 */
pub fn resume_job(printername: String, jobid: String) -> String {
    let output = Command::new("powershell").args([format!("Resume-PrintJob -PrinterName \"{}\" -ID \"{}\" ", printername, jobid)]).output().unwrap();
    return output.stdout.to_string();
}

/**
 * Restart printers job on windows using powershell
 */
pub fn restart_job(printername: String, jobid: String) -> String {
    let output = Command::new("powershell").args([format!("Restart-PrintJob -PrinterName \"{}\" -ID \"{}\" ", printername, jobid)]).output().unwrap();
    return output.stdout.to_string();
}

/**
 * pause printers job on windows using powershell
 */
pub fn pause_job(printername: String, jobid: String) -> String {
    let output = Command::new("powershell").args([format!("Suspend-PrintJob -PrinterName \"{}\" -ID \"{}\" ", printername, jobid)]).output().unwrap();
    return output.stdout.to_string();
}

/**
 * remove printers job on windows using powershell
 */
pub fn remove_job(printername: String, jobid: String) -> String {
    let output = Command::new("powershell").args([format!("Remove-PrintJob -PrinterName \"{}\" -ID \"{}\" ", printername, jobid)]).output().unwrap();
    return output.stdout.to_string();
}