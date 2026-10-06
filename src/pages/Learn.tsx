import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Award, Check, ChevronRight, Clock, PlayCircle, RotateCcw } from 'lucide-react'
import { COURSES, type Course } from '../content/learn'
import { db } from '../lib/db'
import { tap } from '../lib/feedback'
import { PageHeader, Ring } from '../components/ui'

function useProgress() {
  return useLiveQuery(() => db.learn.toArray()) ?? []
}

export default function Learn({ kids = false }: { kids?: boolean }) {
  const { course, lesson } = useParams()
  const c = COURSES.find((x) => x.id === course)
  if (c && lesson === 'quiz') return <QuizView c={c} />
  if (c && lesson) return <LessonView c={c} id={lesson} />
  if (c) return <CourseView c={c} />
  return <CourseList kids={kids} />
}

function CourseList({ kids }: { kids: boolean }) {
  const prog = useProgress()
  const list = COURSES.filter((c) => !!c.kids === kids || (!kids && !c.kids))
  const totalLessons = COURSES.reduce((a, c) => a + c.lessons.length, 0)
  const doneLessons = prog.filter((p) => p.done && !p.id.endsWith(':quiz')).length
  return (
    <div>
      {!kids && <PageHeader title="Learn" subtitle="Short, sourced lessons with quizzes" />}
      {!kids && (
        <div className="hero pattern relative mb-6 overflow-hidden rounded-3xl p-6">
          <div className="relative flex items-center gap-5">
            <Ring pct={doneLessons / totalLessons} size={78} color="var(--accent)"><span className="text-sm font-bold">{doneLessons}/{totalLessons}</span></Ring>
            <div><p className="text-lg font-semibold">Your learning journey</p><p className="text-sm text-white/70">Lessons completed across all courses</p></div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const done = c.lessons.filter((l) => prog.some((p) => p.id === `${c.id}:${l.id}` && p.done)).length
          const quiz = prog.find((p) => p.id === `${c.id}:quiz`)
          return (
            <Link key={c.id} to={`/learn/${c.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-24 p-4" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)` }}>
                <div className="pattern absolute inset-0 opacity-40" />
                <span className="relative text-4xl">{c.emoji}</span>
                {quiz?.done && <span className="absolute end-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-black"><Award size={11} className="inline" /> {quiz.score}%</span>}
              </div>
              <div className="p-4">
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted">{c.subtitle}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(done / c.lessons.length) * 100}%` }} /></div>
                  <span className="text-xs tabular-nums text-muted">{done}/{c.lessons.length}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function CourseView({ c }: { c: Course }) {
  const prog = useProgress()
  const isDone = (id: string) => prog.some((p) => p.id === `${c.id}:${id}` && p.done)
  const next = c.lessons.find((l) => !isDone(l.id))
  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative mb-6 overflow-hidden rounded-3xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)` }}>
        <div className="pattern absolute inset-0 opacity-40" />
        <div className="relative"><span className="text-5xl">{c.emoji}</span><h1 className="mt-3 text-2xl font-bold">{c.title}</h1><p className="text-white/80">{c.subtitle}</p>
          {next && <Link to={`/learn/${c.id}/${next.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"><PlayCircle size={16} />{isDone(c.lessons[0].id) ? 'Continue' : 'Start course'}</Link>}
        </div>
      </div>
      <ol className="space-y-2.5">
        {c.lessons.map((l, i) => (
          <li key={l.id}>
            <Link to={`/learn/${c.id}/${l.id}`} className="card flex items-center gap-4 p-4 transition hover:border-brand">
              <span className={`grid size-10 place-items-center rounded-full text-sm font-bold ${isDone(l.id) ? 'bg-brand text-brand-ink' : 'bg-surface-2 text-muted'}`}>{isDone(l.id) ? <Check size={18} /> : i + 1}</span>
              <div className="flex-1"><p className="font-medium">{l.title}</p><p className="flex items-center gap-1 text-xs text-muted"><Clock size={11} />{l.minutes} min</p></div>
              <ChevronRight size={18} className="text-muted rtl:rotate-180" />
            </Link>
          </li>
        ))}
        <li>
          <Link to={`/learn/${c.id}/quiz`} className="card flex items-center gap-4 border-gold/40 bg-gold/5 p-4 transition hover:border-gold">
            <span className="grid size-10 place-items-center rounded-full bg-gold/20 text-gold"><Award size={18} /></span>
            <div className="flex-1"><p className="font-medium">Course quiz</p><p className="text-xs text-muted">{c.quiz.length} questions</p></div>
            <ChevronRight size={18} className="text-muted rtl:rotate-180" />
          </Link>
        </li>
      </ol>
    </div>
  )
}

function LessonView({ c, id }: { c: Course; id: string }) {
  const nav = useNavigate()
  const idx = c.lessons.findIndex((l) => l.id === id)
  const l = c.lessons[idx]
  if (!l) return <p className="text-muted">Lesson not found.</p>
  const next = c.lessons[idx + 1]
  async function complete() {
    tap(true)
    await db.learn.put({ id: `${c.id}:${l.id}`, course: c.id, done: true, at: Date.now() })
    nav(next ? `/learn/${c.id}/${next.id}` : `/learn/${c.id}/quiz`)
  }
  return (
    <article className="mx-auto max-w-2xl">
      <Link to={`/learn/${c.id}`} className="text-sm text-brand">← {c.title}</Link>
      <div className="mt-3 mb-6 flex items-center gap-2 text-xs text-muted">
        {c.lessons.map((x, i) => <span key={x.id} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-brand' : 'bg-surface-2'}`} />)}
      </div>
      <p className="text-sm text-muted">Lesson {idx + 1} of {c.lessons.length} · {l.minutes} min</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{l.title}</h1>
      <div className="mt-6 space-y-5">
        {l.body.map((b, i) => (
          <div key={i} className={b.h ? 'card p-5' : ''}>
            {b.h && <h2 className="mb-1 font-semibold text-brand">{b.h}</h2>}
            <p className="text-[16px] leading-relaxed">{b.p}</p>
            {b.ref && <p className="mt-2 text-xs font-medium text-gold">— {b.ref}</p>}
          </div>
        ))}
      </div>
      <button className="btn mt-8 w-full py-3.5 text-base" onClick={complete}><Check size={18} />Mark complete{next ? ' & continue' : ' & take quiz'}</button>
    </article>
  )
}

function QuizView({ c }: { c: Course }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const q = c.quiz[i]

  async function choose(k: number) {
    if (picked !== null) return
    setPicked(k)
    const right = k === q.answer
    tap(right)
    if (right) setScore((s) => s + 1)
  }
  async function next() {
    if (i + 1 < c.quiz.length) { setI(i + 1); setPicked(null); return }
    const pct = Math.round((score / c.quiz.length) * 100)
    await db.learn.put({ id: `${c.id}:quiz`, course: c.id, done: true, score: pct, at: Date.now() })
    setFinished(true)
  }

  if (finished) {
    const pct = Math.round((score / c.quiz.length) * 100)
    return (
      <div className="mx-auto max-w-md py-8 text-center">
        <Ring pct={pct / 100} size={140} stroke={10} color="var(--gold)"><span className="text-3xl font-bold">{pct}%</span></Ring>
        <h1 className="mt-6 text-2xl font-bold">{pct === 100 ? 'MashaAllah! Perfect score' : pct >= 60 ? 'Well done!' : 'Keep learning'}</h1>
        <p className="mt-1 text-muted">{score} of {c.quiz.length} correct</p>
        <div className="mt-6 flex justify-center gap-2">
          <button className="btn-ghost" onClick={() => { setI(0); setPicked(null); setScore(0); setFinished(false) }}><RotateCcw size={16} />Retry</button>
          <Link className="btn" to="/learn">More courses</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link to={`/learn/${c.id}`} className="text-sm text-brand">← {c.title}</Link>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(i / c.quiz.length) * 100}%` }} /></div>
      <p className="mt-6 text-sm text-muted">Question {i + 1} of {c.quiz.length}</p>
      <h1 className="mt-1 text-2xl font-bold leading-snug">{q.q}</h1>
      <div className="mt-6 space-y-2.5">
        {q.options.map((o, k) => {
          const state = picked === null ? '' : k === q.answer ? 'border-brand bg-brand/10' : k === picked ? 'border-red-500 bg-red-500/10' : 'opacity-60'
          return <button key={k} onClick={() => choose(k)} className={`card w-full p-4 text-start font-medium transition active:scale-[.99] ${state}`}>{o}</button>
        })}
      </div>
      {picked !== null && (
        <div className="fade-in mt-5 space-y-3">
          <p className={`rounded-xl p-3 text-sm ${picked === q.answer ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-500'}`}>{picked === q.answer ? 'Correct! ' : 'Not quite. '}{q.why}</p>
          <button className="btn w-full" onClick={next}>{i + 1 < c.quiz.length ? 'Next question' : 'See result'}</button>
        </div>
      )}
    </div>
  )
}
