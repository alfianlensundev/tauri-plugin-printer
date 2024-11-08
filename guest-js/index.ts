import { invoke } from '@tauri-apps/api/core'
import { Printer } from './types'


/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 * 
 * 
 * @example
 * 
 * await get_printers()
 */
export async function get_printers(): Promise<Printer[]> {
    const result: any = await invoke('plugin:printer|get_printers')
    if (result.Error) throw new Error(result.Error.error)
    return result.Success.data as Printer[]
}


/**
 * Get printer by id.
 * @param id - Printer ID from get_printers function 
 * @returns Printer data
 * 
 * 
 * @example
 * 
 * await get_printer("idprinter")
 */
export async function get_printer(id: string): Promise<Printer> {
    const result: any = await invoke('plugin:printer|get_printer', {
        payload: {
            value: id
        }
    })
    if (result.Error) throw new Error(result.Error.error)
    return result.Success.data as Printer
}