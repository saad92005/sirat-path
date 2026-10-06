# Noor — Quran & Prayer (free, offline-first PWA)

A complete Quran companion that costs nothing to run: no paid APIs, no account, no credit card.

**Highlights:** responsive design with a sidebar dashboard on desktop and app-style bottom navigation on phones; a Ctrl+K command palette; Mushaf and verse-by-verse reading; Hifz (memorisation) mode with ayah repeat; reader keyboard shortcuts; sharing an ayah as an image; the 99 Names with flashcards; an Islamic calendar with Eids and white days; an Insights page with a reading heatmap and streaks; a printable monthly prayer timetable; and an install button.

**Features:** Quran reader (Uthmani script + English translation), per-ayah recitation with 5 reciters and offline surah downloads, on-device search (English, Arabic, or `2:255`), bookmarks and notes, last-read resume, Khatm planner with streaks, prayer times, Qibla compass, Hijri date, Quranic duas, dhikr counter, light/dark theme, JSON backup and restore, and installation as a PWA that works fully offline.

## Run locally

```bash
git clone <your-repo-url> noor-quran
cd noor-quran
npm install
npm run dev        # http://localhost:5173
```

You don't need a `.env` file; the core app has no keys or secrets.

`npm run build && npm run preview` serves the production PWA (service worker + offline mode).
`npm run data` regenerates `public/data/quran.json` from the verbatim sources in `data-src/`.

## Deploy free (Vercel)

1. Push to GitHub.
2. On vercel.com, import the repo. The framework is detected as Vite, so no settings are needed.
3. Open `your-project.vercel.app` on your phone and choose **Add to Home Screen** or **Install app**.

Cloudflare Pages also works: build command `npm run build`, output folder `dist`, plus an SPA fallback.

## Architecture

- **Vite + React + TypeScript + Tailwind v4**, served as fully static files. There is no backend.
- **Quran data** comes from one JSON file (about 2.2 MB, about 600 KB gzipped) that the service worker precaches, so reading and searching never hit a server.
- **Personal data** (bookmarks, notes, Khatm, dhikr) lives in IndexedDB via Dexie. Preferences are kept in localStorage.
- **Audio** is streamed from EveryAyah. Workbox caches it after the first play or download (CacheFirst, range requests).
- **Prayer times and Qibla** are calculated with `adhan` in the browser. The **Hijri date** comes from `Intl` with the Umm al-Qura calendar.
- **AI** sits behind an `AIProvider` interface (`src/lib/ai.ts`). The default is `NoAIProvider`, and the Ask page always returns verified ayahs and never makes up an answer.

## Zero-cost audit

| Service / dependency | Purpose | Required? | Free? | Credit card? | Limits | Alternative |
|---|---|---|---|---|---|---|
| Tanzil Quran text | Arabic text | Yes (bundled) | Yes, CC BY 3.0 | No | Must stay verbatim, with attribution | — |
| Pickthall translation (via Tanzil) | English meaning | Yes (bundled) | Public domain | No | — | Add others in `data-src/` if their licence allows |
| Tanzil metadata | Surah and juz info | Yes (bundled) | CC BY 3.0 | No | — | — |
| EveryAyah.com | Recitation audio | Optional | Free public archive | No | Needs internet the first time each ayah is played | Any other free recitation CDN |
| adhan (npm) | Prayer times, Qibla | Yes | MIT | No | — | — |
| Browser Intl | Hijri date | Yes | Built-in | No | Rounds to ±1 day; you can adjust it in Settings | — |
| Dexie, MiniSearch, React, React Router, Lucide | App libraries | Yes | MIT / ISC | No | — | — |
| Amiri Quran, Inter fonts | Typography | Yes (bundled) | SIL OFL | No | — | — |
| vite-plugin-pwa / Workbox | Offline mode, install | Yes | MIT | No | — | — |
| Browser Notification API | Prayer reminders | Optional | Built-in | No | Fires only while the app is open or running in the background | — |
| Geolocation / DeviceOrientation | Location, compass | Optional | Built-in | No | Some devices have no compass; the app falls back to showing the bearing | Manual city or coordinates |
| Vercel Hobby | Hosting | For public URL | Free | No | Hobby use only, 100 GB bandwidth/month | Cloudflare Pages, GitHub Pages |
| GitHub | Source code | Yes | Free | No | — | — |

Not used: paid AI APIs, Supabase, Google Maps, analytics, Sentry, or email services.

**Can this project be run without spending money? Yes.**

## Known limitations

- Prayer times are shown in your **device's** time zone, so if you pick a city in another time zone, the times appear in your local time.
- Browsers don't guarantee prayer reminders after the app is fully closed, because there's no push server.
- On-device AI explanations (WebLLM) and semantic search (Transformers.js) are planned but not built yet.
- Only one translation is included for now. Most modern translations (for example Saheeh International and most Urdu ones) are copyrighted, so they're left out.
