import { invoke } from '@tauri-apps/api/tauri'
import { jobStatus } from './constants'
import { Buffer } from 'buffer'
import { Jobs, PrintFileOptions, PrintOptions, PrintSettings, Printer, ResponseResult } from './types'
import { PrintData } from './types'
import { ResponseType, getClient } from '@tauri-apps/api/http';
import mime from "mime";
import {toDataURL as qrCodeToDataUrl} from 'qrcode'
import * as JsBarcode from "jsbarcode";
import { WebviewWindow } from '@tauri-apps/api/window'
import * as _html2canvas from "html2canvas";
const html2canvas: any = _html2canvas;
import jsPDF from 'jspdf'
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
 * Print.
 * @params first_param:dataprint, second_param: Print Options
 * @returns A process status.
 */
// export const print = async (data: PrintData, options: PrintOptions) => {
export const print = async (data: PrintData[], options: PrintOptions): Promise<ResponseResult> => {
    const html = document.createElement('html')
    const container = document.createElement("div")
    container.id = "wrapper"
    container.style.position = "relative"
    container.style.display = "flex"
    container.style.backgroundColor = "#fff"
    container.style.flexDirection = "column"
    container.style.alignItems = "center"
    container.style.justifyContent = "flex-start"
    container.style.overflow = 'hidden'
    container.style.width = `300px`
    container.style.height = "fit-content"
    container.style.color = "#000"
    container.style.fontSize = '12px'
    

    for (const item of data){
        if (item.type == 'image'){
            const wrapperImage = document.createElement('div')
            wrapperImage.style.width = "100%"
            if (item?.position == "center"){
                wrapperImage.style.display = 'flex'
                wrapperImage.style.justifyContent = 'center'
            }

            if (typeof item.url == "undefined") throw new Error('Image required {url}')
            const image: any = document.createElement('img')
            image.width = 100,
            image.height = 100
            const client = await getClient();
            const response: any = await client.get(item.url, {
                responseType: ResponseType.Binary
            });

            image.src = `data:${mime.getType(item.url)};base64,${Buffer.from(response.data).toString('base64')}`
            if (item.width){
                image.width = item.width
            }

            if (item.height){
                image.height = item.height
            }

            if (item.style){
                const styles = item.style as any
                for (const style of Object.keys(styles)){
                    const key = style as any
                    image.style[key] = styles[key]
                }
            }
            wrapperImage.appendChild(image)

            container.appendChild(wrapperImage)
        }

        if (item.type == 'text'){
            const textWrapper = document.createElement('div')
            textWrapper.style.width = "100%"
            
            if (item.value){
                textWrapper.innerHTML = item.value
            }

            if (item.style){
                const styles = item.style as any
                for (const style of Object.keys(styles)){
                    const key = style as any
                    textWrapper.style[key] = styles[key]
                }
            }

            container.appendChild(textWrapper)
        }

        if (item.type == 'table'){
            const tableWrapper = document.createElement('div')
            tableWrapper.style.width = "100%"
            const table = document.createElement('table')
            const tableHead = document.createElement('thead')
            const trHead = document.createElement('tr')
            tableHead.appendChild(trHead)
            
            if (item.tableHeader){
                for (const head of item.tableHeader){
                    const tdHead = document.createElement('td')
                    tdHead.innerText = head.toString()
                    trHead.appendChild(tdHead)
                }
            }
            
            table.appendChild(tableHead)
            const tableBody = document.createElement('tbody')
            
            if (item.tableBody){
                for (const tr of item.tableBody){
                    const trBody = document.createElement('tr')
                    for (const td of tr){
                        const tdBody = document.createElement('td')
                        tdBody.innerText = td.toString()
                        trBody.appendChild(tdBody)
                    }

                    tableBody.appendChild(trBody)
                }
            }
            table.appendChild(tableBody)
            
            if (item.style){
                const styles = item.style as any
                for (const style of Object.keys(styles)){
                    const key = style as any
                    table.style[key] = styles[key]
                }
            }

            tableWrapper.appendChild(table)
            container.appendChild(tableWrapper)
        }
        
        if (item.type == 'qrCode'){
            const wrapperImage = document.createElement('div')
            wrapperImage.style.width = "100%"
            if (item?.position == "center"){
                wrapperImage.style.display = 'flex'
                wrapperImage.style.justifyContent = 'center'
            }
            const image = document.createElement('img')
            const canvas = document.createElement('canvas')
            image.src = await new Promise((rs, rj) => {
                qrCodeToDataUrl(canvas, item.value ? item.value : "", (err, url) => {
                    if (err) rj(err)
                    rs(url)
                })
            })

            if (item.width){
                image.width = item.width
            }

            if (item.height){
                image.height = item.height
            }
            
            if (item.style){
                const styles = item.style as any
                for (const style of Object.keys(styles)){
                    const key = style as any
                    image.style[key] = styles[key]
                }
            }
            
            wrapperImage.appendChild(image)

            container.appendChild(wrapperImage)
        }

        if (item.type == 'barCode'){
            const wrapperImage = document.createElement('div')
            wrapperImage.style.width = "100%"
            if (item?.position == "center"){
                wrapperImage.style.display = 'flex'
                wrapperImage.style.justifyContent = 'center'
            }
            const image = document.createElement('img')
            JsBarcode(image, item.value ? item.value : "", {
                width: item.width ? item.width : 4,
                height: item.height ? item.height : 40,
                displayValue: item.displayValue
            });

            image.style.objectFit = "contain"
            image.style.width = '100%'

            if (item.height){
                image.height = item.height
            }
            
            if (item.style){
                const styles = item.style as any
                for (const style of Object.keys(styles)){
                    const key = style as any
                    image.style[key] = styles[key]
                }
            }
            
            wrapperImage.appendChild(image)

            container.appendChild(wrapperImage)
        }
    }

    const body = document.createElement('body')
    body.appendChild(container)
    html.appendChild(body)
    body.style.overflowX = "hidden"
    const htmlData = html.outerHTML
    const hidder: any = document.createElement('div')
    hidder.style.width = 0
    hidder.style.height = 0
    hidder.style.overflow = 'hidden'
    hidder.appendChild(container)
    document.body.appendChild(hidder)
    const wrapper: any = document.querySelector('#wrapper')
    if (options.preview){
        const webview = new WebviewWindow(Date.now().toString(), {
            url: `data:text/html,${htmlData}`,
            title: "Print Preview",
            width: wrapper.clientWidth,
            height: wrapper.clientHeight,
            // visible: false
        })
        webview.once('tauri://created', function () {
        // webview window successfully created
        })
        webview.once('tauri://error', function (e) {
            console.log(e)
        })
        return {
            success: true,
            message: "OK"
        }
    }
    const componentWidth = wrapper.clientWidth;
    const componentHeight = wrapper.clientHeight;

    const ratio = componentHeight / componentWidth;
    const height = ratio * componentWidth;

    const canvas = await html2canvas(wrapper, {
        scale: 5,
    })
    const imgData = canvas.toDataURL('image/jpeg')

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: 'px',
        format: [componentWidth, height]
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, componentWidth, height)
    const buffer = pdf.output('arraybuffer')
    wrapper.remove()

    let id: string = "";
    if (typeof options.id != 'undefined'){
        id = decodeBase64(options.id);
    } 
    if (typeof options.name != 'undefined'){
        id = options.name
    }
    // 
    const printerSettings: PrintSettings = {
        paper: 'A4',
        method: 'simplex',
        scale: 'noscale',
        orientation: 'portrait',
        repeat: 1,
        color_type: "color"
    }
    if (typeof options?.print_setting?.paper != "undefined") printerSettings.paper = options.print_setting.paper;
    if (typeof options?.print_setting?.method != "undefined") printerSettings.method = options.print_setting.method;
    if (typeof options?.print_setting?.scale != "undefined") printerSettings.scale = options.print_setting.scale;
    if (typeof options?.print_setting?.orientation != "undefined") printerSettings.orientation = options.print_setting.orientation;
    if (typeof options?.print_setting?.repeat != "undefined") printerSettings.repeat = options.print_setting.repeat;
    if (typeof options?.print_setting?.color_type != "undefined") printerSettings.color_type = options.print_setting.color_type;
    if (typeof options?.print_setting?.range != "undefined") printerSettings.range = options.print_setting.range;
    
    let rangeStr = ""
    if (printerSettings.range){
        if (typeof printerSettings.range == 'string'){
            if (!(new RegExp(/^[0-9,]+$/).test(printerSettings.range))) throw new Error('Invalid range value ')
            rangeStr = printerSettings.range[printerSettings.range.length-1] != "," ? printerSettings.range : printerSettings.range.substring(0, printerSettings.range.length-1)     
        }
        else
        if (printerSettings.range.from){
            rangeStr = `${printerSettings.range.from}-${printerSettings.range.to}`
        }
    }
    
    const printerSettingStr = `-print-settings ${rangeStr},${printerSettings.paper},${printerSettings.method},${printerSettings.scale},${printerSettings.orientation},${printerSettings.color_type},${printerSettings.repeat}x` 

    const filename: string = `${Math.floor(Math.random() * 100000000)}_${Date.now()}.pdf`;
    const tempPath: string = await invoke('plugin:printer|create_temp_file', {
        buffer_data: Buffer.from(buffer).toString('base64'),
        filename
    })

    if (tempPath.length == 0) throw new Error("Fail to create temp file");

    const optionsParams: any = {
        id: `"${id}"`,
        path: tempPath,
        printer_setting: printerSettingStr,
        remove_after_print: typeof options.remove_temp != undefined ? options.remove_temp : true
    }

    await invoke('plugin:printer|print_pdf', optionsParams)
    return {
        success: true,
        message: "OK"
    }
}

