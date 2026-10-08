// Optional cloud account & sync (Supabase free tier). The SDK is only loaded when the app is
// configured with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY. Guest mode never touches the network.
import { useSyncExternalStore } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { db } from './db'
import { getSettings, setSettings } from './settings'

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const cloudConfigured = Boolean(URL_ && KEY)

let client: SupabaseClient | null = null
let session: Session | null = null
let status: { syncing: boolean; lastSync: number | null; error: string | null } = { syncing: false, lastSync: Number(localStorage.getItem('sirat-last-sync')) || null, error: null }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export async function sb() {
  if (!cloudConfigured) throw new Error('Cloud sync is not configured')
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(URL_!, KEY!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    session = (await client.auth.getSession()).data.session
    client.auth.onAuthStateChange((e, s) => {
      session = s; emit()
      if (s && (e === 'SIGNED_IN' || e === 'INITIAL_SESSION')) scheduleSync(300)
    })
    emit()
    if (session) scheduleSync(300)
  }
  return client
}

if (cloudConfigured) sb().catch(() => { /* offline — retry on demand */ })

/** Is Google sign-in switched on in the Supabase project? (null = couldn't check, e.g. offline) */
export async function googleEnabled(): Promise<boolean | null> {
  try {
    const r = await fetch(`${URL_}/auth/v1/settings`, { headers: { apikey: KEY! } })
    if (!r.ok) return null
    return Boolean((await r.json())?.external?.google)
  } catch { return null }
}

// ---------- Automatic sync ----------
// Signed-in users sync on sign-in, app start, focus, reconnect, every few minutes and shortly after local edits.
let timer: ReturnType<typeof setTimeout> | undefined
let pending = false
export function scheduleSync(delay = 4000) {
  if (!cloudConfigured || !session) return
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!session || !navigator.onLine) return
    if (status.syncing) { pending = true; return }
    try { await syncNow() } catch { /* error shown on Account page */ }
    if (pending) { pending = false; scheduleSync(1000) }
  }, delay)
}
if (cloudConfigured && typeof window !== 'undefined') {
  window.addEventListener('online', () => scheduleSync(1000))
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') scheduleSync(500) })
  setInterval(() => scheduleSync(0), 5 * 60_000)
  // Any local write to a synced table → push soon (ignore writes made by sync itself).
  queueMicrotask(() => {
    for (const c of COLLECTIONS) {
      const t = db.table(c)
      const kick = () => { if (!applying) scheduleSync() }
      t.hook('creating', kick); t.hook('updating', kick); t.hook('deleting', kick)
    }
  })
}
let applying = false

export function useCloud() {
  const s = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => session)
  const st = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => status)
  return { session: s, user: s?.user ?? null, ...st }
}

// ---------- Sync ----------
type Coll = 'bookmarks' | 'notes' | 'reads' | 'khatm' | 'dhikr' | 'salah' | 'azkar' | 'journal' | 'habits' | 'habitLog' | 'learn' | 'ramadan' | 'saved'
const COLLECTIONS: Coll[] = ['bookmarks', 'notes', 'reads', 'khatm', 'dhikr', 'salah', 'azkar', 'journal', 'habits', 'habitLog', 'learn', 'ramadan', 'saved']
// Tables with auto-increment ids get a device-independent syncKey so records never collide.
const AUTO_ID = new Set<Coll>(['bookmarks', 'notes', 'journal', 'habits'])
const HASH_KEY = 'sirat-sync-hashes'

const deviceId = (() => {
  let d = localStorage.getItem('sirat-device')
  if (!d) { d = Math.random().toString(36).slice(2, 10); try { localStorage.setItem('sirat-device', d) } catch { /* ignore */ } }
  return d
})()

const hash = (v: unknown) => { const s = JSON.stringify(v); let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return String(h) }

type Row = Record<string, unknown> & { id?: unknown; syncKey?: string }

async function localRows(c: Coll) {
  const t = db.table(c)
  const rows: Row[] = await t.toArray()
  const out = new Map<string, Row>()
  for (const r of rows) {
    let k: string
    if (c === 'bookmarks' || c === 'notes') k = `${r.s}:${r.a}`
    else if (AUTO_ID.has(c)) {
      if (!r.syncKey) { r.syncKey = `${deviceId}-${r.id}`; await t.update(r.id as never, { syncKey: r.syncKey }) }
      k = r.syncKey
    } else k = String(r.id ?? r.day)
    out.set(k, r)
  }
  return out
}

