import { invoke } from '@tauri-apps/api/core'
import { parseIfJSON } from './utils'
import { Printer } from './types'

export async function get_printers(): Promise<Printer[]> {
  const result: string = await invoke('plugin:printer|get_printers')

  return parseIfJSON(result, [])
}
