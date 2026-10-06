# Sirat Path

*Walk the straight path, step by step.*

**Live:** https://siratpath.vercel.app · install it from your phone's browser (Add to Home Screen)

A complete, offline-first Muslim companion that installs on your phone and costs nothing to run. There's no account, no paid API, no ads and no tracking.

**Pillars:** Quran · Salah · Duas & Azkar · Hadith · Learning, plus Qibla, the Islamic calendar, Ramadan, Zakat, Hajj & Umrah, a reflection journal, habits, a kids mode and more.

## Features

| Area | What you get |
|---|---|
| **Today** | Greeting, Hijri date, next-prayer countdown over a skyline hero, Quran goal ring, morning/evening azkar status, upcoming events, continue reading, daily reflection, Name of the Day |
| **Quran** | 114 surahs (verified Tanzil Uthmani text), Pickthall translation, verse or Mushaf mode, Hifz mode, bookmarks, notes, last-read position, Khatm planner, share-as-image, keyboard shortcuts |
| **Study** | Tajweed colour mode, word-by-word (Arabic, transliteration, meaning), 5 tafsirs (EN/UR/AR), 5 Urdu translations, all loaded on demand and cached offline |
| **Ask Islam (AI)** | Optional on-device AI (WebLLM, private, no server): answers only from retrieved verified ayahs, citations validated, clearly labelled as AI reflection. Falls back to sources-only on devices without WebGPU |
| **Audio** | 5 reciters, continuous play, repeat per ayah, speed 0.75–1.5×, sleep timer, offline surah downloads, lock-screen metadata |
| **Salah** | Local prayer calculation (12 methods, Hanafi/Shafi Asr, adjustments), Jumuʿah, daily tracker (on time / jamaʿah / late / missed), 7-day history, monthly printable timetable, reminders, adhan sound, calendar (.ics) export so alarms work even when the app is closed |
| **Duas & Azkar** | 14 categories; every dua shows its Quran or hadith reference; azkar sessions with tap counters and daily completion |
| **Tasbih** | Presets plus custom dhikr, haptics, optional sound, rounds, lifetime history |
| **Hadith** | 9 collections (the six books, Muwatta, Nawawi 40, Qudsi), Arabic and English, graders' gradings, search, bookmarks. Loaded on demand and cached offline |
| **Learn** | 7 original courses → lessons → quiz → progress, with sources cited |
| **Ramadan** | Auto-detected; Suhoor/Iftar countdowns, 30-day tracker (fast, Quran, taraweeh, sadaqah), last ten nights |
| **Zakat** | Transparent calculator, silver or gold nisab, assumptions shown |
| **Hajj & Umrah** | Step-by-step timelines, checklists, duas |
| **Account & Sync** | Optional: email/password, Google, password reset, two-way sync, account deletion (Supabase free tier, RLS). Guest mode needs none of it |
| **Admin** | Content-review queue for user-reported errors in duas and hadith, admin-only via RLS |
| **More** | Qibla compass and distance to Makkah, Hijri calendar with events, 99 Names (with flashcards), habits, private journal, Insights heatmap, kids mode, library, universal search (Ctrl+K) |
| **Design** | Three themes (Emerald, Lavender, Teal), light/dark/system, English/Urdu/Arabic UI with RTL, desktop sidebar layout, mobile bottom nav and sheets |

## Quick start

```bash
git clone https://github.com/saad92005/sirat-path.git
cd sirat-path
npm install
npm run dev            # http://localhost:5173
```

No `.env` file is needed. See [docs/SETUP.md](docs/SETUP.md) for production builds and deployment.

## Docs

[Architecture](docs/ARCHITECTURE.md) · [Setup & deploy](docs/SETUP.md) · [Free stack audit](docs/FREE_STACK.md) · [Data sources](docs/DATA_SOURCES.md) · [Religious content policy](docs/RELIGIOUS_CONTENT_POLICY.md) · [PWA](docs/PWA.md) · [Security & privacy](docs/SECURITY.md) · [Testing](docs/TESTING.md)

## Can this project be run without spending money?

**Yes.** See [docs/FREE_STACK.md](docs/FREE_STACK.md).
