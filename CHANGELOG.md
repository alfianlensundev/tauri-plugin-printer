# Changelog

## 2.0.0

### Breaking changes

- Migrated the Rust plugin and permissions to Tauri v2.
- Removed the Tauri v1 JavaScript API. Use `getPrinters`, `getPrinter`, `printData`, `printFile`, `getJobs`, `getJob`, `restartJob`, `pauseJob`, `resumeJob`, and `removeJob`.
- Windows is now reported as the only supported platform instead of returning placeholder macOS data.
- Printing and mutating the spooler require explicit Tauri capability permissions.

### Added

- Default-printer discovery and mutation.
- Printer capability discovery.
- PDF path and in-memory PDF printing.
- HTML, QR code, barcode, image, text, and table rendering.
- Typed print jobs with composite status support.
- Page range, paper, duplex, scaling, orientation, color, copies, collate, tray, centering, and odd/even settings.
- Structured errors, safe temporary files, renderer exit-code handling, and non-blocking Tauri commands.

### Fixed

- Removed panics and unchecked `unwrap` calls from printer operations.
- Prevented PowerShell injection through printer names and job ids.
- Prevented deletion of application-owned source PDFs.
- Corrected the Windows job status name for code `512` to `Blocked`.
