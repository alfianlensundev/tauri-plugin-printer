use std::env;

pub async fn init() -> Result<bool, Box<dyn std::error::Error>>{
    print!("OK");
    Ok(true)
    // let sm = include_bytes!("../../bin/sm");
    // let dir: std::path::PathBuf = env::temp_dir();
    // let result: Result<(), std::io::Error>  = create_file(dir.display().to_string(),sm);
    // if result.is_err() {
    //     panic!("Gagal")
    // }
}