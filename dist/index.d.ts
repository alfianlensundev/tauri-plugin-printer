/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export declare const printers: (id?: string | null) => Promise<Printer[]>;
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A array of printer detail.
 */
export declare const print_file: (options: PrintOptions) => Promise<any>;
/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
export declare const jobs: (printerid?: string | null) => Promise<Jobs[]>;
