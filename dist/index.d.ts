/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export declare const printers: (id?: string | null) => Promise<Printer[]>;
/**
 * Get list printers.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
export declare const print_file: (options: PrintOptions) => Promise<ResponseResult>;
/**
 * Get all jobs.
 * @returns A array of all printer jobs.
 */
export declare const jobs: (printerid?: string | null) => Promise<Jobs[]>;
/**
 * Restart jobs.
 * @param jobid
 */
export declare const restart_job: (jobid?: string | null) => Promise<ResponseResult>;
/**
 * Resume jobs.
 * @param jobid
 */
export declare const resume_job: (jobid?: string | null) => Promise<ResponseResult>;
/**
 * Pause jobs.
 * @param jobid
 */
export declare const pause_job: (jobid?: string | null) => Promise<ResponseResult>;
/**
 * Pause jobs.
 * @param jobid
 */
export declare const remove_job: (jobid?: string | null) => Promise<ResponseResult>;
