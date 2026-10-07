// Offline packs: pre-fetch optional online content so the service worker caches it for offline use.
// Everything bundled with the app (Quran text, duas, azkar, learning, prayer maths) is already offline.
import { useSyncExternalStore } from 'react'
import { chapterTranslation } from './qurancom'
import { downloadSurah } from './audio'
import { ensureQuran } from './quran'

const HADITH_API = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'
const KEY = 'sirat-offline'

type Packs = Record<string, number> // pack id → timestamp downloaded
let packs: Packs = (() => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} } })()
const subs = new Set<() => void>()
function mark(id: string) {
  packs = { ...packs, [id]: Date.now() }
  try { localStorage.setItem(KEY, JSON.stringify(packs)) } catch { /* ignore */ }
  subs.forEach((f) => f())
}
export const usePacks = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => packs)

type Progress = (done: number, total: number) => void

/** Run tasks with limited concurrency, reporting progress. */
async function pool(tasks: (() => Promise<unknown>)[], onProgress: Progress, limit = 6) {
  let done = 0, i = 0
  onProgress(0, tasks.length)
  const worker = async () => {
    while (i < tasks.length) {
      const t = tasks[i++]
      await t()
      onProgress(++done, tasks.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
}

const getOk = async (url: string) => { const r = await fetch(url); if (!r.ok) throw new Error(`Download failed (${r.status})`); return r }

/** All sections of a hadith collection, Arabic + English. */
export async function downloadHadith(collection: string, onProgress: Progress) {
  const info = await (await getOk(`${HADITH_API}/info.min.json`)).json() as Record<string, { metadata: { sections: Record<string, string> } }>
  const sections = Object.entries(info[collection]?.metadata.sections ?? {}).filter(([k, v]) => k !== '0' && v).map(([k]) => k)
  const tasks = sections.flatMap((s) => ['eng', 'ara'].map((lang) => () => getOk(`${HADITH_API}/editions/${lang}-${collection}/sections/${s}.min.json`)))
  await pool(tasks, onProgress)
  mark(`hadith:${collection}`)
}

/** A full Quran translation (e.g. Urdu) for all 114 surahs. */
export async function downloadTranslation(id: number, onProgress: Progress) {
  await pool(Array.from({ length: 114 }, (_, i) => () => chapterTranslation(i + 1, id)), onProgress, 4)
  mark(`tr:${id}`)
}

/** Recitation audio for a range of surahs (current reciter). */
export async function downloadAudio(id: string, list: number[], onProgress: Progress) {
  await ensureQuran()
  let done = 0
  onProgress(0, list.length)
  for (const s of list) { await downloadSurah(s, () => {}); onProgress(++done, list.length) }
  mark(id)
}

/** Ask the browser not to evict our offline data (important on iOS/Safari). */
export async function requestPersistence(): Promise<boolean> {
  try { return (await navigator.storage?.persisted?.()) || (await navigator.storage?.persist?.()) || false } catch { return false }
}

export async function storageUsage(): Promise<{ used: number; quota: number } | null> {
  try { const e = await navigator.storage?.estimate?.(); return e ? { used: e.usage ?? 0, quota: e.quota ?? 0 } : null } catch { return null }
}

export const fmtBytes = (n: number) => n > 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(0)} MB` : `${Math.round(n / 1e3)} KB`
