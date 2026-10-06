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

- **AI** — `src/lib/ai.ts` defines `AIProvider` with `NoAIProvider` (default) and `LocalAIProvider` (WebLLM in a Web Worker, opt-in). Pipeline on the Ask page:
  question → on-device retrieval of verified ayahs (MiniSearch) → model prompted to use *only* those sources and cite `[s:a]` → **citation validation** (invented references are stripped; uncited answers are withheld) → displayed in a box labelled "AI reflection — not Quran, hadith or a ruling", with the verified sources listed separately below. The AI runtime (~6 MB) and model weights are only downloaded after the user opts in.
- **Cloud AI (default AI mode)** — `FreeRemoteAIProvider` → Vercel function `api/ask.ts` → Groq free tier. It uses the same grounding and citation-validation pipeline; the server re-derives the source text from references. Users can switch to On-device or Sources only on the Ask page.
- **Cloud (optional)** — `src/lib/cloud.ts` lazy-loads Supabase only when configured. Sync is two-way with last-write-wins and tombstones, using a per-record hash so only changed rows are sent; auto-increment tables get device-independent `syncKey`s. Schema and RLS: `supabase/schema.sql`.
- **Study layer (optional)** — `src/lib/qurancom.ts`: tajweed (parsed into safe text segments, never injected as HTML), word-by-word, tafsir (HTML → text), extra translations.
- **Audio** — `src/lib/audio.ts` builds URLs from a reciter id; swapping the CDN is a one-line change.
- **Search** — `src/lib/search.ts` (MiniSearch, Arabic normalisation for search only).
- **Notifications** — `src/lib/notify.ts` (browser Notification API).

## Theming & i18n

Design tokens are CSS variables in `src/index.css` (`--bg`, `--surface`, `--brand`, `--hero-a/b`, `--accent`, …), switched by `data-theme` (light/dark) and `data-accent` (emerald/lavender/teal) on `<html>`. Logical properties (`ps-`, `me-`, `start-`) make layouts mirror correctly when `dir="rtl"`. UI strings live in `src/lib/i18n.ts`.
