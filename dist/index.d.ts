/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
interface Printer {
    raw_name: string;
    driver_name: string;
    job_count: number;
    print_processor: string;
    port_name: string;
    share_name: string;
    computer_name: string;
    printer_status: number;
    shared: boolean;
    type: number;
    priority: number;
}
export declare const printers: () => Promise<Printer[]>;
export {};
