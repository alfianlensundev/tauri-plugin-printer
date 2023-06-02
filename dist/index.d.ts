interface Printer {
    id: string;
    name: string;
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
type ScaleOption = "noscale" | "shrink" | "fit";
type MethodOption = "duplex" | "duplexshort" | "simplex";
type PaperOption = "A2" | "A3" | "A4" | "A5" | "A6" | "letter" | "legal" | "tabloid";
type OrientationOption = "portrait" | "landscape";
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
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export declare const printers: () => Promise<Printer[]>;
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A array of printer detail.
 */
export declare const print_file: (options: PrintOptions) => Promise<any>;
export {};
