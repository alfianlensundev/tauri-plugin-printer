const COMMANDS: &[&str] = &[
    "get_printers",
    "get_printer",
    "get_default_printer",
    "set_default_printer",
    "get_printer_capabilities",
    "get_jobs",
    "get_job",
    "resume_job",
    "restart_job",
    "pause_job",
    "remove_job",
    "print_pdf",
    "print_pdf_data",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
