import { convertFileSrc, invoke } from '@tauri-apps/api/core'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

import { jobStatus } from './consts'
import type {
  BinaryData,
  JobStatus,
  PrintData,
  PrintFileOptions,
  PrintJob,
  PrintOptions,
  PrintResult,
  PrintSettings,
  PrintStyle,
  PrintTableField,
  Printer,
  PrinterCapabilities,
  PrinterTarget,
} from './types'

export type * from './types'

type RawPrintJob = Omit<PrintJob, 'job_status'> & { job_status: number }

const command = <T>(name: string, payload?: unknown): Promise<T> =>
  invoke<T>(`plugin:printer|${name}`, payload === undefined ? undefined : { payload })

const normalizePrinter = (printer: Printer): Printer => ({
  ...printer,
  type: printer.printer_type,
})

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

const base64ToText = (value: string): string => {
  const binary = atob(value)
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)))
}

const asBytes = (data: BinaryData): Uint8Array =>
  data instanceof Uint8Array ? data : new Uint8Array(data)

const resolvePrinterName = (target: PrinterTarget): string | undefined => {
  if (target.name?.trim()) return target.name.trim()
  if (target.id?.trim()) return base64ToText(target.id.trim())
  return undefined
}

const buildSettings = (settings: PrintSettings = {}): string => {
  const range = settings.range
  let rangeValue = ''
  if (typeof range === 'string') {
    if (!/^\d+(?:[-,]\d+)*,?$/.test(range)) throw new Error('Invalid page range')
    rangeValue = range.replace(/,$/, '')
  } else if (range) {
    if (!Number.isInteger(range.from) || !Number.isInteger(range.to) || range.from < 1 || range.to < range.from) {
      throw new Error('Invalid page range')
    }
    rangeValue = `${range.from}-${range.to}`
  }

  const repeat = settings.repeat ?? 1
  if (!Number.isInteger(repeat) || repeat < 1) throw new Error('repeat must be a positive integer')

  const tray = settings.tray
  if (typeof tray === 'string' && tray.includes(',')) throw new Error('tray cannot contain a comma')

  return [
    rangeValue,
    settings.page_subset ?? '',
    `paper=${settings.paper ?? 'A4'}`,
    settings.method ?? 'simplex',
    settings.scale ?? 'noscale',
    settings.orientation ?? 'portrait',
    settings.color_type ?? 'color',
    settings.collate === undefined ? '' : settings.collate ? 'collate' : 'nocollate',
    tray === undefined ? '' : `bin=${tray}`,
    settings.center ? 'center' : '',
    `${repeat}x`,
  ].filter(Boolean).join(',')
}

export async function getPrinters(): Promise<Printer[]> {
  return (await command<Printer[]>('get_printers')).map(normalizePrinter)
}

export async function getPrinter(id: string): Promise<Printer> {
  return normalizePrinter(await command<Printer>('get_printer', { value: id }))
}

export async function getDefaultPrinter(): Promise<Printer | null> {
  const printer = await command<Printer | null>('get_default_printer')
  return printer ? normalizePrinter(printer) : null
}

export async function setDefaultPrinter(target: string | PrinterTarget): Promise<Printer> {
  const printerTarget = typeof target === 'string' ? { id: target } : target
  const printerName = resolvePrinterName(printerTarget)
  if (!printerName) throw new Error('A printer id or name is required')
  return normalizePrinter(await command<Printer>('set_default_printer', { printerName }))
}

export async function getPrinterCapabilities(target: string | PrinterTarget): Promise<PrinterCapabilities> {
  const printerTarget = typeof target === 'string' ? { id: target } : target
  const printerName = resolvePrinterName(printerTarget)
  if (!printerName) throw new Error('A printer id or name is required')
  return command<PrinterCapabilities>('get_printer_capabilities', { printerName })
}

