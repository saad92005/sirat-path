import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

// Keep installed copies current: check for a new version on load, hourly, and when the app regains
// focus; when a new service worker takes over, reload once so users never get stuck on an old build.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const check = () => reg.update().catch(() => {})
    setInterval(check, 60 * 60_000)
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check())
  },
  onNeedRefresh() { updateSW(true) },
})
let reloaded = false
navigator.serviceWorker?.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload() } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
