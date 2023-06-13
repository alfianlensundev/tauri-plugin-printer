
use std::fs::{File, remove_file as rmf};

use std::io::Write;
use std::path::Path;
use base64::{Engine as _, engine::{general_purpose}};


pub fn create_file_from_base64(base64_string: &str, file_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Decode the base64 string into bytes
    let mut buffer = Vec::<u8>::new();
    // with the default engine
    general_purpose::STANDARD
        .decode_vec(base64_string, &mut buffer,).unwrap();

    // Create a file at the specified path
    let path = Path::new(file_path);
    let mut file = File::create(&path)?;

    // Write the decoded bytes to the file
    file.write_all(&buffer)?;

    Ok(())
}

pub fn remove_file (file_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    rmf(file_path)?;
    Ok(())
}