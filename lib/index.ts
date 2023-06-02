import { invoke } from '@tauri-apps/api/tauri'
import { resultprinter } from './mock';
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
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