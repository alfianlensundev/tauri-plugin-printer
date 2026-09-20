# Tauri Plugin Printer v2

Printer discovery, PDF/HTML printing, printer configuration, and print-queue management for Tauri v2 on Windows.

> Version 2 is a clean Tauri v2 API. The old v1 functions (`printers`, `print`, `print_file`, `jobs`, and the snake_case job actions) are intentionally not exported.

## Features

- List printers and read one printer by its stable base64 id.
- Read or change the Windows default printer.
- Read color, collate, duplex, and paper configuration.
- Print an existing PDF path or in-memory PDF bytes.
- Render structured text, images, tables, QR codes, barcodes, or arbitrary HTML to PDF and print it.
- List, inspect, pause, resume, restart, and remove spooler jobs.
- Validate printer ids, job ids, PDF signatures, and command failures without panics.
- Tauri v2 permissions separated into read, print, queue-management, and default-printer-management groups.

Windows is currently the only supported platform. The bundled PDF renderer is SumatraPDF 3.4.6; see [Third-party software](#third-party-software).

## Install

Keep the Rust crate and JavaScript package on the same major and minor version.

```sh
cargo add tauri-plugin-printer@2.0.2
pnpm add tauri-plugin-printer@2.0.2
```

Register the plugin:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_printer::init())
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
```

## Permissions

Read-only commands are included in `printer:default`. Printing and mutations must be enabled explicitly in a capability:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "printer:default",
    "printer:printing",
    "printer:job-management",
    "printer:default-printer-management"
  ]
}
```

Only grant the groups that the application actually uses.

## Printer discovery and configuration

```ts
import {
  getPrinters,
  getPrinter,
  getDefaultPrinter,
  getPrinterCapabilities,
  setDefaultPrinter,
} from 'tauri-plugin-printer'

const printers = await getPrinters()
const printer = await getPrinter(printers[0].id)
const currentDefault = await getDefaultPrinter()
const capabilities = await getPrinterCapabilities(printer.id)

await setDefaultPrinter(printer.id)
// A name can be used explicitly too:
await setDefaultPrinter({ name: 'Office Printer' })
```

`get_printers`, `get_printer`, and `print_html` remain available because those names were already part of the in-progress v2 branch. They are not v1 compatibility aliases.

## Print a PDF

Printer selection is optional. If neither `id` nor `name` is supplied, the Windows default printer is used.

```ts
import { printFile } from 'tauri-plugin-printer'

await printFile({
  id: printer.id,
  path: 'C:\\documents\\invoice.pdf',
  print_setting: {
    paper: 'A4',
    orientation: 'portrait',
    method: 'simplex',
    scale: 'fit',
    color_type: 'monochrome',
    repeat: 1,
    range: { from: 1, to: 2 },
  },
})

const response = await fetch('/invoice.pdf')
await printFile({
  file: await response.arrayBuffer(),
  name: 'Office Printer',
})
```

The plugin never deletes a PDF path supplied by the application. In-memory PDFs use a plugin-owned temporary file that is removed after the renderer exits.

## Print HTML or structured receipt data

```ts
import { printData, printHtml } from 'tauri-plugin-printer'

await printData(
  [
    { type: 'text', value: 'Receipt #1042', style: { fontSize: '20px', fontWeight: '700' } },
    { type: 'qrCode', value: 'https://example.com/orders/1042', width: 96, height: 96 },
    {
      type: 'table',
      tableHeader: ['Item', 'Total'],
      tableBody: [['Coffee', '$4.00'], ['Cake', '$6.00']],
      tableFooter: ['Grand total', '$10.00'],
    },
  ],
  { id: printer.id, page_size: { width: 300, height: 500 } },
)

await printHtml('<h1>Shipping label</h1><p>Order #1042</p>', {
  name: 'Label Printer',
  page_size: { width: 400, height: 600 },
})
```

Set `preview: true` to open a preview Webview instead of submitting a print job. Preview-window creation may require the corresponding Tauri core webview permission in the application.

## Print queue

```ts
import { getJobs, getJob, pauseJob, resumeJob, restartJob, removeJob } from 'tauri-plugin-printer'

const allJobs = await getJobs()
const printerJobs = await getJobs(printer.id)
const selected = await getJob(printerJobs[0].id)

await pauseJob(selected.id)
await resumeJob(selected.id)
await restartJob(selected.id)
await removeJob(selected.id)
```

Calling a job action without an id applies it to every currently visible print job.

## Why PDF, and when not to use it

PDF is the best general-purpose route for invoices, labels, reports, and documents because it preserves layout and delegates device-specific work to the Windows driver.

For high-volume thermal/POS printers, RAW ESC/POS, ZPL, or CPCL is faster and produces sharper device-native text and barcodes. It is not included in this release because raw bytes are printer-language-specific and need a separate high-risk permission. A future `printRaw` API should target the Windows spooler directly and require the caller to declare the printer language.

## Third-party software

The bundled `bin/sm` executable is SumatraPDF 3.4.6, used for unattended PDF printing. SumatraPDF is distributed under GPLv3/AGPLv3 terms; downstream distributors are responsible for satisfying those terms. See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## License

Plugin source code is MIT licensed. See [LICENSE](LICENSE).
