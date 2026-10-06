import { useSyncExternalStore } from 'react'

export type Source = { id: string; kind: string; name: string; author: string; license: string; language: string; url: string }
export type Surah = {
  n: number; start: number; ayas: number; order: number; rukus: number
  name: string; tname: string; ename: string; type: 'Meccan' | 'Medinan'
  /** [arabic (verbatim Tanzil), translation] */
  ayahs: [string, string][]
}
export type QuranData = {
  version: number; translation: string; sources: Source[]
  juz: { s: number; a: number }[]; sajda: { s: number; a: number }[]; surahs: Surah[]
}

export const TOTAL_AYAHS = 6236

let data: QuranData | null = null
let error: string | null = null
let started = false
const listeners = new Set<() => void>()

function load() {
  if (started) return
  started = true
  fetch('/data/quran.json')
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then((d: QuranData) => { data = d })
    .catch((e) => { error = String(e) })
    .finally(() => listeners.forEach((l) => l()))
}

function subscribe(l: () => void) {
  listeners.add(l)
  load()
  return () => listeners.delete(l)
}

export function useQuran() {
  const d = useSyncExternalStore(subscribe, () => data)
  const e = useSyncExternalStore(subscribe, () => error)
  return { data: d, error: e }
}

export function getQuran() { return data }

/** Absolute ayah index (0..6235) for progress tracking. */
export function absIndex(q: QuranData, s: number, a: number) {
  return q.surahs[s - 1].start + a - 1
}

export function juzOf(q: QuranData, s: number, a: number) {
  let j = 1
  q.juz.forEach((b, i) => { if (s > b.s || (s === b.s && a >= b.a)) j = i + 1 })
  return j
}

export function fromAbs(q: QuranData, idx: number) {
  const s = q.surahs.findLast((x) => x.start <= idx) ?? q.surahs[0]
  return { s: s.n, a: idx - s.start + 1 }
}
