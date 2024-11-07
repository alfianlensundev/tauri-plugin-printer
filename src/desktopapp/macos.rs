pub async fn init() -> Result<bool, Box<dyn std::error::Error>>{
    Ok(true)
    // let sm = include_bytes!("../../bin/sm");
    // let dir: std::path::PathBuf = env::temp_dir();
    // let result: Result<(), std::io::Error>  = create_file(dir.display().to_string(),sm);
    // if result.is_err() {
    //     panic!("Gagal")
    // }
}

pub async fn get_printers() -> Result<Vec<crate::desktopapp::dto::PrinterItem>, Box<dyn std::error::Error>>{
    Ok(vec![])
}