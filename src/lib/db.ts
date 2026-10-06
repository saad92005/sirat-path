import Dexie, { type EntityTable } from 'dexie'

export type Bookmark = { id?: number; s: number; a: number; createdAt: number }
export type Note = { id?: number; s: number; a: number; text: string; updatedAt: number }
export type ReadLog = { day: string; count: number }
export type KhatmPlan = { id: 'current'; startDate: string; days: number; startIdx: number; doneIdx: number }
export type Dhikr = { id: string; count: number; total: number }

// Everything personal stays on-device in IndexedDB. No account required.
export const db = new Dexie('noor') as Dexie & {
  bookmarks: EntityTable<Bookmark, 'id'>
  notes: EntityTable<Note, 'id'>
  reads: EntityTable<ReadLog, 'day'>
  khatm: EntityTable<KhatmPlan, 'id'>
  dhikr: EntityTable<Dhikr, 'id'>
}

db.version(1).stores({
  bookmarks: '++id, [s+a], createdAt',
  notes: '++id, [s+a], updatedAt',
  reads: 'day',
  khatm: 'id',
  dhikr: 'id',
})

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
