import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import SurahList from './pages/SurahList'
import Reader from './pages/Reader'
import SearchPage from './pages/Search'
import Prayer from './pages/Prayer'
import QiblaPage from './pages/Qibla'
import Duas from './pages/Duas'
import DhikrPage from './pages/Dhikr'
import Khatm from './pages/Khatm'
import Saved from './pages/Saved'
import SettingsPage from './pages/Settings'
import More from './pages/More'
import About from './pages/About'
import Ask from './pages/Ask'
import Names from './pages/Names'
import CalendarPage from './pages/Calendar'
import Insights from './pages/Insights'
import { useSettings } from './lib/settings'
import { usePrayerNotifications } from './lib/notify'

export default function App() {
  const settings = useSettings()
  const { pathname } = useLocation()

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#08130f' : '#f6f3ec')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])

  useEffect(() => { if (!pathname.startsWith('/quran/')) window.scrollTo(0, 0) }, [pathname])

  usePrayerNotifications()

  return (
    <Layout>
      <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<SurahList />} />
          <Route path="/quran/:surah" element={<Reader />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/duas" element={<Duas />} />
          <Route path="/dhikr" element={<DhikrPage />} />
          <Route path="/khatm" element={<Khatm />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/names" element={<Names />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/more" element={<More />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}
