const COMMANDS: &[&str] = &["get_printers", "get_printer"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .build();
}
