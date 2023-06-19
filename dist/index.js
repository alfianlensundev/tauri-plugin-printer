"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove_job = exports.pause_job = exports.resume_job = exports.restart_job = exports.job = exports.jobs = exports.print_file = exports.printers = void 0;
const tauri_1 = require("@tauri-apps/api/tauri");
const constants_1 = require("./constants");
const buffer_1 = require("buffer");
const parseIfJSON = (str, dft = []) => {
    try {
        return JSON.parse(str);
    }
    catch (error) {
        return dft;
    }
};
const encodeBase64 = (str) => {
    if (typeof window === "undefined") {
        // in nodejs
        return buffer_1.Buffer.from(str, 'utf-8').toString('base64');
    }
    else {
        // in browser
        return window.btoa(str);
    }
};
const decodeBase64 = (str) => {
    if (typeof window === "undefined") {
        // in nodejs
        return buffer_1.Buffer.from(str, 'base64').toString('utf-8');
    }
    else {
        // in browser
        return window.atob(str);
    }
};
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
const printers = async (id = null) => {
    if (id != null) {
        const printername = decodeBase64(id);
        const result = await (0, tauri_1.invoke)('plugin:printer|get_printers_by_name', {
            printername
        });
        const item = parseIfJSON(result, null);
        if (item == null)
            return [];
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
        ];
    }
    const result = await (0, tauri_1.invoke)('plugin:printer|get_printers');
    const resultData = parseIfJSON(result);
    const printers = [];
    if (resultData.is_unix) {
        const listPrinter = resultData.data.split('\n').filter(flt => flt.trim().length > 0);
        for (let i = 0; i < listPrinter.length; i++) {
            const printerName = listPrinter[i];
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
            });
        }
        return printers;
    }
    else {
        const listRaw = parseIfJSON(resultData.data);
        for (let i = 0; i < listRaw.length; i++) {
            const item = listRaw[i];
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
            });
        }
        return printers;
    }
};
exports.printers = printers;
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
const print_file = async (options) => {
    if (options.id == undefined && options.name == undefined)
        throw new Error('print_file require id | name as string');
    if (options.path == undefined && options.file == undefined)
        throw new Error('print_file require parameter path as string | file as Buffer');
    let id = "";
    if (typeof options.id != 'undefined') {
        id = decodeBase64(options.id);
    }
    else {
        id = options.name;
    }
    const printerSettings = {
        paper: 'A4',
        method: 'simplex',
        scale: 'noscale',
        orientation: 'portrait',
        repeat: 1
    };
    if (typeof options?.print_setting?.paper != "undefined")
        printerSettings.paper = options.print_setting.paper;
    if (typeof options?.print_setting?.method != "undefined")
        printerSettings.method = options.print_setting.method;
    if (typeof options?.print_setting?.scale != "undefined")
        printerSettings.scale = options.print_setting.scale;
    if (typeof options?.print_setting?.orientation != "undefined")
        printerSettings.orientation = options.print_setting.orientation;
    if (typeof options?.print_setting?.repeat != "undefined")
        printerSettings.repeat = options.print_setting.repeat;
    if (typeof options.path != "undefined") {
        if (options.path.split('.').length <= 1)
            throw new Error('File not supported');
        if (options.path.split('.').pop() != 'pdf')
            throw new Error('File not supported');
    }
    let tempfilename = null;
    let tempPath = "";
    if (typeof options.file != "undefined") {
        const fileSignature = options.file.subarray(0, 4).toString('hex');
        if (fileSignature != "25504446")
            throw new Error('File not supported');
        if (buffer_1.Buffer.isBuffer(options.file) == false)
            throw new Error('Invalid buffer');
        const filename = `${Math.floor(Math.random() * 100000000)}_${Date.now()}.pdf`;
        tempPath = await (0, tauri_1.invoke)('plugin:printer|create_temp_file', {
            buffer_data: options.file.toString('base64'),
            filename
        });
        if (tempPath.length == 0)
            throw new Error("Fail to create temp file");
        tempfilename = filename;
    }
    const optionsParams = {
        id: `"${id}"`,
        path: options.path,
        printer_setting_paper: printerSettings?.paper,
        printer_setting_method: printerSettings?.method,
        printer_setting_scale: printerSettings?.scale,
        printer_setting_orientation: printerSettings?.orientation,
        printer_setting_repeat: printerSettings?.repeat,
    };
    if (typeof options.file != "undefined") {
        optionsParams.path = tempPath;
    }
    await (0, tauri_1.invoke)('plugin:printer|print_pdf', optionsParams);
    await (0, tauri_1.invoke)('plugin:printer|remove_temp_file', {
        filename: tempfilename
    });
    return {
        success: true,
        message: "OK"
    };
};
exports.print_file = print_file;
/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
const jobs = async (printerid = null) => {
    const allJobs = [];
    if (printerid != null) {
        const printer = await (0, exports.printers)(printerid);
        if (printer.length == 0)
            return [];
        const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs', { printername: printer[0].name });
        let listRawJobs = parseIfJSON(result, []);
        if (listRawJobs.length == undefined)
            listRawJobs = [listRawJobs];
        for (const job of listRawJobs) {
            const id = encodeBase64(`${printer[0].name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: constants_1.jobStatus[job.JobStatus] != undefined ? {
                    code: job.JobStatus,
                    description: constants_1.jobStatus[job.JobStatus].description,
                    name: constants_1.jobStatus[job.JobStatus].name
                } : {
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
                submitted_time: job.SubmittedTime ? +job.SubmittedTime?.replace('/Date(', '')?.replace(')/', '') : null,
                total_pages: job.TotalPages,
                username: job.UserName
            });
        }
        return allJobs;
    }
    const listPrinter = await (0, exports.printers)();
    for (const printer of listPrinter) {
        const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs', { printername: printer.name });
        let listRawJobs = parseIfJSON(result, []);
        if (listRawJobs.length == undefined)
            listRawJobs = [listRawJobs];
        for (const job of listRawJobs) {
            const id = encodeBase64(`${printer.name}_@_${job.Id}`);
            allJobs.push({
                id,
                job_id: job.Id,
                job_status: constants_1.jobStatus[job.JobStatus] != undefined ? {
                    code: job.JobStatus,
                    description: constants_1.jobStatus[job.JobStatus].description,
                    name: constants_1.jobStatus[job.JobStatus].name
                } : {
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
                submitted_time: job.SubmittedTime ? +job.SubmittedTime?.replace('/Date(', '')?.replace(')/', '') : null,
                total_pages: job.TotalPages,
                username: job.UserName
            });
        }
    }
    return allJobs;
};
exports.jobs = jobs;
/**
 * Get job by id.
 * @returns Printer job.
 */
const job = async (jobid) => {
    const idextract = decodeBase64(jobid);
    const [printername = null, id = null] = idextract.split('_@_');
    if (printername == null || id == null)
        null;
    const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs_by_id', { printername: printername, jobid: id });
    const job = parseIfJSON(result, null);
    return {
        id: jobid,
        job_id: job.Id,
        job_status: constants_1.jobStatus[job.JobStatus] != undefined ? {
            code: job.JobStatus,
            description: constants_1.jobStatus[job.JobStatus].description,
            name: constants_1.jobStatus[job.JobStatus].name
        } : {
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
        submitted_time: job.SubmittedTime ? +job.SubmittedTime?.replace('/Date(', '')?.replace(')/', '') : null,
        total_pages: job.TotalPages,
        username: job.UserName
    };
};
exports.job = job;
/**
 * Restart jobs.
 * @param jobid
 */
const restart_job = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split('_@_');
            if (printername == null || id == null)
                throw new Error('Wrong jobid');
            await (0, tauri_1.invoke)('plugin:printer|restart_job', {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.printers)();
        for (const printer of listPrinter) {
            const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs', { printername: printer.name });
            const listRawJobs = parseIfJSON(result, []);
            for (const job of listRawJobs) {
                await (0, tauri_1.invoke)('plugin:printer|restart_job', {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to restart job"
        };
    }
};
exports.restart_job = restart_job;
/**
 * Resume jobs.
 * @param jobid
 */
const resume_job = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split('_@_');
            if (printername == null || id == null)
                throw new Error('Wrong jobid');
            await (0, tauri_1.invoke)('plugin:printer|resume_job', {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.printers)();
        for (const printer of listPrinter) {
            const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs', { printername: printer.name });
            const listRawJobs = parseIfJSON(result);
            for (const job of listRawJobs) {
                await (0, tauri_1.invoke)('plugin:printer|resume_job', {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to resume job"
        };
    }
};
exports.resume_job = resume_job;
/**
 * Pause jobs.
 * @param jobid
 */
const pause_job = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split('_@_');
            if (printername == null || id == null)
                throw new Error('Wrong jobid');
            await (0, tauri_1.invoke)('plugin:printer|pause_job', {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.printers)();
        for (const printer of listPrinter) {
            const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs', { printername: printer.name });
            const listRawJobs = parseIfJSON(result);
            for (const job of listRawJobs) {
                await (0, tauri_1.invoke)('plugin:printer|pause_job', {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to pause job"
        };
    }
};
exports.pause_job = pause_job;
/**
 * Remove jobs.
 * @param jobid
 */
const remove_job = async (jobid = null) => {
    try {
        const result = {
            success: true,
            message: "OK"
        };
        if (jobid != null) {
            const idextract = decodeBase64(jobid);
            const [printername = null, id = null] = idextract.split('_@_');
            if (printername == null || id == null)
                throw new Error('Wrong jobid');
            await (0, tauri_1.invoke)('plugin:printer|remove_job', {
                printername,
                jobid: id.toString()
            });
            return result;
        }
        const listPrinter = await (0, exports.printers)();
        for (const printer of listPrinter) {
            const result = await (0, tauri_1.invoke)('plugin:printer|get_jobs', { printername: printer.name });
            const listRawJobs = parseIfJSON(result);
            for (const job of listRawJobs) {
                await (0, tauri_1.invoke)('plugin:printer|remove_job', {
                    printername: printer.name,
                    jobid: job.Id.toString()
                });
            }
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            message: err.message ? err.message : "Fail to pause job"
        };
    }
};
exports.remove_job = remove_job;
