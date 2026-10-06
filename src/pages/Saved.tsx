import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2 } from 'lucide-react'
import { db } from '../lib/db'
import { useQuran } from '../lib/quran'
import Loading from '../components/Loading'

export default function Saved() {
  const { data, error } = useQuran()
  const [tab, setTab] = useState<'bookmarks' | 'notes'>('bookmarks')
  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('createdAt').reverse().toArray()) ?? []
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray()) ?? []
  if (!data) return <Loading error={error} />
  const items = tab === 'bookmarks' ? bookmarks : notes

  return (
    <div className="fade-in space-y-4">
      <h1 className="h-page">Saved</h1>
      <div className="flex w-fit rounded-xl bg-surface-2 p-1 text-sm">
        {(['bookmarks', 'notes'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 capitalize transition ${tab === t ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}>
            {t} ({t === 'bookmarks' ? bookmarks.length : notes.length})
          </button>
        ))}
      </div>
      {items.length === 0 && <p className="card p-8 text-center text-sm text-muted">Nothing here yet. Use the {tab === 'bookmarks' ? 'bookmark' : 'note'} icon on any ayah in the reader.</p>}
      <div className="space-y-2.5">
        {items.map((it) => {
          const [ar, en] = data.surahs[it.s - 1].ayahs[it.a - 1]
          return (
            <div key={it.id} className="card flex gap-3 p-4">
              <Link to={`/quran/${it.s}#${it.a}`} className="min-w-0 flex-1">
                <p className="chip">{data.surahs[it.s - 1].tname} {it.s}:{it.a}</p>
                {'text' in it
                  ? <p className="mt-2 whitespace-pre-wrap text-sm">{it.text}</p>
                  : <><p className="quran mt-2 line-clamp-2 text-xl leading-loose">{ar}</p><p className="line-clamp-2 text-sm text-muted">{en}</p></>}
              </Link>
              <button className="icon-btn shrink-0" aria-label="Delete"
                onClick={() => (tab === 'bookmarks' ? db.bookmarks.delete(it.id!) : db.notes.delete(it.id!))}><Trash2 size={17} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
