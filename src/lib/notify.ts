import { useEffect } from 'react'
import { computeTimes, PRAYERS, PRAYER_LABEL } from './prayer'
import { getSettings, useSettings } from './settings'

export const notificationSupport = () => {
  if (!('Notification' in window)) return 'unsupported' as const
  return Notification.permission
}

/**
 * Prayer reminders using the browser Notification API (no push service, no cost).
 * Honest limitation: these fire while the app is open or kept in the background by the browser.
 * Browsers do not let a free, server-less PWA schedule notifications after it has been closed.
 */
export function usePrayerNotifications() {
  const { notify, location } = useSettings()
  useEffect(() => {
    if (!notify || !location || notificationSupport() !== 'granted') return
    const fired = new Set<string>()
    const tick = async () => {
      const r = computeTimes(getSettings())
      if (!r) return
      const now = Date.now()
      for (const p of PRAYERS) {
        if (p === 'sunrise') continue
        const at = r.times[p].getTime()
        const key = `${p}-${at}`
        if (now >= at && now - at < 90_000 && !fired.has(key)) {
          fired.add(key)
          const body = `It is time for ${PRAYER_LABEL[p]}.`
          const reg = await navigator.serviceWorker?.getRegistration()
          if (reg) reg.showNotification('Noor — Prayer time', { body, icon: '/icon-192.png', tag: key })
          else new Notification('Noor — Prayer time', { body, icon: '/icon-192.png' })
        }
      }
    }
    const id = setInterval(tick, 20_000)
    tick()
    return () => clearInterval(id)
  }, [notify, location])
}
