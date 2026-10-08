import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bookmark, BookmarkCheck, Check, Copy, Image, Play } from 'lucide-react'
import type { Dua } from '../content/duas'
import { useQuran } from '../lib/quran'
import { play } from '../lib/audio'
import { db, toggleSaved } from '../lib/db'
import { shareAyahImage } from '../lib/shareImage'
import { useT } from '../lib/i18n'
import WhatsAppButton from './WhatsAppButton'
import ReportButton from './ReportButton'

export function duaText(d: Dua, q: ReturnType<typeof useQuran>['data']) {
  if (d.quran && q) {
    const s = q.surahs[d.quran.s - 1]
    const range = Array.from({ length: (d.quran.to ?? d.quran.from) - d.quran.from + 1 }, (_, i) => d.quran!.from + i)
    return { ar: range.map((a) => s.ayahs[a - 1][0]).join(' ۝ '), en: range.map((a) => s.ayahs[a - 1][1]).join(' '), isQuran: true }
  }
  return { ar: d.ar ?? '', en: d.en ?? '', isQuran: false }
}

export default function DuaCard({ d, counter, count = 0, onCount }: { d: Dua; counter?: boolean; count?: number; onCount?: () => void }) {
  const { data } = useQuran()
  const t = useT()
  const saved = useLiveQuery(() => db.saved.get(`dua:${d.id}`), [d.id])
  const [copied, setCopied] = useState(false)
  const { ar, en, isQuran } = duaText(d, data)
  const target = d.count ?? 1
  const complete = counter && count >= target

  return (
    <article id={d.id} className={`card scroll-mt-24 p-5 transition md:p-6 ${complete ? 'border-brand/50 bg-brand/5' : ''}`}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-[min(100%,14rem)] flex-1">
          <p className="font-semibold">{d.title}</p>
          <span className={`chip mt-1 ${isQuran ? 'text-brand' : 'text-gold'}`}>{isQuran ? d.ref : `Sunnah · ${d.ref}`}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
        {d.quran && <button className="icon-btn size-9" onClick={() => play(d.quran!.s, d.quran!.from)} aria-label="Play recitation"><Play size={17} /></button>}
        <button className={`icon-btn size-9 ${saved ? 'text-gold' : ''}`} onClick={() => toggleSaved('dua', d.id, d.ref)} aria-label="Save">{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button>
        <button className="icon-btn size-9" aria-label="Copy" onClick={async () => { await navigator.clipboard?.writeText(`${ar}\n\n${en}\n— ${d.ref}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
          {copied ? <Check size={17} className="text-brand" /> : <Copy size={17} />}
        </button>
        <button className="icon-btn size-9" aria-label="Share as image" onClick={() => shareAyahImage(ar, en, d.ref)}><Image size={17} /></button>
        <WhatsAppButton body={`${ar}

${en}`} refText={d.ref} path={`${location.pathname}#${d.id}`} />
        <ReportButton item={`Dua: ${d.title} (${d.ref})`} />
        </div>
      </div>
      <p className="quran mt-4 text-right text-[26px] md:text-[28px]">{ar}</p>
      {d.tr && <p className="mt-3 text-sm italic text-gold">{d.tr}</p>}
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{en}</p>
      {d.note && <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-sm">{d.note}</p>}
      <div className="mt-4 flex items-center gap-3">
        {d.quran && <Link to={`/quran/${d.quran.s}#${d.quran.from}`} className="text-xs font-semibold text-brand">{t('openInQuran')} →</Link>}
        {counter && (
          <button onClick={onCount} disabled={complete}
            className={`ms-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${complete ? 'bg-brand/15 text-brand' : 'bg-brand text-brand-ink'}`}>
            {complete ? <><Check size={16} />{t('done')}</> : <>{t('tap')} · {count}/{target}</>}
          </button>
        )}
        {!counter && target > 1 && <span className="chip ms-auto">Recite {target}×</span>}
      </div>
    </article>
  )
}
