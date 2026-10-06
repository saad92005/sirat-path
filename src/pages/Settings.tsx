import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { setSettings, useSettings } from '../lib/settings'
import { RECITERS } from '../lib/audio'
import { db } from '../lib/db'
import { hijri } from '../lib/prayer'
import LocationPicker from '../components/LocationPicker'

export default function SettingsPage() {
  const s = useSettings()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function exportData() {
    const dump = {
      app: 'noor', version: 1, exportedAt: new Date().toISOString(),
      bookmarks: await db.bookmarks.toArray(), notes: await db.notes.toArray(),
      reads: await db.reads.toArray(), khatm: await db.khatm.toArray(), dhikr: await db.dhikr.toArray(),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: `noor-backup-${new Date().toLocaleDateString('en-CA')}.json` }).click()
    URL.revokeObjectURL(url)
  }

  async function importData(f: File) {
    try {
      const d = JSON.parse(await f.text())
      if (d.app !== 'noor') throw new Error('Not a Noor backup file')
      await db.transaction('rw', [db.bookmarks, db.notes, db.reads, db.khatm, db.dhikr], async () => {
        await db.bookmarks.bulkPut(d.bookmarks ?? []); await db.notes.bulkPut(d.notes ?? [])
        await db.reads.bulkPut(d.reads ?? []); await db.khatm.bulkPut(d.khatm ?? []); await db.dhikr.bulkPut(d.dhikr ?? [])
      })
      setMsg('Backup restored.')
    } catch (e) { setMsg(`Import failed: ${(e as Error).message}`) }
  }

  return (
    <div className="fade-in mx-auto max-w-xl space-y-5">
      <h1 className="h-page">Settings</h1>

      <section className="card space-y-4 p-5">
        <p className="font-semibold">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button key={t} onClick={() => setSettings({ theme: t })} className={`${s.theme === t ? 'btn' : 'btn-ghost'} capitalize`}>{t}</button>
          ))}
        </div>
        <label className="block text-sm">
          <span className="text-muted">Arabic text size · {s.arabicSize}px</span>
          <input type="range" min={20} max={52} value={s.arabicSize} onChange={(e) => setSettings({ arabicSize: +e.target.value })} className="mt-2 w-full accent-[var(--brand)]" />
        </label>
        <p className="quran rounded-xl bg-surface-2 p-4 text-center" style={{ fontSize: s.arabicSize }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        <label className="flex items-center justify-between text-sm">
          Show English translation
          <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={s.showTranslation} onChange={(e) => setSettings({ showTranslation: e.target.checked })} />
        </label>
      </section>

      <section className="card space-y-3 p-5">
        <p className="font-semibold">Recitation</p>
        <select className="input" value={s.reciter} onChange={(e) => setSettings({ reciter: e.target.value })}>
          {Object.entries(RECITERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <p className="text-xs text-muted">Streamed from EveryAyah.com. Played or downloaded ayahs are cached for offline use.</p>
      </section>

      <section className="card space-y-3 p-5">
        <p className="font-semibold">Location</p>
        {s.location && <p className="text-sm text-muted">Current: {s.location.label}</p>}
        <LocationPicker />
      </section>

      <section className="card space-y-3 p-5">
        <p className="font-semibold">Hijri date adjustment</p>
        <p className="text-sm text-muted">Calculated with the Umm al-Qura calendar. Adjust if your local moon sighting differs.</p>
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={() => setSettings({ hijriOffset: s.hijriOffset - 1 })}>−1</button>
          <p className="flex-1 text-center font-medium">{hijri(new Date(), s.hijriOffset)}</p>
          <button className="btn-ghost" onClick={() => setSettings({ hijriOffset: s.hijriOffset + 1 })}>+1</button>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <p className="font-semibold">Your data</p>
        <p className="text-sm text-muted">Bookmarks, notes and progress are stored only on this device. Export a backup to move them to another device.</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ghost" onClick={exportData}><Download size={16} />Export</button>
          <button className="btn-ghost" onClick={() => file.current?.click()}><Upload size={16} />Import</button>
        </div>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        {msg && <p className="text-sm">{msg}</p>}
      </section>
    </div>
  )
}
