import { createRoot } from 'react-dom/client'

import { App } from './App'

window.addEventListener('error', (e) => {
  document.getElementById('root')!.innerHTML =
    `<pre style="color:red;padding:20px;white-space:pre-wrap">${e.message}\n\n${e.error?.stack || ''}</pre>`
})

try {
  createRoot(document.getElementById('root')!).render(<App />)
} catch (e: unknown) {
  const err = e as Error
  document.getElementById('root')!.innerHTML =
    `<pre style="color:red;padding:20px;white-space:pre-wrap">${err.message}\n\n${err.stack || ''}</pre>`
}
