import { useSyncExternalStore } from 'react'

export type Settings = {
  theme: 'light' | 'dark' | 'system'
  arabicSize: number
  showTranslation: boolean
  reciter: string
  method: string
  madhab: 'Shafi' | 'Hanafi'
  location: { lat: number; lng: number; label: string } | null
  hijriOffset: number
  adjustments: Record<string, number>
  lastRead: { s: number; a: number } | null
  notify: boolean
  readMode: 'verse' | 'mushaf'
  playbackRate: number
  repeat: number
  sidebarSurahs: boolean
}

const DEFAULTS: Settings = {
  theme: 'system', arabicSize: 30, showTranslation: true, reciter: 'Alafasy_128kbps',
  method: 'MuslimWorldLeague', madhab: 'Shafi', location: null, hijriOffset: 0,
  adjustments: {}, lastRead: null, notify: false,
  readMode: 'verse', playbackRate: 1, repeat: 1, sidebarSurahs: true,
}

const KEY = 'noor-settings'
let current: Settings = read()
const listeners = new Set<() => void>()

function read(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return DEFAULTS }
}

export function setSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(current)) } catch { /* storage unavailable */ }
  listeners.forEach((l) => l())
}

export const getSettings = () => current

export function useSettings() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => current,
  )
}
