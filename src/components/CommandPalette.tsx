import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CornerDownLeft, FileText, Search } from 'lucide-react'
import { useQuran } from '../lib/quran'
import { search, searchSurahs } from '../lib/search'
import { SIDEBAR } from './Layout'
import { useT } from '../lib/i18n'
import { DUAS } from '../content/duas'
import { COURSES } from '../content/learn'

type Item = { key: string; label: string; hint?: string; to: string; kind: 'page' | 'surah' | 'ayah'; ar?: string }

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const { data } = useQuran()
  const nav = useNavigate()
  const t = useT()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const tr = t
  const items = useMemo<Item[]>(() => {
    const t = q.trim().toLowerCase()
    const pages: Item[] = SIDEBAR.flatMap((g) => g.items)
      .filter((p) => !t || tr(p.k).toLowerCase().includes(t))
      .map((p) => ({ key: p.to, label: tr(p.k), hint: 'Page', to: p.to, kind: 'page' }))
    const extra: Item[] = t.length > 1 ? [
      ...DUAS.filter((d) => d.title.toLowerCase().includes(t) || d.en?.toLowerCase().includes(t)).slice(0, 4)
        .map((d) => ({ key: `d-${d.id}`, label: d.title, hint: `Dua · ${d.ref}`, to: `/duas?c=${d.cat}#${d.id}`, kind: 'page' as const })),
      ...COURSES.flatMap((c) => c.lessons.map((l) => ({ c, l }))).filter(({ l }) => l.title.toLowerCase().includes(t)).slice(0, 3)
        .map(({ c, l }) => ({ key: `l-${l.id}`, label: l.title, hint: `Lesson · ${c.title}`, to: `/learn/${c.id}/${l.id}`, kind: 'page' as const })),
    ] : []
    if (!data) return pages
    const surahs: Item[] = (t ? searchSurahs(data, q) : data.surahs.slice(0, 0)).slice(0, 6)
      .map((s) => ({ key: `s${s.n}`, label: `${s.n}. ${s.tname}`, hint: s.ename, to: `/quran/${s.n}`, kind: 'surah', ar: s.name }))
    const ayahs: Item[] = t.length > 1 ? search(data, q, 8).map(({ s, a }) => ({
      key: `${s}:${a}`, label: data.surahs[s - 1].ayahs[a - 1][1], hint: `${data.surahs[s - 1].tname} ${s}:${a}`, to: `/quran/${s}#${a}`, kind: 'ayah',
    })) : []
    return [...surahs, ...pages.slice(0, t ? 5 : 12), ...extra, ...ayahs]
  }, [q, data, tr])

  useEffect(() => { setSel(0) }, [q])
  useEffect(() => { listRef.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' }) }, [sel])
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])

  const go = (it?: Item) => { if (!it) return; nav(it.to); onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div className="fade-in w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="text-muted" />
          <input autoFocus className="h-14 flex-1 bg-transparent text-base outline-none" placeholder="Surah, page, words, or 2:255…" value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(items.length - 1, s + 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
              if (e.key === 'Enter') go(items[sel])
              if (e.key === 'Escape') onClose()
            }} />
          <kbd className="rounded border border-line px-1.5 text-[10px] text-muted">Esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {items.length === 0 && <p className="p-6 text-center text-sm text-muted">No results.</p>}
          {items.map((it, i) => {
            const Icon = it.kind === 'surah' ? BookOpen : it.kind === 'ayah' ? FileText : CornerDownLeft
            return (
              <button key={it.key} data-i={i} onMouseEnter={() => setSel(i)} onClick={() => go(it)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === sel ? 'bg-brand/10' : ''}`}>
                <Icon size={16} className={i === sel ? 'text-brand' : 'text-muted'} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${it.kind === 'ayah' ? '' : 'font-medium'}`}>{it.label}</span>
                  {it.hint && <span className="block truncate text-xs text-muted">{it.hint}</span>}
                </span>
                {it.ar && <span className="quran text-lg text-gold">{it.ar}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
