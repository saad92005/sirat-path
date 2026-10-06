import { Link } from 'react-router-dom'
import { BookMarked, Compass, HandHeart, Info, MessageCircleQuestion, Search, Settings, Target } from 'lucide-react'

const ITEMS = [
  { to: '/qibla', icon: Compass, label: 'Qibla', desc: 'Direction to the Kaaba' },
  { to: '/duas', icon: HandHeart, label: 'Duas', desc: 'Supplications from the Quran' },
  { to: '/khatm', icon: Target, label: 'Khatm Planner', desc: 'Complete the Quran on schedule' },
  { to: '/saved', icon: BookMarked, label: 'Bookmarks & Notes', desc: 'Your saved ayahs and reflections' },
  { to: '/search', icon: Search, label: 'Search', desc: 'Find any ayah, offline' },
  { to: '/ask', icon: MessageCircleQuestion, label: 'Ask', desc: 'Find verses on a topic' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Theme, reciter, location, backup' },
  { to: '/about', icon: Info, label: 'Sources & About', desc: 'Licences and attributions' },
]

export default function More() {
  return (
    <div className="fade-in space-y-4">
      <h1 className="h-page">More</h1>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {ITEMS.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="card flex items-center gap-4 p-4 transition hover:border-brand active:scale-[.99]">
            <div className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon size={20} /></div>
            <div><p className="font-semibold">{label}</p><p className="text-xs text-muted">{desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
