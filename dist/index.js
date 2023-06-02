"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printers = void 0;
const mock_1 = require("./mock");
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
const printers = async () => {
    // const result: string = await invoke('plugin:printer|get_printers')
    const result = mock_1.resultprinter;
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