const strip = (c: Coll, r: Row) => { if (!AUTO_ID.has(c)) return r; const { id: _id, ...rest } = r; return rest }

export async function syncNow() {
  const c = await sb()
  if (!session) throw new Error('Sign in to sync')
  status = { ...status, syncing: true, error: null }; emit()
  applying = true
  try {
    const hashes: Record<string, string> = JSON.parse(localStorage.getItem(HASH_KEY) ?? '{}')
    const since = new Date(status.lastSync ?? 0).toISOString()
    const startedAt = Date.now()

    // 1) Pull remote changes since last sync and apply them locally.
    const { data: remote, error } = await c.from('user_records').select('collection,key,value,deleted,updated_at').gt('updated_at', since)
    if (error) throw error
    for (const r of remote ?? []) {
      const coll = r.collection as Coll
      if (r.collection === 'settings') { if (!r.deleted && r.value) setSettings({ ...(r.value as object), location: getSettings().location ?? (r.value as { location: null }).location }); continue }
      if (!COLLECTIONS.includes(coll)) continue
      const t = db.table(coll)
      const local = await localRows(coll)
      const existing = local.get(r.key)
      if (r.deleted) { if (existing) await t.delete(existing.id as never) }
      else if (AUTO_ID.has(coll)) {
        if (existing) await t.update(existing.id as never, r.value as object)
        else if (coll === 'bookmarks' || coll === 'notes') await t.add({ ...(r.value as object) })
        else await t.add({ ...(r.value as object), syncKey: r.key })
      } else await t.put(r.value as object)
      hashes[`${coll}/${r.key}`] = hash(r.value)
    }

    // 2) Push local changes (changed hash) and deletions (known key now missing).
    const upserts: { collection: string; key: string; value: unknown; deleted: boolean; updated_at: string }[] = []
    const now = new Date().toISOString()
    for (const coll of COLLECTIONS) {
      const local = await localRows(coll)
      for (const [k, r] of local) {
        const v = strip(coll, r); const h = hash(v)
        if (hashes[`${coll}/${k}`] !== h) { upserts.push({ collection: coll, key: k, value: v, deleted: false, updated_at: now }); hashes[`${coll}/${k}`] = h }
      }
      for (const hk of Object.keys(hashes)) {
        const [hc, ...rest] = hk.split('/'); const k = rest.join('/')
        if (hc === coll && !local.has(k)) { upserts.push({ collection: coll, key: k, value: null, deleted: true, updated_at: now }); delete hashes[hk] }
      }
    }
    const { location: _loc, ...prefs } = getSettings()
    const ph = hash(prefs)
    if (hashes['settings/prefs'] !== ph) { upserts.push({ collection: 'settings', key: 'prefs', value: prefs, deleted: false, updated_at: now }); hashes['settings/prefs'] = ph }
    for (let i = 0; i < upserts.length; i += 500) {
      const { error: e } = await c.from('user_records').upsert(upserts.slice(i, i + 500), { onConflict: 'user_id,collection,key' })
      if (e) throw e
    }

    localStorage.setItem(HASH_KEY, JSON.stringify(hashes))
    localStorage.setItem('sirat-last-sync', String(startedAt))
    applying = false
    status = { syncing: false, lastSync: startedAt, error: null }; emit()
    return { pulled: remote?.length ?? 0, pushed: upserts.length }
  } catch (e) {
    applying = false
    status = { ...status, syncing: false, error: (e as Error).message }; emit()
    throw e
  }
}

export async function signOut() {
  const c = await sb(); await c.auth.signOut()
  localStorage.removeItem(HASH_KEY); localStorage.removeItem('sirat-last-sync')
  status = { syncing: false, lastSync: null, error: null }; emit()
}

export async function deleteAccount() {
  const c = await sb()
  const { error } = await c.rpc('delete_my_account')
  if (error) throw error
  await signOut()
}

export async function reportContent(item: string, message: string, sourceHint: string) {
  const c = await sb()
  const { error } = await c.from('content_reports').insert({ item, message, source_hint: sourceHint || null })
  if (error) throw error
}
