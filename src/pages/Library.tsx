import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { PageHeader } from '../components/ui'

// Links only — this app does not host or redistribute third-party books.
const IN_APP = [
  { to: '/quran', emoji: '📖', title: 'The Quran', desc: 'Uthmani text with Pickthall translation, recitation, search' },
  { to: '/hadith', emoji: '📜', title: 'Hadith collections', desc: 'The six books, Muwatta, Nawawi 40, Hadith Qudsi' },
  { to: '/duas', emoji: '🤲', title: 'Duas & Azkar', desc: 'Referenced supplications by category' },
  { to: '/learn', emoji: '🎓', title: 'Courses', desc: 'Foundations, wudu, salah, Quran, seerah, zakat & fasting' },
  { to: '/hajj', emoji: '🕋', title: 'Hajj & Umrah guide', desc: 'Step-by-step with checklists' },
  { to: '/names', emoji: '⭐', title: 'The 99 Names', desc: 'With meanings and flashcards' },
]

const EXTERNAL = [
  { href: 'https://tanzil.net', title: 'Tanzil', desc: 'Verified Quran text and translations (source of this app’s Quran text)', tag: 'Quran' },
  { href: 'https://quran.com', title: 'Quran.com', desc: 'Read with many translations and tafsir', tag: 'Quran · Tafsir' },
  { href: 'https://sunnah.com', title: 'Sunnah.com', desc: 'Searchable hadith collections with references and grades', tag: 'Hadith' },
  { href: 'https://everyayah.com', title: 'EveryAyah', desc: 'Ayah-by-ayah recitations (this app’s audio source)', tag: 'Audio' },
  { href: 'https://github.com/fawazahmed0/hadith-api', title: 'hadith-api', desc: 'Open hadith dataset used by this app', tag: 'Hadith · Data' },
  { href: 'https://www.gutenberg.org/ebooks/search/?query=koran', title: 'Project Gutenberg', desc: 'Public-domain translations of the Quran, free to download', tag: 'Public domain' },
]

export default function Library() {
  return (
    <div>
      <PageHeader title="Library" subtitle="Everything in Noor, plus trusted free resources" />
      <p className="mb-3 text-sm font-semibold text-muted">In this app (works offline)</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {IN_APP.map((r) => (
          <Link key={r.to} to={r.to} className="card flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand">
            <span className="text-3xl">{r.emoji}</span><div><p className="font-semibold">{r.title}</p><p className="text-sm text-muted">{r.desc}</p></div>
          </Link>
        ))}
      </div>
      <p className="mt-8 mb-3 text-sm font-semibold text-muted">Free resources on the web</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXTERNAL.map((r) => (
          <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="card group flex items-start gap-3 p-4 transition hover:border-brand">
            <div className="flex-1"><p className="flex items-center gap-1.5 font-semibold">{r.title}<ExternalLink size={13} className="text-muted" /></p><p className="text-sm text-muted">{r.desc}</p></div>
            <span className="chip shrink-0">{r.tag}</span>
          </a>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">External sites are independent and have their own terms. Noor links to them and does not copy their content.</p>
    </div>
  )
}
