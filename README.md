# Tauri Plugin Printer
Interface with printers through [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.3)

## Install
> If you are installing from npm and crate.io package registry, make sure the mayor and minor versions for both packages are the same, otherwise, the API may not match.

Crate: https://crates.io/crates/tauri-plugin-printer

Install latest version:

`cargo add tauri-plugin-printer`

Or add the following to your `Cargo.toml` for spesific version:

`src-tauri/Cargo.toml`

```toml
[dependencies]
tauri-plugin-printer = { version = "0.4.0" }
```

You can install the JavaScript Guest bindings using your preferred JavaScript package manager:

```sh
pnpm add tauri-plugin-printer
# or
npm add tauri-plugin-printer
# or
yarn add tauri-plugin-printer
```

## Usage

First you need to register the core plugin with Tauri:

`src-tauri/src/main.rs`

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_printer.init())  
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Afterwards all the plugin's APIs are available through the JavaScript guest bindings:

```javascript
import {printers, print_file, jobs, job, } from "tauri-plugin-printer";
// get list printers
const list = await printers()

// print pdf file
await print_file({
    id: "idfromlistprinter",
    path: 'F:/path/to/file.pdf',
    print_setting: {
        orientation: "landscape",
        method: "simplex", // duplex \ simplex | duplexshort
        paper: "A4", // "A2" | "A3" | "A4" | "A5" | "A6" | "letter" | "legal" | "tabloid"
        scale: "noscale", //"noscale" | "shrink" | "fit"
        repeat: 1 // "noscale" | "shrink" | "fit"
    }
})

// get all printer jobs
await jobs()

// get printer jobs by printer id 
await jobs(idprinter)

// get job by id
await job(id)

// get restart job by id
await restart_job(id)

// get pause job by id
await pause_job(id)

// get resume job by id
await resume_job(id)

// get resume job by id
await remove_job(id)

```


## Donate
[PayPal](https://paypal.me/alfianlensun)

[Saweria](https://saweria.co/alfianlensun)

## License
Code: (c) 2023 - Present Alfian Lensun.

MIT where applicable.