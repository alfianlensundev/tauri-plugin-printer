"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print_file = exports.printers = void 0;
const tauri_1 = require("@tauri-apps/api/tauri");
const parseIfJSON = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (error) {
        return [];
    }
};
const encodeBase64 = (str) => {
    if (typeof window === "undefined") {
        // in nodejs
        return Buffer.from(str, 'utf-8').toString('base64');
    }
    else {
        // in browser
        return window.btoa(str);
    }
};
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
const printers = async () => {
    const result = await (0, tauri_1.invoke)('plugin:printer|get_printers');
    const listRaw = parseIfJSON(result);
    const printers = [];
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
};
exports.printers = printers;
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A array of printer detail.
 */
const print_file = async (options) => {
    if (options.path == undefined)
        throw new Error('print_file require path as string');
    if (options.id == undefined && options.name == undefined)
        throw new Error('print_file require id | name as string');
    let id = options.id;
    if (options.id == undefined)
        id = options.name;
    const printerSettings = {
        paper: 'A4',
        method: 'simplex',
        scale: 'noscale',
        orientation: 'portrait'
    };
    if (options?.print_setting?.paper !== undefined)
        printerSettings.paper = options.print_setting.paper;
    if (options?.print_setting?.method !== undefined)
        printerSettings.method = options.print_setting.method;
    if (options?.print_setting?.scale !== undefined)
        printerSettings.scale = options.print_setting.scale;
    if (options?.print_setting?.orientation !== undefined)
        printerSettings.orientation = options.print_setting.orientation;
    if (options?.print_setting?.repeat !== undefined)
        printerSettings.repeat = options.print_setting.repeat;
    console.log(printerSettings);
    return exports.printers;
};
exports.print_file = print_file;
