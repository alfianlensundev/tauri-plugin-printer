const invoke = window.__TAURI__.invoke
/**
 * Get list printers.
 *
 * @returns A array of printer detail.
 */
export const list_printers = async () => {
    const result = await invoke('plugin:printer|get_printers')
    
    return JSON.parse(result)
}



/**
 * Print PDF.
 * @param {string} path - Path to pdf file
 * @param {string} name - Drive Name
 * @returns A string result (result is in progress).
 */
export const print_pdf = async (path = '', printer_name = '') => {
    const result = await invoke('plugin:printer|print_pdf', {
        path,
        printer_name
    })
    
    return result
}