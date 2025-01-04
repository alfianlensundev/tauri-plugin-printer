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
    printer_type: number;
    priority: number
}

export type ResponseSuccess<T> = {
    data: T
}

export type ResponseError= {
    error: string
}


export type SizeOptions = {
    height: number;
    width: number;
}

export type PrintOptions = {
    id?: string;
    preview?: boolean;
    page_size: SizeOptions;
    print_setting?: PrintSettings;
}

export type ScaleOption = "noscale" | "shrink" | "fit"
export type MethodOption = "duplex" | "duplexshort" | "simplex"
export type PaperOption = "A2" | "A3" | "A4" | "A5" | "A6" | "letter" | "legal" | "tabloid"
export type OrientationOption = "portrait" | "landscape" 
export type RangeOptions = {
    from: number,
    to: number
}

export type ColorType = "color" | "monochrome"
export type PrintSettings = {
    paper?: PaperOption;
    method?: MethodOption;
    scale?: ScaleOption;
    color_type?: ColorType
    orientation?: OrientationOption;
    repeat?: Number;
    range?: RangeOptions|string
}