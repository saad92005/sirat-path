# Architecture

## Why a static SPA (Vite + React), not Next.js

Everything Sirat Path does runs in the browser: prayer maths, Qibla, Hijri dates, search, storage and the tracker logic. Server rendering would add hosting cost and complexity without adding features, and a fully static build:

- deploys to any free static host (Vercel, Cloudflare Pages, GitHub Pages)
- is completely precached by the service worker, so the app works offline from the second visit
- has no server to secure, rate-limit or pay for

## Layers

```
src/
  content/      religious & learning content as typed data (duas, courses, hajj steps)
  lib/          domain logic — quran loader, search, prayer, hijri, audio, db, i18n, settings
  components/   design system (ui.tsx: Ring, Sheet, Tabs, PageHeader, Empty) + shell (Layout, AudioBar, CommandPalette)
  pages/        one file per screen, lazy-loaded (React.lazy) except Home
public/data/    quran.json, generated from data-src/ by scripts/build-data.mjs
```

## Data & state

| Kind | Where | Why |
|---|---|---|
| Quran text + translation | `public/data/quran.json` (precached) | One 2.2 MB file (~600 KB gzipped), no per-ayah requests |
| Hadith | fetched per book from hadith-api, cached by Workbox | Too large to bundle; licence reasons (see DATA_SOURCES) |
| Audio | streamed from EveryAyah, cached on play/download | Not redistributed |
| User data (bookmarks, notes, salah log, azkar, journal, habits, learning, Ramadan, dhikr) | IndexedDB via Dexie (`src/lib/db.ts`) | Private, offline, no account |
| Preferences | `localStorage` (`sirat-settings`) through a `useSyncExternalStore` store | Small and synchronous |

Backup/restore is a JSON export in Settings. Optional cloud sync (Supabase free tier) can be added behind the same `db` module; it is deliberately not required.

## Provider abstractions

- **AI** — `src/lib/ai.ts` defines `AIProvider`. The default `NoAIProvider` never fabricates answers; the Ask page returns verified ayahs only. A local WebLLM/Transformers.js provider can plug in without touching pages.
- **Audio** — `src/lib/audio.ts` builds URLs from a reciter id; swapping the CDN is a one-line change.
- **Search** — `src/lib/search.ts` (MiniSearch, Arabic normalisation for search only).
- **Notifications** — `src/lib/notify.ts` (browser Notification API).

## Theming & i18n

Design tokens are CSS variables in `src/index.css` (`--bg`, `--surface`, `--brand`, `--hero-a/b`, `--accent`, …), switched by `data-theme` (light/dark) and `data-accent` (emerald/lavender/teal) on `<html>`. Logical properties (`ps-`, `me-`, `start-`) make layouts mirror correctly when `dir="rtl"`. UI strings live in `src/lib/i18n.ts`.
