import { useSyncExternalStore } from 'react'

type BIPEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }

let deferred: BIPEvent | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as BIPEvent; emit() })
  window.addEventListener('appinstalled', () => { deferred = null; emit() })
}

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches

/** Returns an install function when the browser offers one (Chrome/Edge/Android), else null. */
export function useInstall() {
  const ev = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => deferred)
  if (!ev) return null
  return async () => { await ev.prompt(); await ev.userChoice; deferred = null; emit() }
}
