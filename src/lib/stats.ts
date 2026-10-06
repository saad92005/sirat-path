import type { ReadLog } from './db'

const key = (d: Date) => d.toLocaleDateString('en-CA')

/** Consecutive days with reading, counting today if already read, else from yesterday. */
export function streakOf(reads: ReadLog[]) {
  const days = new Set(reads.filter((r) => r.count > 0).map((r) => r.day))
  const d = new Date()
  if (!days.has(key(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(key(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

export function longestStreak(reads: ReadLog[]) {
  const days = [...new Set(reads.filter((r) => r.count > 0).map((r) => r.day))].sort()
  let best = 0, cur = 0, prev: number | null = null
  for (const d of days) {
    const t = Date.parse(d)
    cur = prev !== null && t - prev === 86_400_000 ? cur + 1 : 1
    best = Math.max(best, cur); prev = t
  }
  return best
}
