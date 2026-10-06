import Dexie, { type EntityTable } from 'dexie'

export type Bookmark = { id?: number; s: number; a: number; createdAt: number }
export type Note = { id?: number; s: number; a: number; text: string; updatedAt: number }
export type ReadLog = { day: string; count: number }
export type KhatmPlan = { id: 'current'; startDate: string; days: number; startIdx: number; doneIdx: number }
export type Dhikr = { id: string; count: number; total: number }
export type SalahLog = { id: string; day: string; prayer: string; status: 'ontime' | 'late' | 'missed' | 'jamaah' }
export type AzkarLog = { id: string; day: string; session: string; done: Record<string, number>; completed: boolean }
export type Journal = { id?: number; day: string; mood: string; gratitude: string; text: string; updatedAt: number }
export type Habit = { id?: number; name: string; emoji: string; target: number; createdAt: number; archived?: boolean }
export type HabitLog = { id: string; habitId: number; day: string; count: number }
export type LearnProgress = { id: string; course: string; done: boolean; score?: number; at: number }
export type RamadanDay = { id: string; year: number; day: number; fasted: boolean; sadaqah: boolean; quran: boolean; taraweeh: boolean }
export type SavedItem = { id: string; kind: 'dua' | 'hadith'; ref: string; createdAt: number }

// Everything personal stays on-device in IndexedDB. No account required.
export const db = new Dexie('sirat-path') as Dexie & {
  bookmarks: EntityTable<Bookmark, 'id'>
  notes: EntityTable<Note, 'id'>
  reads: EntityTable<ReadLog, 'day'>
  khatm: EntityTable<KhatmPlan, 'id'>
  dhikr: EntityTable<Dhikr, 'id'>
  salah: EntityTable<SalahLog, 'id'>
  azkar: EntityTable<AzkarLog, 'id'>
  journal: EntityTable<Journal, 'id'>
  habits: EntityTable<Habit, 'id'>
  habitLog: EntityTable<HabitLog, 'id'>
  learn: EntityTable<LearnProgress, 'id'>
  ramadan: EntityTable<RamadanDay, 'id'>
  saved: EntityTable<SavedItem, 'id'>
}

db.version(1).stores({
  bookmarks: '++id, [s+a], createdAt',
  notes: '++id, [s+a], updatedAt',
  reads: 'day',
  khatm: 'id',
  dhikr: 'id',
})

db.version(2).stores({
  salah: 'id, day',
  azkar: 'id, day',
  journal: '++id, day, updatedAt',
  habits: '++id, createdAt',
  habitLog: 'id, habitId, day',
  learn: 'id, course',
  ramadan: 'id, year',
  saved: 'id, kind, createdAt',
}).upgrade(async (tx) => {
  // Seed gentle default habits for new and existing users.
  await tx.table('habits').bulkAdd([
    { name: 'Read Quran', emoji: '📖', target: 1, createdAt: Date.now() },
    { name: 'Morning & evening azkar', emoji: '🌅', target: 2, createdAt: Date.now() },
    { name: 'Give sadaqah', emoji: '🤝', target: 1, createdAt: Date.now() },
  ])
})

db.on('populate', (tx) => {
  tx.table('habits').bulkAdd([
    { name: 'Read Quran', emoji: '📖', target: 1, createdAt: Date.now() },
    { name: 'Morning & evening azkar', emoji: '🌅', target: 2, createdAt: Date.now() },
    { name: 'Give sadaqah', emoji: '🤝', target: 1, createdAt: Date.now() },
  ])
})

export async function toggleSaved(kind: SavedItem['kind'], id: string, ref: string) {
  const key = `${kind}:${id}`
  if (await db.saved.get(key)) await db.saved.delete(key)
  else await db.saved.put({ id: key, kind, ref, createdAt: Date.now() })
}

export const today = () => new Date().toLocaleDateString('en-CA')

export async function toggleBookmark(s: number, a: number) {
  const existing = await db.bookmarks.where('[s+a]').equals([s, a]).first()
  if (existing) await db.bookmarks.delete(existing.id!)
  else await db.bookmarks.add({ s, a, createdAt: Date.now() })
}

export async function saveNote(s: number, a: number, text: string) {
  const existing = await db.notes.where('[s+a]').equals([s, a]).first()
  if (!text.trim()) { if (existing) await db.notes.delete(existing.id!); return }
  if (existing) await db.notes.update(existing.id!, { text, updatedAt: Date.now() })
  else await db.notes.add({ s, a, text, updatedAt: Date.now() })
}

export async function logRead(n = 1) {
  const day = today()
  const cur = await db.reads.get(day)
  await db.reads.put({ day, count: (cur?.count ?? 0) + n })
}
