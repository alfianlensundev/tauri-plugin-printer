/// <reference types="node" />
import { MethodOption, OrientationOption, PaperOption, ScaleOption } from "./types";
export type Printer = {
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
};
export type ColorType = "color" | "monochrome";
export type PrintSettings = {
    paper?: PaperOption;
    method?: MethodOption;
    scale?: ScaleOption;
    color_type?: ColorType;
    orientation?: OrientationOption;
    repeat?: Number;
};
export type PrintOptions = {
    id?: string;
    name?: string;
    path?: string;
    file?: Buffer;
    print_setting?: PrintSettings;
    remove_temp?: boolean;
};
export type JobsStatus = {
    code: number;
    name: string;
    description: string;
};
export type Jobs = {
    job_status: JobsStatus;
    computer_name: string;
    data_type: string;
    document_name: string;
    id: string;
    job_id: number;
    job_time: number;
    pages_printed: number;
    position: number;
    printer_name: string;
    priority: number;
    size: number;
    submitted_time: number | null;
    total_pages: number;
    username: string;
};
export type ResponseResult = {
    message: string | undefined;
    success: boolean;
};
