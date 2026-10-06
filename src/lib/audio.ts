import { useSyncExternalStore } from 'react'
import { getQuran } from './quran'
import { getSettings } from './settings'

// Per-ayah recitations streamed from EveryAyah.com (free public recitation archive).
// Nothing is bundled; the service worker caches files only after the user plays/downloads them.
export const RECITERS: Record<string, string> = {
  Alafasy_128kbps: 'Mishary Rashid Alafasy',
  Abdul_Basit_Murattal_192kbps: 'Abdul Basit (Murattal)',
  Husary_128kbps: 'Mahmoud Khalil Al-Husary',
  Minshawy_Murattal_128kbps: 'Mohamed Siddiq Al-Minshawi',
  'Abdurrahmaan_As-Sudais_192kbps': 'Abdurrahman As-Sudais',
}

export const ayahUrl = (reciter: string, s: number, a: number) =>
  `https://everyayah.com/data/${reciter}/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`

type State = { s: number; a: number; playing: boolean; loading: boolean; error: string | null } | null

let state: State = null
const listeners = new Set<() => void>()
const el = typeof Audio !== 'undefined' ? new Audio() : null
const emit = () => listeners.forEach((l) => l())
const set = (p: Partial<NonNullable<State>>) => { state = state ? { ...state, ...p } : null; emit() }

if (el) {
  el.preload = 'auto'
  el.addEventListener('playing', () => set({ playing: true, loading: false, error: null }))
  el.addEventListener('pause', () => set({ playing: false }))
  el.addEventListener('waiting', () => set({ loading: true }))
  el.addEventListener('error', () => set({ playing: false, loading: false, error: 'Audio unavailable — check your connection.' }))
  el.addEventListener('ended', () => {
    const q = getQuran()
    if (!state || !q) return
    const surah = q.surahs[state.s - 1]
    if (state.a < surah.ayas) play(state.s, state.a + 1)
    else set({ playing: false })
  })
}

export function play(s: number, a: number) {
  if (!el) return
  state = { s, a, playing: false, loading: true, error: null }
  emit()
  el.src = ayahUrl(getSettings().reciter, s, a)
  el.play().catch(() => set({ loading: false }))
  if ('mediaSession' in navigator) {
    const q = getQuran()
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${q?.surahs[s - 1].tname ?? 'Surah'} ${s}:${a}`,
      artist: RECITERS[getSettings().reciter],
      album: 'Noor Quran',
    })
  }
}

export function toggle() {
  if (!el || !state) return
  if (el.paused) el.play().catch(() => {})
  else el.pause()
}

export function stop() { el?.pause(); state = null; emit() }

export function skip(dir: 1 | -1) {
  const q = getQuran()
  if (!state || !q) return
  const a = state.a + dir
  if (a >= 1 && a <= q.surahs[state.s - 1].ayas) play(state.s, a)
}

export function useAudio() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}

/** Download a whole surah's audio into Cache Storage for offline listening. */
export async function downloadSurah(s: number, onProgress: (done: number, total: number) => void) {
  const q = getQuran()
  if (!q) return
  const total = q.surahs[s - 1].ayas
  const cache = await caches.open('quran-audio')
  const reciter = getSettings().reciter
  let done = 0
  for (let a = 1; a <= total; a++) {
    const url = ayahUrl(reciter, s, a)
    if (!(await cache.match(url))) {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed on ayah ${a}`)
      await cache.put(url, res)
    }
    onProgress(++done, total)
  }
}

export async function isSurahDownloaded(s: number) {
  const q = getQuran()
  if (!q || !('caches' in window)) return false
  const cache = await caches.open('quran-audio')
  const reciter = getSettings().reciter
  const last = await cache.match(ayahUrl(reciter, s, q.surahs[s - 1].ayas))
  const first = await cache.match(ayahUrl(reciter, s, 1))
  return Boolean(first && last)
}
