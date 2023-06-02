import { invoke } from '@tauri-apps/api/tauri'

interface Printer {
    id: string;
    name: string;
    driver_name: string;
    job_count: number;
    print_processor: string;
    port_name: string;
    share_name: string;
    computer_name: string;
    printer_status: number;  // https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-printer
    shared: boolean;
    type: number; // 0: local; 1: connection
    priority: number
}

type ScaleOption = "noscale" | "shrink" | "fit"
type MethodOption = "duplex" | "duplexshort" | "simplex"
type PaperOption = "A2" | "A3" | "A4" | "A5" | "A6" | "letter" | "legal" | "tabloid"
type OrientationOption = "portrait" | "landscape" 

interface PrintSettings {
    paper: PaperOption;
    method: MethodOption;
    scale?: ScaleOption;
    orientation?: OrientationOption;
    repeat?: Number;
}
interface PrintOptions {
    id?: string;
    name?: string;
    path: string;
    print_setting?: PrintSettings;
}

const parseIfJSON = (str: string): any => {
    try {
        return JSON.parse(str)
    } catch (error) {
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