import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Loader2, ShieldAlert, X } from 'lucide-react'
import { cloudConfigured, sb, useCloud } from '../lib/cloud'
import { PageHeader } from '../components/ui'

type Report = { id: number; item: string; message: string; source_hint: string | null; status: string; created_at: string }

// Content-review dashboard. Access is enforced server-side by RLS (profiles.role = 'admin');
// this page only hides UI for non-admins.
export default function Admin() {
  const { user } = useCloud()
  const [role, setRole] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[] | null>(null)
  const [filter, setFilter] = useState<'open' | 'resolved' | 'rejected'>('open')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    sb().then(async (c) => {
      const { data } = await c.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role ?? 'user')
    }).catch((e) => setErr(e.message))
  }, [user])

  useEffect(() => {
    if (role !== 'admin') return
    setReports(null)
    sb().then(async (c) => {
      const { data, error } = await c.from('content_reports').select('*').eq('status', filter).order('created_at', { ascending: false }).limit(200)
      if (error) throw error
      setReports(data as Report[])
    }).catch((e) => setErr(e.message))
  }, [role, filter])

  async function setStatus(id: number, status: string) {
    const c = await sb()
    const { error } = await c.from('content_reports').update({ status }).eq('id', id)
    if (error) { setErr(error.message); return }
    setReports((r) => r?.filter((x) => x.id !== id) ?? null)
  }

  if (!cloudConfigured || !user || (role && role !== 'admin')) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <ShieldAlert className="mx-auto text-muted" size={40} />
        <p className="mt-3 font-semibold">Admins only</p>
        <p className="mt-1 text-sm text-muted">{!cloudConfigured ? 'Cloud features are not configured for this deployment.' : !user ? 'Sign in with an admin account.' : 'Your account does not have admin access.'}</p>
        <Link to="/" className="btn mt-4">Back home</Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Content review" subtitle="Reports of possible errors in religious content" />
      <div className="mb-4 flex gap-2">{(['open', 'resolved', 'rejected'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn' : 'btn-ghost'}>{f}</button>)}</div>
      {err && <p className="mb-3 text-sm text-red-500">{err}</p>}
      {!reports ? <Loader2 className="animate-spin text-muted" /> : reports.length === 0 ? <p className="card p-8 text-center text-sm text-muted">No {filter} reports.</p> : (
        <div className="space-y-3">
          {reports.map((r) => (
            <article key={r.id} className="card p-4">
              <div className="flex items-center gap-2"><span className="chip text-brand">{r.item}</span><span className="ms-auto text-xs text-muted">{new Date(r.created_at).toLocaleString()}</span></div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.message}</p>
              {r.source_hint && <p className="mt-1 text-xs text-gold">Source given: {r.source_hint}</p>}
              {filter === 'open' && (
                <div className="mt-3 flex gap-2">
                  <button className="btn py-1.5" onClick={() => setStatus(r.id, 'resolved')}><Check size={15} />Resolved</button>
                  <button className="btn-ghost py-1.5" onClick={() => setStatus(r.id, 'rejected')}><X size={15} />Reject</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
