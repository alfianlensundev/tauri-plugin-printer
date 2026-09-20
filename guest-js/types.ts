export type ScaleOption = 'noscale' | 'shrink' | 'fit' | 'stretch'
export type MethodOption = 'duplex' | 'duplexshort' | 'duplexlong' | 'simplex'
export type PaperOption = 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'letter' | 'legal' | 'tabloid' | 'statement' | 'auto'
export type OrientationOption = 'portrait' | 'landscape'
export type ColorType = 'color' | 'monochrome'

export interface Printer {
  id: string
  name: string
  driver_name?: string | null
  job_count?: number | null
  print_processor?: string | null
  port_name?: string | null
  share_name?: string | null
  computer_name?: string | null
  printer_status?: number | null
  shared: boolean
  printer_type?: number | null
  /** Compatibility alias for the Tauri v1 API. */
  type?: number | null
  priority?: number | null
  is_default: boolean
}

export interface PrinterCapabilities {
  printer_name: string
  color?: boolean | null
  collate?: boolean | null
  duplexing_mode?: string | null
  paper_size?: string | null
}

export interface RangeOptions {
  from: number
  to: number
}

export interface PrintSettings {
  paper?: PaperOption
  method?: MethodOption
  scale?: ScaleOption
  color_type?: ColorType
  orientation?: OrientationOption
  repeat?: number
  range?: RangeOptions | string
  page_subset?: 'odd' | 'even'
  collate?: boolean
  tray?: number | string
  center?: boolean
}

export interface SizeOptions {
  height: number
  width: number
}

export interface PrinterTarget {
  id?: string
  name?: string
}

export interface PrintOptions extends PrinterTarget {
  preview?: boolean
  page_size?: SizeOptions
  print_setting?: PrintSettings
  remove_temp?: boolean
}

export type BinaryData = Uint8Array | ArrayBuffer

export interface PrintFileOptions extends PrinterTarget {
  path?: string
  file?: BinaryData
  print_setting?: PrintSettings
  remove_temp?: boolean
}

export type PrintType = 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
export type PrintPosition = 'left' | 'center' | 'right'
export type PrintStyle = Partial<CSSStyleDeclaration>

export interface PrintTableField {
  type: 'text' | 'image'
  value?: string
  path?: string
  style?: PrintStyle
  width?: string
  height?: string
}

export interface PrintData {
  type: PrintType
  value?: string
  style?: PrintStyle
  width?: number
  height?: number
  fontsize?: number
  displayValue?: boolean
  position?: PrintPosition
  path?: string
  url?: string
  tableHeader?: Array<PrintTableField | string>
  tableBody?: Array<Array<PrintTableField | string>>
  tableFooter?: Array<PrintTableField | string>
  tableHeaderStyle?: PrintStyle
  tableBodyStyle?: PrintStyle
  tableFooterStyle?: PrintStyle
}

export interface JobStatus {
  code: number
  name: string
  description: string
}

export interface PrintJob {
  id: string
  job_id: number
  document_name?: string | null
  total_pages?: number | null
  position?: number | null
  size?: number | null
  username?: string | null
  pages_printed?: number | null
  job_time?: number | null
  computer_name?: string | null
  data_type?: string | null
  printer_name: string
  priority?: number | null
  submitted_time?: string | null
  job_status: JobStatus
}

export interface PrintResult {
  success: boolean
  message: string
}
