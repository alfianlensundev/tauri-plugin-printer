"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printers = void 0;
const tauri_1 = require("@tauri-apps/api/tauri");
const parseIfJSON = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (error) {
        return [];
    }
};
const printers = async () => {
    const result = await (0, tauri_1.invoke)('plugin:printer|get_printers');
    const listRaw = parseIfJSON(result);
    const printers = [];
    for (let i = 0; i < listRaw.length; i++) {
        const item = listRaw[i];
        printers.push({
            raw_name: item.Name,
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
