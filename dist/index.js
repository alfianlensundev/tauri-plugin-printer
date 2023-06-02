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
const decodeBase64 = (str) => {
    if (typeof window === "undefined") {
        // in nodejs
        return Buffer.from(str, 'base64').toString('utf-8');
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
    const optionsParams = {
        id: `"${id}"`,
        path: options.path,
        printer_setting_paper: printerSettings?.paper,
        printer_setting_method: printerSettings?.method,
        printer_setting_scale: printerSettings?.scale,
        printer_setting_orientation: printerSettings?.orientation,
        printer_setting_repeat: printerSettings?.repeat,
    };
    const print = await (0, tauri_1.invoke)('plugin:printer|print_pdf', optionsParams);
    return print;
};
exports.print_file = print_file;
