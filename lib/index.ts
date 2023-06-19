import { invoke } from '@tauri-apps/api/tauri'
import { jobStatus } from './constants'
import { Buffer } from 'buffer'

const parseIfJSON = (str: string, dft: any = []): any => {
    try {
        return JSON.parse(str)
    } catch (error) {
        return dft
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
export const printers = async (id: string|null = null): Promise<Printer[]> => {
    if (id != null){
        const printername = decodeBase64(id);
        const result: string = await invoke('plugin:printer|get_printers_by_name', {
            printername
        })
        const item = parseIfJSON(result, null);
        if (item == null) return [];
        return [
            {
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
            }
        ]
    }
    const result: string = await invoke('plugin:printer|get_printers')
    const resultData: ResultStringRS = parseIfJSON(result)
    
    const printers: Printer[] = [];
    if (resultData.is_unix){
        const listPrinter = resultData.data.split('\n').filter(flt => flt.trim().length > 0)
        for (let i = 0; i<listPrinter.length; i++){
            const printerName: any = listPrinter[i]
            const id = encodeBase64(printerName);

            printers.push({
                id,
                name: printerName.replace('_', ' '),
                driver_name: "",
                job_count: 0,
                print_processor: "",
                port_name: "",
                share_name: "",
                computer_name: "",
                printer_status: 2, 
                shared: false,
                type: 0,
                priority: 0
            })
        }
        return printers
    } else {
        const listRaw = parseIfJSON(resultData.data)
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
}
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
export const print_file = async (options: PrintOptions): Promise<ResponseResult> => {
    if (options.id == undefined && options.name == undefined) throw new Error('print_file require id | name as string') 
    if (options.path == undefined && options.file == undefined) throw new Error('print_file require parameter path as string | file as Buffer')   
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
    if (typeof options.path != "undefined"){
        if (options.path.split('.').length <= 1) throw new Error('File not supported');
        if (options.path.split('.').pop() != 'pdf' ) throw new Error('File not supported');
    }

    let tempfilename: string|null = null
    let tempPath: string = ""
    if (typeof options.file != "undefined"){
        const fileSignature = options.file.subarray(0, 4).toString('hex');
        if (fileSignature != "25504446") throw new Error('File not supported');
        if (Buffer.isBuffer(options.file) == false) throw new Error('Invalid buffer');
        const filename: string = `${Math.floor(Math.random() * 100000000)}_${Date.now()}.pdf`;
        tempPath = await invoke('plugin:printer|create_temp_file', {
            buffer_data: options.file.toString('base64'),
            filename
        })

        if (tempPath.length == 0) throw new Error("Fail to create temp file");
        tempfilename = filename
    }
    

    const optionsParams: any = {
        id: `"${id}"`,
        path: options.path, 
        printer_setting_paper: printerSettings?.paper,
        printer_setting_method: printerSettings?.method,
        printer_setting_scale: printerSettings?.scale,
        printer_setting_orientation: printerSettings?.orientation,
        printer_setting_repeat: printerSettings?.repeat,
    }

    if (typeof options.file != "undefined"){
        optionsParams.path = tempPath
    }
    
    await invoke('plugin:printer|print_pdf', optionsParams)

    await invoke('plugin:printer|remove_temp_file', {
        filename: tempfilename
    })
    return {
        success: true,
        message: "OK"
    }
}


/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
export const jobs = async (printerid: string|null = null): Promise<Jobs[]> => {
    const allJobs: Jobs[] = []
    if (printerid != null){
        const printer = await printers(printerid)    
        if (printer.length == 0) return []
        const result: any = await invoke('plugin:printer|get_jobs', {printername: printer[0].name})
        let listRawJobs: any = parseIfJSON(result, [])
        if (listRawJobs.length == undefined) listRawJobs = [listRawJobs]
        for (const job of listRawJobs){
            const id = encodeBase64(`${printer[0].name}_@_${job.Id}`);
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
        return allJobs;
    }
    const listPrinter = await printers()    
    for (const printer of listPrinter){
        const result: any = await invoke('plugin:printer|get_jobs', {printername: printer.name})
        let listRawJobs: any = parseIfJSON(result, [])
        if (listRawJobs.length == undefined) listRawJobs = [listRawJobs]
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

/**
 * Get job by id.
 * @returns Printer job.
 */
export const job = async (jobid: string): Promise<Jobs|null> => {
    const idextract = decodeBase64(jobid)
    const [printername = null, id = null] = idextract.split('_@_')
    if (printername == null || id == null) null
    const result: any = await invoke('plugin:printer|get_jobs_by_id', {printername: printername, jobid: id})
    const job = parseIfJSON(result, null)
    return {
        id: jobid,
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
    }
}


/**
 * Restart jobs.
 * @param jobid
 */
export const restart_job = async (jobid: string|null = null): Promise<ResponseResult> => {
    try {
        const result = {
            success: true,
            message: "OK"
        }
        if (jobid != null){
            const idextract = decodeBase64(jobid)
            
            const [printername = null, id = null] = idextract.split('_@_')
            if (printername == null || id == null) throw new Error('Wrong jobid')

            await invoke('plugin:printer|restart_job', {
                printername, 
                jobid: id.toString()
            })

            return result;
        }

        const listPrinter = await printers()    
        for (const printer of listPrinter){
            const result: any = await invoke('plugin:printer|get_jobs', {printername: printer.name})
            const listRawJobs = parseIfJSON(result, [])
            for (const job of listRawJobs){
                await invoke('plugin:printer|restart_job', {
                    printername: printer.name, 
                    jobid: job.Id.toString()
                })
            }
        }

        return result
    } catch (err: any) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to restart job"
        }
    }
}

/**
 * Resume jobs.
 * @param jobid
 */
export const resume_job = async (jobid: string|null = null): Promise<ResponseResult> => {
    try {
        const result = {
            success: true,
            message: "OK"
        }
        if (jobid != null){
            const idextract = decodeBase64(jobid)
            const [printername = null, id = null] = idextract.split('_@_')
            if (printername == null || id == null) throw new Error('Wrong jobid')

            await invoke('plugin:printer|resume_job', {
                printername, 
                jobid: id.toString()
            })

            return result;
        }

        const listPrinter = await printers()    
        for (const printer of listPrinter){
            const result: any = await invoke('plugin:printer|get_jobs', {printername: printer.name})
            const listRawJobs = parseIfJSON(result)
            for (const job of listRawJobs){
                await invoke('plugin:printer|resume_job', {
                    printername: printer.name, 
                    jobid: job.Id.toString()
                })
            }
        }

        return result
    } catch (err: any) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to resume job"
        }
    }
}

/**
 * Pause jobs.
 * @param jobid
 */
export const pause_job = async (jobid: string|null = null): Promise<ResponseResult> => {
    try {
        const result = {
            success: true,
            message: "OK"
        }
        if (jobid != null){
            const idextract = decodeBase64(jobid)
            const [printername = null, id = null] = idextract.split('_@_')
            if (printername == null || id == null) throw new Error('Wrong jobid')

            await invoke('plugin:printer|pause_job', {
                printername, 
                jobid: id.toString()
            })

            return result;
        }

        const listPrinter = await printers()    
        for (const printer of listPrinter){
            const result: any = await invoke('plugin:printer|get_jobs', {printername: printer.name})
            const listRawJobs = parseIfJSON(result)
            for (const job of listRawJobs){
                await invoke('plugin:printer|pause_job', {
                    printername: printer.name, 
                    jobid: job.Id.toString()
                })
            }
        }

        return result
    } catch (err: any) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to pause job"
        }
    }
}

/**
 * Remove jobs.
 * @param jobid
 */
export const remove_job = async (jobid: string|null = null): Promise<ResponseResult> => {
    try {
        const result = {
            success: true,
            message: "OK"
        }
        if (jobid != null){
            const idextract = decodeBase64(jobid)
            const [printername = null, id = null] = idextract.split('_@_')
            if (printername == null || id == null) throw new Error('Wrong jobid')

            await invoke('plugin:printer|remove_job', {
                printername, 
                jobid: id.toString()
            })

            return result;
        }

        const listPrinter = await printers()    
        for (const printer of listPrinter){
            const result: any = await invoke('plugin:printer|get_jobs', {printername: printer.name})
            const listRawJobs = parseIfJSON(result)
            for (const job of listRawJobs){
                await invoke('plugin:printer|remove_job', {
                    printername: printer.name, 
                    jobid: job.Id.toString()
                })
            }
        }

        return result
    } catch (err: any) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to pause job"
        }
    }
}