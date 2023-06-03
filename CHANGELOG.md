# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.



### WIP
- method `add_printer` (*Used for printer*)
- method `remove_printer` (*Used for remove printer*)

## v0.4.0
[Compare changes](https://github.com/alfianlensundev/tauri-plugin-printer/compare/v0.2.6...v0.3.0)

### Added

#### Spesifik Windows
- add method `jobs` (*Used for get printer jobs*)
- add method `job` (*Used for get printer job by id*)
- add method `restart_job` (*Used restart printer job*) 
- add method `pause_job` (*Used pause printer job*) 
- add method `resume_job` (*Used resume printer job*) 
- add method `remove_job` (*Used remove printer job*)


## v0.3.0
[Compare changes](https://github.com/alfianlensundev/tauri-plugin-printer/compare/v0.2.6...v0.3.0)

### Breaking
- remove print_pdf
- remove printer_list

### Added

#### Spesifik Windows
- add method `print_file` (*Used for print file*)
- add method `printers` (*Used for get list printers*)  

