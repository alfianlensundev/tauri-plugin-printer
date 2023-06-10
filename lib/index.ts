import { invoke } from '@tauri-apps/api/tauri'
import { jobStatus } from './constants'

const parseIfJSON = (str: string): any => {
    try {
        return JSON.parse(str)
    } catch (error) {
        console.log(error)
        return []
    }
}

const encodeBase64 = (str: string): string => {
    if (typeof window === "undefined"){
        // in nodejs
        return Buffer.from(str, 'utf-8').toString('base64')
    } else {
        // in browser
        return window.btoa(str)
    }
}
const decodeBase64 = (str: string): string => {
    if (typeof window === "undefined"){
        // in nodejs
        return Buffer.from(str, 'base64').toString('utf-8')
    } else {
        // in browser
        return window.atob(str)
    }
}

/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export const printers = async (): Promise<Printer[]> => {
    const result: string = await invoke('plugin:printer|get_printers')
    
    
    const listRaw: any[] = parseIfJSON(result)
    const printers: Printer[] = [];

    for (let i = 0; i<listRaw.length; i++){
        const item: any = listRaw[i]
        const id = encodeBase64(item.Name);
        
        printers.push({
            id,
            name: item.Name,
            driver_name: item.DriverName,
            job_count: item.JobCount,
            print_processor: item.PrintProcessor,
            port_name: item.PortName,
            share_name: item.ShareName,
            computer_name: item.ComputerName,
            printer_status: item.PrinterStatus, 
            shared: item.Shared,
            type: item.Type,
            priority: item.Priority
        })
    }
    return printers
}
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A array of printer detail.
 */
export const print_file = async (options: PrintOptions): Promise<any> => {
    if (options.path == undefined) throw new Error('print_file require path as string')  
    if (options.id == undefined && options.name == undefined) throw new Error('print_file require id | name as string')  
    let id: string | undefined = "";

    if (typeof options.id != 'undefined'){
        id = decodeBase64(options.id);
    } else {
        id = options.name
    }
    const printerSettings: PrintSettings = {
        paper: 'A4',
        method: 'simplex',
        scale: 'noscale',
        orientation: 'portrait',
        repeat: 1
    }

    if (typeof options?.print_setting?.paper != "undefined") printerSettings.paper = options.print_setting.paper;
    if (typeof options?.print_setting?.method != "undefined") printerSettings.method = options.print_setting.method;
    if (typeof options?.print_setting?.scale != "undefined") printerSettings.scale = options.print_setting.scale;
    if (typeof options?.print_setting?.orientation != "undefined") printerSettings.orientation = options.print_setting.orientation;
    if (typeof options?.print_setting?.repeat != "undefined") printerSettings.repeat = options.print_setting.repeat;
    if (options.path.split('.').length <= 1) throw new Error('File not supported');
    if (options.path.split('.').pop() != 'pdf' ) throw new Error('File not supported');

    const optionsParams: any = {
        id: `"${id}"`,
        path: options.path, 
        printer_setting_paper: printerSettings?.paper,
        printer_setting_method: printerSettings?.method,
        printer_setting_scale: printerSettings?.scale,
        printer_setting_orientation: printerSettings?.orientation,
        printer_setting_repeat: printerSettings?.repeat,
    }
    const print = await invoke('plugin:printer|print_pdf', optionsParams)
    return print
}


/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
export const jobs = async () => {
    const listPrinter = await printers()
    const allJobs: Jobs[] = []

    for (const printer of listPrinter){
        const result: any = await invoke('plugin:printer|get_jobs', {printername: printer.name})
        const listRawJobs = parseIfJSON(result)
        for (const job of listRawJobs){
            const id = encodeBase64(`${printer.name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: jobStatus[job.JobStatus] != undefined ? {
                    code: job.JobStatus,
                    description: jobStatus[job.JobStatus].description,
                    name: jobStatus[job.JobStatus].name
                }: {
                    code: job.JobStatus,
                    description: "Unknown Job Status",
                    name: "Unknown"
                },
                computer_name: job.ComputerName,
                data_type: job.Datatype,
                document_name: job.DocumentName,
                job_time: job.JobTime,
                pages_printed: job.PagesPrinted,
                position: job.Position,
                printer_name: job.PrinterName,
                priority: job.Priority,
                size: job.Size,
                submitted_time: job.SubmittedTime ? +job.SubmittedTime?.replace('/Date(', '')?.replace(')/','') : null,
                total_pages: job.TotalPages,
                username: job.UserName
            })
        }
    }

    return allJobs
}