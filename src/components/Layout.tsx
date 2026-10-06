import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { BookOpen, Clock, Home, LayoutGrid, Search, Sparkles } from 'lucide-react'
import AudioBar from './AudioBar'
import Logo from './Logo'

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/quran', label: 'Quran', icon: BookOpen },
  { to: '/prayer', label: 'Prayer', icon: Clock },
  { to: '/dhikr', label: 'Dhikr', icon: Sparkles },
  { to: '/more', label: 'More', icon: LayoutGrid },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold"><Logo /> Noor</Link>
          <nav className="ml-6 hidden gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm transition ${isActive ? 'bg-surface-2 font-semibold text-ink' : 'text-muted hover:text-ink'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/search" className="icon-btn ml-auto" aria-label="Search"><Search size={20} /></Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-40 pt-5 md:pb-28">{children}</main>

      <AudioBar />

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${isActive ? 'text-brand font-semibold' : 'text-muted'}`}>
              <Icon size={21} />{label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
