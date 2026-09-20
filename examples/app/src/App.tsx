import { useState } from 'react'
import { getDefaultPrinter, getPrinters, type Printer } from 'tauri-plugin-printer'
import './App.css'

function App() {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [message, setMessage] = useState('Select refresh to inspect the Windows print system.')

  async function refresh() {
    try {
      const [installed, defaultPrinter] = await Promise.all([
        getPrinters(),
        getDefaultPrinter(),
      ])
      setPrinters(installed)
      setMessage(defaultPrinter ? `Default: ${defaultPrinter.name}` : 'No default printer configured')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <main className="container">
      <h1>Tauri Printer v2</h1>
      <p>{message}</p>
      <button type="button" onClick={refresh}>Refresh printers</button>
      <ul>
        {printers.map((printer) => (
          <li key={printer.id}>
            {printer.name}{printer.is_default ? ' (default)' : ''}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