export async function printFile(options: PrintFileOptions): Promise<PrintResult> {
  const printerName = resolvePrinterName(options)
  const settings = buildSettings(options.print_setting)

  if (options.file !== undefined) {
    const bytes = asBytes(options.file)
    if (bytes.length < 5 || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
      throw new Error('Only PDF files are supported')
    }
    return command<PrintResult>('print_pdf_data', {
      printerName,
      data: bytesToBase64(bytes),
      settings,
    })
  }

  if (!options.path?.trim()) throw new Error('printFile requires path or file')
  if (!options.path.toLowerCase().endsWith('.pdf')) throw new Error('Only PDF files are supported')
  return command<PrintResult>('print_pdf', {
    printerName,
    path: options.path,
    settings,
    removeAfterPrint: false,
  })
}

const applyStyle = (element: HTMLElement, style?: PrintStyle): void => {
  if (style) Object.assign(element.style, style)
}

const imageSource = (source: string): string =>
  /^(?:https?:|data:|blob:|asset:)/i.test(source) ? source : convertFileSrc(source)

const appendTableField = (cell: HTMLTableCellElement, field: PrintTableField | string): void => {
  if (typeof field === 'string') {
    cell.textContent = field
    return
  }
  if (field.type === 'image') {
    const image = document.createElement('img')
    const source = field.path ?? field.value
    if (!source) throw new Error('Table image requires path or value')
    image.src = imageSource(source)
    if (field.width) image.style.width = field.width
    if (field.height) image.style.height = field.height
    applyStyle(image, field.style)
    cell.appendChild(image)
    return
  }
  cell.textContent = field.value ?? ''
  applyStyle(cell, field.style)
}

const appendTableRow = (
  section: HTMLTableSectionElement,
  fields: Array<PrintTableField | string>,
  style?: PrintStyle,
): void => {
  const row = section.insertRow()
  applyStyle(row, style)
  fields.forEach((field) => appendTableField(row.insertCell(), field))
}

const createDocument = async (data: PrintData[]): Promise<HTMLElement> => {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = [
    'position:relative',
    'display:flex',
    'background:#fff',
    'flex-direction:column',
    'align-items:center',
    'justify-content:flex-start',
    'overflow:hidden',
    'width:300px',
    'height:fit-content',
    'color:#000',
    'font-size:12px',
  ].join(';')

  for (const item of data) {
    if (item.type === 'text') {
      const text = document.createElement('div')
      text.style.width = '100%'
      text.innerHTML = item.value ?? ''
      applyStyle(text, item.style)
      wrapper.appendChild(text)
      continue
    }

    if (item.type === 'table') {
      const table = document.createElement('table')
      table.style.width = '100%'
      applyStyle(table, item.style)
      if (item.tableHeader) appendTableRow(table.createTHead(), item.tableHeader, item.tableHeaderStyle)
      const body = table.createTBody()
      item.tableBody?.forEach((row) => appendTableRow(body, row, item.tableBodyStyle))
      if (item.tableFooter) appendTableRow(table.createTFoot(), item.tableFooter, item.tableFooterStyle)
      wrapper.appendChild(table)
      continue
    }

    const holder = document.createElement('div')
    holder.style.width = '100%'
    holder.style.textAlign = item.position ?? 'left'
    const image = document.createElement('img')

    if (item.type === 'image') {
      const source = item.url ?? item.path
      if (!source) throw new Error('Image requires url or path')
      image.src = imageSource(source)
    } else if (item.type === 'qrCode') {
      const { default: QRCode } = await import('qrcode')
      image.src = await QRCode.toDataURL(item.value ?? '')
    } else {
      const { default: JsBarcode } = await import('jsbarcode')
      JsBarcode(image, item.value ?? '', {
        width: item.width ?? 2,
        height: item.height ?? 40,
        displayValue: item.displayValue ?? true,
        fontSize: item.fontsize,
      })
    }

    if (item.width) image.width = item.width
    if (item.height) image.height = item.height
    applyStyle(image, item.style)
    holder.appendChild(image)
    wrapper.appendChild(holder)
  }

  return wrapper
}

const waitForImages = async (root: HTMLElement): Promise<void> => {
  await Promise.all(
    Array.from(root.querySelectorAll('img')).map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return
      await new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => reject(new Error(`Failed to load image: ${image.src}`)), { once: true })
      })
    }),
  )
}

