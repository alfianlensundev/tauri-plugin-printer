import { rmSync } from 'node:fs'

rmSync(new URL('../dist-js', import.meta.url), { recursive: true, force: true })
