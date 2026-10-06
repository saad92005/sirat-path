import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  BarChart3, BookMarked, BookOpen, CalendarDays, Clock, Compass, Download, HandHeart, Home, Info, LayoutGrid,
  MessageCircleQuestion, Moon, Search, Settings, Sparkles, Star, Sun, Target,
} from 'lucide-react'
import AudioBar from './AudioBar'
import Logo from './Logo'
import CommandPalette from './CommandPalette'
import { setSettings, useSettings } from '../lib/settings'
import { fmtTime, nextPrayer, PRAYER_LABEL } from '../lib/prayer'
import { useInstall } from '../lib/install'

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/quran', label: 'Quran', icon: BookOpen },
  { to: '/prayer', label: 'Prayer', icon: Clock },
  { to: '/dhikr', label: 'Dhikr', icon: Sparkles },
  { to: '/more', label: 'More', icon: LayoutGrid },
]

export const SIDEBAR = [
  { group: 'Read', items: [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/quran', label: 'Quran', icon: BookOpen },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/ask', label: 'Ask', icon: MessageCircleQuestion },
  ] },
  { group: 'Worship', items: [
    { to: '/prayer', label: 'Prayer Times', icon: Clock },
    { to: '/qibla', label: 'Qibla', icon: Compass },
    { to: '/dhikr', label: 'Dhikr', icon: Sparkles },
    { to: '/duas', label: 'Duas', icon: HandHeart },
    { to: '/names', label: '99 Names', icon: Star },
  ] },
  { group: 'Track', items: [
    { to: '/khatm', label: 'Khatm Planner', icon: Target },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/saved', label: 'Bookmarks & Notes', icon: BookMarked },
  ] },
  { group: 'App', items: [
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/about', label: 'Sources', icon: Info },
  ] },
]

function useMinuteNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(id) }, [])
  return now
}

export default function Layout({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState(false)
  const settings = useSettings()
  const now = useMinuteNow()
  const next = nextPrayer(settings, now)
  const install = useInstall()
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); setPalette(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-dvh md:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface/60 backdrop-blur-xl md:flex">
        <Link to="/" className="flex h-16 items-center gap-2.5 px-5 text-lg font-bold"><Logo size={32} /> Noor</Link>
        <button onClick={() => setPalette(true)} className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-muted transition hover:border-brand">
          <Search size={15} /> Search anything <kbd className="ml-auto rounded border border-line px-1.5 text-[10px]">Ctrl K</kbd>
        </button>
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
          {SIDEBAR.map((g) => (
            <div key={g.group}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/70">{g.group}</p>
              {g.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-brand text-brand-ink font-semibold shadow-sm' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}>
                  <Icon size={18} />{label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="space-y-2 border-t border-line p-4">
          {next && (
            <Link to="/prayer" className="pattern block rounded-xl bg-[#0b2a24] p-3 text-white">
              <p className="text-[11px] uppercase tracking-wider text-[#d8b261]">Next · {PRAYER_LABEL[next.name]}</p>
              <p className="text-xl font-bold tabular-nums">{fmtTime(next.at)}</p>
            </Link>
          )}
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 px-2" onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}{dark ? 'Light' : 'Dark'}
            </button>
            {install && <button className="btn flex-1 px-2" onClick={install}><Download size={16} />Install</button>}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold"><Logo /> Noor</Link>
          {install && <button className="chip ml-3 text-brand" onClick={install}><Download size={12} />Install</button>}
          <button className="icon-btn ml-auto" onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })} aria-label="Toggle theme">
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button className="icon-btn" onClick={() => setPalette(true)} aria-label="Search"><Search size={20} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-40 pt-5 md:px-8 md:pb-28 md:pt-8">{children}</main>

      <AudioBar />
      {palette && <CommandPalette onClose={() => setPalette(false)} />}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${isActive ? 'text-brand font-semibold' : 'text-muted'}`}>
              {({ isActive }) => (<>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />}
                <Icon size={21} />{label}
              </>)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