const renderElement = async (element: HTMLElement, options: PrintOptions): Promise<PrintResult> => {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;background:#fff'
  host.appendChild(element)
  document.body.appendChild(host)

  try {
    await waitForImages(element)
    if (options.preview) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Print Preview</title></head><body>${element.outerHTML}</body></html>`
      new WebviewWindow(`printer-preview-${Date.now()}`, {
        url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
        title: 'Print Preview',
        width: Math.max(element.scrollWidth, 320),
        height: Math.max(element.scrollHeight, 240),
      })
      return { success: true, message: 'Preview opened' }
    }

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
    const width = options.page_size?.width ?? Math.max(element.scrollWidth, 1)
    const height = options.page_size?.height ?? Math.max(element.scrollHeight, 1)
    const pdf = new jsPDF({
      orientation: options.print_setting?.orientation ?? (width > height ? 'landscape' : 'portrait'),
      unit: 'px',
      format: [width, height],
    })
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, width, height)
    return printFile({
      ...options,
      file: pdf.output('arraybuffer'),
    })
  } finally {
    host.remove()
  }
}

export async function printData(data: PrintData[], options: PrintOptions = {}): Promise<PrintResult> {
  return renderElement(await createDocument(data), options)
}

export async function printHtml(html: string, options: PrintOptions = {}): Promise<PrintResult> {
  const wrapper = document.createElement('div')
  wrapper.style.width = `${options.page_size?.width ?? 300}px`
  wrapper.style.background = '#fff'
  wrapper.innerHTML = html
  return renderElement(wrapper, options)
}

const describeJobStatus = (code: number): JobStatus => {
  const exact = jobStatus[code] as { name: string; description: string } | undefined
  if (exact) return { code, ...exact }

  const matches = Object.entries(jobStatus)
    .map(([value, status]) => [Number(value), status] as const)
    .filter(([value]) => value !== 0 && (code & value) === value)
    .map(([, status]) => status as { name: string; description: string })
  return matches.length
    ? { code, name: matches.map(({ name }) => name).join(', '), description: matches.map(({ description }) => description).join(' ') }
    : { code, name: 'Unknown', description: 'Unknown print job status' }
}

const normalizeJob = (job: RawPrintJob): PrintJob => ({
  ...job,
  job_status: describeJobStatus(job.job_status),
})

export async function getJobs(printerId?: string | null): Promise<PrintJob[]> {
  const selected = printerId ? [await getPrinter(printerId)] : await getPrinters()
  const jobsByPrinter = await Promise.all(
    selected.map((printer) => command<RawPrintJob[]>('get_jobs', { printerName: printer.name })),
  )
  return jobsByPrinter.flat().map(normalizeJob)
}

const parseJobId = (jobId: string): { printerName: string; jobId: number } => {
  const separator = '_@_'
  const decoded = base64ToText(jobId)
  const offset = decoded.lastIndexOf(separator)
  const printerName = decoded.slice(0, offset)
  const numericId = Number(decoded.slice(offset + separator.length))
  if (offset < 1 || !Number.isInteger(numericId) || numericId < 1) throw new Error('Invalid print job id')
  return { printerName, jobId: numericId }
}

export async function getJob(jobId: string): Promise<PrintJob> {
  return normalizeJob(await command<RawPrintJob>('get_job', parseJobId(jobId)))
}

const applyJobAction = async (action: string, jobId?: string | null): Promise<PrintResult> => {
  try {
    if (jobId) return command<PrintResult>(action, parseJobId(jobId))
    const allJobs = await getJobs()
    await Promise.all(allJobs.map((item) => command<PrintResult>(action, parseJobId(item.id))))
    return { success: true, message: `${action.replace('_job', '')} applied to ${allJobs.length} print job(s)` }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) }
  }
}

export const restartJob = (jobId?: string | null): Promise<PrintResult> => applyJobAction('restart_job', jobId)
export const resumeJob = (jobId?: string | null): Promise<PrintResult> => applyJobAction('resume_job', jobId)
export const pauseJob = (jobId?: string | null): Promise<PrintResult> => applyJobAction('pause_job', jobId)
export const removeJob = (jobId?: string | null): Promise<PrintResult> => applyJobAction('remove_job', jobId)

// Tauri v2 snake_case API retained from the existing v2 branch.
export const get_printers = getPrinters
export const get_printer = getPrinter
export const print_html = printHtml
