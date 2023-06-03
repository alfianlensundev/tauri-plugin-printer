# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v0.3.0
[Compare changes](https://github.com/alfianlensundev/tauri-plugin-printer/compare/v0.2.6...v0.3.0)

### Breaking
- remove print_pdf
- remove printer_list

### Added

#### Spesifik Windows
- add method `add_printer` (*Used for add printer*)
- add method `remove_printer` (*Used for remove printer*)
- add method `print_file` (*Used for print file*)
- add method `printers` (*Used for get list printers*)  
- add method `job` (*Used for get printer job*)
- add method `restart_job` (*Used for restart printer job*)
- add method `resume_job` (*Used for resume printer job*)
- add method `remove_job` (*Used for remove printer job*)
