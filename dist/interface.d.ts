/// <reference types="node" />
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
    path?: string;
    file?: Buffer;
    print_setting?: PrintSettings;
}
interface JobsStatus {
    code: number;
    name: string;
    description: string;
}
interface Jobs {
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
}
interface ResponseResult {
    message: string | undefined;
    success: boolean;
}
