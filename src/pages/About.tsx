import { useQuran } from '../lib/quran'

export default function About() {
  const { data } = useQuran()
  return (
    <div className="fade-in mx-auto max-w-xl space-y-5">
      <h1 className="h-page">Sources & About</h1>
      <p className="text-lg font-semibold text-brand">Sirat Path — Walk the straight path, step by step.</p>
      <p className="text-muted">Sirat Path is a free, open-source, offline-first Quran app. No account, no ads, no tracking. Your notes, bookmarks and location stay on your device.</p>
      <section className="space-y-3">
        {data?.sources.map((s) => (
          <div key={s.id} className="card p-4 text-sm">
            <p className="font-semibold">{s.name}</p>
            <p className="text-muted">{s.author}</p>
            <p className="mt-1">Licence: {s.license}</p>
            <a className="text-brand underline" href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
          </div>
        ))}
        <div className="card p-4 text-sm">
          <p className="font-semibold">Recitation audio</p>
          <p className="text-muted">Streamed per ayah from EveryAyah.com. Not bundled with the app.</p>
          <a className="text-brand underline" href="https://everyayah.com" target="_blank" rel="noreferrer">https://everyayah.com</a>
        </div>
        <div className="card p-4 text-sm">
          <p className="font-semibold">Calculations</p>
          <p className="text-muted">Prayer times and Qibla: adhan-js (MIT), on-device. Hijri: browser Intl Umm al-Qura calendar.</p>
        </div>
        <div className="card p-4 text-sm">
          <p className="font-semibold">Fonts & icons</p>
          <p className="text-muted">Amiri Quran (SIL OFL 1.1), Inter (SIL OFL 1.1), Lucide icons (ISC).</p>
        </div>
      </section>
      <p className="text-xs text-muted">The Quran text is reproduced verbatim from Tanzil and is never modified. Translations convey meaning and are not the Quran itself.</p>
    </div>
  )
}
