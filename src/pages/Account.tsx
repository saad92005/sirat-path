import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cloud, CloudOff, KeyRound, Loader2, LogOut, RefreshCw, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { cloudConfigured, deleteAccount, googleEnabled, sb, signOut, syncNow, useCloud } from '../lib/cloud'
import { PageHeader } from '../components/ui'

export default function Account() {
  const { user, syncing, lastSync, error } = useCloud()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [google, setGoogle] = useState<boolean | null>(null)
  useEffect(() => { if (cloudConfigured) googleEnabled().then(setGoogle) }, [])
  // Supabase sends OAuth errors back in the URL — show them instead of failing silently.
  useEffect(() => {
    const q = new URLSearchParams(location.hash.slice(1) || location.search)
    const err = q.get('error_description')
    if (err) { setMsg({ ok: false, text: `Google sign-in failed: ${err.replace(/\+/g, ' ')}` }); history.replaceState(null, '', location.pathname) }
  }, [])

  if (!cloudConfigured) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Account" subtitle="Optional — Sirat Path works fully without one" />
        <section className="card space-y-3 p-6">
          <p className="flex items-center gap-2 font-semibold"><CloudOff size={18} className="text-muted" />Guest mode</p>
          <p className="text-sm text-muted">Everything works on this device without an account: Quran, salah, duas, journal, habits and more. Your data never leaves your device.</p>
          <p className="text-sm text-muted">To move data between devices, use <Link className="text-brand underline" to="/settings">Settings → Export / Import</Link>.</p>
          <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">Developer note: cloud sync activates when <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are set (Supabase free tier). See docs/SETUP.md.</p>
        </section>
      </div>
    )
  }

  async function run(fn: () => Promise<string | void>) {
    setBusy(true); setMsg(null)
    try { const t = await fn(); if (t) setMsg({ ok: true, text: t }) } catch (e) { setMsg({ ok: false, text: (e as Error).message }) } finally { setBusy(false) }
  }

  const submit = () => run(async () => {
    const c = await sb()
    if (mode === 'reset') {
      const { error: e } = await c.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/account` })
      if (e) throw e
      return 'If that email has an account, a reset link is on its way.'
    }
    if (password.length < 8) throw new Error('Use at least 8 characters for your password.')
    if (mode === 'signup') {
      const { data, error: e } = await c.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/account` } })
      if (e) throw e
      return data.session ? 'Account created — you are signed in.' : 'Check your email to confirm your account, then sign in.'
    }
    const { error: e } = await c.auth.signInWithPassword({ email, password })
    if (e) throw e
    await syncNow().catch(() => {})
  })

  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader title="Account" subtitle="Sign in to sync across devices — or keep using guest mode" />
        <section className="card space-y-3 p-6">
          <div className="flex rounded-xl bg-surface-2 p-1 text-sm">
            {(['signin', 'signup'] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg py-1.5 ${mode === m ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}>{m === 'signin' ? 'Sign in' : 'Create account'}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-3">
            <input type="email" required autoComplete="email" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {mode !== 'reset' && <input type="password" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className="input" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />}
            <button className="btn w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}{mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</button>
          </form>
          <button className="btn-ghost w-full" disabled={busy} onClick={() => run(async () => {
            if ((await googleEnabled()) === false) throw new Error('Google sign-in is not available yet — please use email and password for now.')
            if (!navigator.onLine) throw new Error('You are offline — connect to the internet to sign in.')
            const c = await sb()
            const { error: e } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/account`, queryParams: { prompt: 'select_account' } } })
            if (e) throw e
          })}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
            Continue with Google{google === false && <span className="text-xs text-muted">(coming soon)</span>}
          </button>
          <button className="w-full text-center text-xs text-muted underline" onClick={() => setMode(mode === 'reset' ? 'signin' : 'reset')}><KeyRound size={12} className="inline" /> {mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button>
          {msg && <p className={`rounded-xl p-3 text-sm ${msg.ok ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-500'}`}>{msg.text}</p>}
          <p className="text-xs text-muted">Guest mode keeps working whether or not you sign in. Your journal syncs only to your own private, access-controlled rows.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageHeader title="Account" />
      <section className="card flex items-center gap-4 p-5">
        <span className="grid size-12 place-items-center rounded-full bg-brand/10 text-brand"><UserRound /></span>
        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{user.email}</p><p className="text-xs text-muted">Signed in · {user.app_metadata?.provider ?? 'email'}</p></div>
        <button className="btn-ghost" onClick={() => run(async () => { await signOut(); return 'Signed out. Your data stays on this device.' })}><LogOut size={16} />Sign out</button>
      </section>
      <section className="card space-y-3 p-5">
        <p className="flex items-center gap-2 font-semibold"><Cloud size={18} className="text-brand" />Sync</p>
        <p className="text-sm text-muted">{lastSync ? `Last synced ${new Date(lastSync).toLocaleString()}` : 'Not synced yet'}</p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn" disabled={syncing} onClick={() => run(async () => { const r = await syncNow(); return `Synced · ${r.pushed} sent, ${r.pulled} received.` })}>
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}Sync now
        </button>
        <p className="flex items-center gap-1.5 text-xs text-muted"><ShieldCheck size={13} />Protected by Row Level Security: only you can read your records.</p>
      </section>
      <section className="card space-y-3 p-5">
        <p className="font-semibold text-red-500">Delete account</p>
        <p className="text-sm text-muted">Permanently deletes your cloud account and synced data. Data on this device is kept.</p>
        <button className="btn-ghost text-red-500" onClick={() => confirm('Permanently delete your account and cloud data?') && run(async () => { await deleteAccount(); return 'Account deleted.' })}><Trash2 size={16} />Delete my account</button>
      </section>
      {msg && <p className={`rounded-xl p-3 text-sm ${msg.ok ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-500'}`}>{msg.text}</p>}
    </div>
  )
}
