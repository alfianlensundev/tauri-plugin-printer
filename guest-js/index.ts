import { invoke } from '@tauri-apps/api/core'
import { Printer } from './types'

export async function get_printers(): Promise<Printer[]> {
    const result: Printer[] = await invoke('plugin:printer|get_printers')
    return result
}
