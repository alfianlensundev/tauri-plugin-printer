const COMMANDS: &[&str] = &["get_printers"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .build();
}