/**
 * Print File.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
export const print_file = async (options: PrintFileOptions): Promise<ResponseResult> => {
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
    if (typeof options?.print_setting?.range != "undefined") printerSettings.range = options.print_setting.range;
    if (typeof options.path != "undefined"){
        if (options.path.split('.').length <= 1) throw new Error('File not supported');
        if (options.path.split('.').pop() != 'pdf' ) throw new Error('File not supported');
    }
    let rangeStr = ""
    if (printerSettings.range){
        if (typeof printerSettings.range == 'string'){
            if (!(new RegExp(/^[0-9,]+$/).test(printerSettings.range))) throw new Error('Invalid range value ')
            rangeStr = printerSettings.range[printerSettings.range.length-1] != "," ? printerSettings.range : printerSettings.range.substring(0, printerSettings.range.length-1)     
        }
        else
        if (printerSettings.range.from){
            rangeStr = `${printerSettings.range.from}-${printerSettings.range.to}`
        }
    }
    
    const printerSettingStr = `-print-settings ${rangeStr},${printerSettings.paper},${printerSettings.method},${printerSettings.scale},${printerSettings.orientation},${printerSettings.repeat}x` 

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
    }

    const optionsParams: any = {
        id: `"${id}"`,
        path: options.path, 
        printer_setting: printerSettingStr,
        remove_after_print: options.remove_temp ? options.remove_temp : true
    }

    if (typeof options.file != "undefined"){
        optionsParams.path = tempPath
    }
    
    await invoke('plugin:printer|print_pdf', optionsParams)
    
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