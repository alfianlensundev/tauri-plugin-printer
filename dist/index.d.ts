import { Jobs, PrintOptions, Printer, ResponseResult } from './interface';
import { PrintData } from './types';
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export declare const printers: (id?: string | null) => Promise<Printer[]>;
/**
 * Print.
 * @params first_param: File Path, second_param: Print Setting
 * @returns A process status.
 */
export declare const print: (data: PrintData, options: PrintOptions) => Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Print File.
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
 * Get job by id.
 * @returns Printer job.
 */
export declare const job: (jobid: string) => Promise<Jobs | null>;
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
 * Remove jobs.
 * @param jobid
 */
export declare const remove_job: (jobid?: string | null) => Promise<ResponseResult>;
