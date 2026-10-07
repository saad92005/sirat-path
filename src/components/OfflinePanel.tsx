import { useEffect, useState } from 'react'
import { Check, CloudOff, Download, Loader2, ShieldCheck } from 'lucide-react'
import { COLLECTIONS } from '../pages/Hadith'
import { STUDY_TRANSLATIONS } from '../lib/qurancom'
import { downloadAudio, downloadHadith, downloadTranslation, fmtBytes, requestPersistence, storageUsage, usePacks } from '../lib/offline'
import { useOnline } from '../lib/online'

type Pack = { id: string; label: string; note: string; run: (p: (d: number, t: number) => void) => Promise<void> }

const PACKS: Pack[] = [
  ...COLLECTIONS.map((c) => ({ id: `hadith:${c.id}`, label: c.name, note: 'Hadith · Arabic + English', run: (p: (d: number, t: number) => void) => downloadHadith(c.id, p) })),
  ...STUDY_TRANSLATIONS.map((t) => ({ id: `tr:${t.id}`, label: t.name, note: `Quran translation · ${t.lang === 'ur' ? 'Urdu' : 'English'}`, run: (p: (d: number, t: number) => void) => downloadTranslation(t.id, p) })),
  { id: 'audio:juzamma', label: 'Juz ʿAmma recitation', note: 'Audio · Surahs 78–114 · ~40 MB', run: (p) => downloadAudio('audio:juzamma', Array.from({ length: 37 }, (_, i) => 78 + i), p) },
  { id: 'audio:popular', label: 'Popular surahs recitation', note: 'Audio · Kahf, Yaseen, Rahman, Waqiʿah, Mulk · ~60 MB', run: (p) => downloadAudio('audio:popular', [18, 36, 55, 56, 67], p) },
]

export default function OfflinePanel() {
  const packs = usePacks()
  const online = useOnline()
  const [busy, setBusy] = useState<Record<string, { d: number; t: number } | string>>({})
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => { storageUsage().then(setUsage); requestPersistence().then(setPersisted) }, [packs])

  async function run(p: Pack) {
    setBusy((b) => ({ ...b, [p.id]: { d: 0, t: 1 } }))
    try {
      await p.run((d, t) => setBusy((b) => ({ ...b, [p.id]: { d, t } })))
      setBusy((b) => { const n = { ...b }; delete n[p.id]; return n })
    } catch (e) {
      setBusy((b) => ({ ...b, [p.id]: (e as Error).message || 'Download failed' }))
    }
  }

  return (
    <section id="offline" className="card scroll-mt-20 space-y-4 p-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold"><CloudOff size={18} className="text-brand" />Offline downloads</h2>
        <p className="mt-1 text-sm text-muted">The Quran text, prayer times, Qibla, duas, azkar, tasbih, learning, journal and trackers already work with no internet. Download extras here to use them offline too.</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {usage && <span className="chip">Using {fmtBytes(usage.used)}{usage.quota ? ` of ${fmtBytes(usage.quota)}` : ''}</span>}
        {persisted != null && <span className={`chip ${persisted ? 'text-brand' : 'text-gold'}`}><ShieldCheck size={13} />{persisted ? 'Offline data protected' : 'Install the app to keep offline data safe'}</span>}
      </div>
      {!online && <p className="rounded-xl bg-gold/10 p-3 text-sm text-muted">You're offline — connect to the internet to download packs.</p>}
      <ul className="divide-y divide-line">
        {PACKS.map((p) => {
          const b = busy[p.id], done = !!packs[p.id]
          return (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.label}</p>
                <p className="truncate text-xs text-muted">{typeof b === 'string' ? <span className="text-red-500">{b}</span> : b ? `Downloading… ${Math.round((b.d / Math.max(1, b.t)) * 100)}%` : p.note}</p>
                {b && typeof b !== 'string' && <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(b.d / Math.max(1, b.t)) * 100}%` }} /></div>}
              </div>
              {done && !b ? (
                <span className="flex items-center gap-1 text-xs font-medium text-brand"><Check size={15} />Saved</span>
              ) : (
                <button className="btn-ghost shrink-0 px-3 py-1.5 text-sm" disabled={!online || (!!b && typeof b !== 'string')} onClick={() => run(p)}>
                  {b && typeof b !== 'string' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}{typeof b === 'string' ? 'Retry' : 'Get'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-muted">Any surah's audio can also be saved from the Quran reader (⬇ Download audio). Pages you open while online — tafsir, word-by-word — are kept for offline reading automatically.</p>
    </section>
  )
}
