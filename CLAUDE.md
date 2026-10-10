# Sirat Path: instructions for AI coding assistants

These instructions are for Claude Code, Cursor, Copilot and similar tools working in this repo. Read this file before making changes.

## What this is

Sirat Path is an offline-first Islamic companion PWA. It's live at https://siratpath.vercel.app and deploys automatically from `main` to Vercel.

## Stack

- **Frontend:** Vite 8, React 19, TypeScript, Tailwind CSS v4, React Router 7.
- **PWA:** vite-plugin-pwa (Workbox).
- **Local data:** Dexie (IndexedDB) for user data; `localStorage` (`sirat-settings`) for preferences.
- **Optional cloud:** Supabase (auth + `user_records` sync). The schema is in `supabase/schema.sql`.
- **Serverless:** `api/ask.ts`, a Vercel function that proxies Groq for the Ask feature.
- **Other libraries:** adhan (prayer times), MiniSearch (search), Leaflet (Qibla map), WebLLM (optional on-device AI).

## Commands

```bash
npm run dev        # http://localhost:5173
npm run build      # tsc -b + vite build. Must pass before committing.
npm run preview    # serve dist/ with the service worker (port 4173)
npm test           # unit tests (citation validation, compass)
npm run lint       # oxlint
U=http://localhost:4173 node tests/responsive.mjs   # Playwright responsive audit
```

**Don't run `build` while `dev` is running from the same folder.**

## Layout

```
src/pages/       one file per route (lazy-loaded except Home)
src/components/  shared UI (ui.tsx primitives, Layout, WhatsAppButton, InstallBanner…)
src/lib/         domain logic (quran, qurancom, hadithApi, prayer, db, cloud, settings, share, seo, ai)
src/content/     hand-written, sourced content (duas, courses, Hajj steps)
public/data/     quran.json, generated from data-src/ by `npm run data`
api/             Vercel serverless functions
tests/           Playwright and unit scripts (put ad-hoc scripts here too)
docs/            product and engineering documentation
```

## Hard rules

1. **Never edit or generate Quran text.** It comes only from `data-src/` (Tanzil, byte-exact; `.gitattributes` protects it).
2. **Never invent a hadith reference, dua, grading or source.** If a source can't be confirmed, leave the item out. Read `docs/RELIGIOUS_CONTENT_POLICY.md`.
3. **Never commit secrets.** `GROQ_API_KEY` lives only in Vercel's encrypted environment variables. The client may use only the Supabase **anon/publishable** key, never service_role.
4. **Every new Supabase table needs RLS** and explicit grants (see the end of `schema.sql`).
5. **Never use `dangerouslySetInnerHTML`.** Remote HTML such as tafsir is converted to text.
6. **Keep the app working in guest mode.** Supabase must stay optional.
7. **Keep everything free.** Don't add paid APIs or services.
8. **Fetch hadith only through `src/lib/hadithApi.ts`.** It contains the jsDelivr → GitHub mirror fallback.
9. **Every new remote origin needs a matching `runtimeCaching` rule** in `vite.config.ts` so it works offline.

## Conventions

- Use Tailwind utility classes and the design tokens in `src/index.css` (`bg-surface`, `text-muted`, `text-brand`…). Use logical properties (`ps-`, `me-`, `start-`) so RTL works.
- Read and write preferences with `useSettings()` / `setSettings()`. When you add a setting, add its default to `DEFAULTS` in `src/lib/settings.ts`.
- Use `usePageMeta()` (`src/lib/seo.ts`) for page titles and descriptions.
- Tap targets are at least 40 px (`size-10`). Icons in action rows are 20 px.
- Put no side effects inside `setState` updaters, because StrictMode calls them twice.
- Keep comments short and only where the reason isn't obvious.

## Definition of done

- `npm run build` passes.
- The changed feature was exercised in a real browser (Playwright or by hand), not just compiled.
- There is no horizontal overflow at 320 px.
- Docs are updated if behaviour, data sources or privacy changed. That includes `docs/PRIVACY_POLICY.md` whenever data collection changes.
