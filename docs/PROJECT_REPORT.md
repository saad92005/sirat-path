# Project Report: Sirat Path

**An offline-first, source-verified Islamic companion app with grounded AI**

| | |
|---|---|
| Author | saad92005 |
| Live | https://siratpath.vercel.app |
| Code | https://github.com/saad92005/sirat-path |
| Period | October 2026 (first release 6 Oct 2026) |
| Stack | React 19 · TypeScript · Vite · PWA (Workbox) · IndexedDB · Supabase · Vercel Functions · Groq |

---

## 1. Abstract

Sirat Path is a free Progressive Web App covering a Muslim's daily practice: Quran with translations and recitation, prayer times and tracking, Qibla, duas and azkar, hadith, learning courses, and tools for Ramadan, Zakat and Hajj.

Three things set it apart:

1. **It works offline and needs no account.** It installs from the browser, with no app store.
2. **Every religious text traces to a named, verifiable source.** The app never generates religious text.
3. **Its AI assistant is grounded.** It may only answer from Quran verses retrieved for the question, and its citations are checked automatically before anything is shown.

The whole system runs on free tiers for $0 per month and is live in production.

## 2. Problem statement

Popular Islamic apps tend to have four problems:

- **Ads, subscriptions and tracking:** these erode trust in a religious context.
- **Mixed provenance:** unsourced content, or AI text presented alongside the Quran without labels.
- **Online-only design:** these apps fail exactly where connectivity is weakest.
- **Weak Urdu support:** they serve one of the largest Muslim language communities poorly.

General-purpose AI chatbots add a further risk: they **hallucinate Quran verses and hadith references**. In this domain that is a serious failure.

## 3. Objectives

1. Deliver the core practice features in one installable app that works offline.
2. Guarantee content integrity: verbatim Quran text, referenced duas and hadith, and named scholars' gradings.
3. Offer an AI Q&A feature that **cannot cite a source it wasn't given**.
4. Make privacy the default: guest mode with no data leaving the device, and optional sync protected by Row Level Security.
5. Serve English and Urdu speakers equally, including a right-to-left UI.
6. Operate at zero cost.

## 4. What makes it unique

| Feature | Typical apps | Sirat Path |
|---|---|---|
| Quran text | Varying sources | Tanzil verified text, byte-exact, never edited |
| AI answers | Free-form chatbot | Retrieval-grounded, citation-validated, labelled "AI reflection", with a sources-only fallback |
| Hadith | Often without grading | Grades from named scholars on every hadith; EN / UR / Both |
| Offline | Partial | Full app shell plus downloadable packs (hadith, translations, audio) |
| Account | Often required | Optional; guest mode is fully featured |
| Cost to user | Ads or subscription | Free, no ads, cookie-free analytics |
| Distribution | App stores | Installable PWA, one link, shareable on WhatsApp with rich previews |

## 5. System overview

These are summarised from [ARCHITECTURE.md](ARCHITECTURE.md) and [DESIGN.md](DESIGN.md).

- **Client:** a static React SPA. All domain logic runs on the device: prayer astronomy (adhan), Qibla with World Magnetic Model declination, Hijri dates, and full-text search (MiniSearch).
- **Storage:**
  - IndexedDB holds personal data.
  - The service worker caches the app and any content the user has viewed.
  - Supabase mirrors personal data for signed-in users, using one generic `user_records` table, hash-based change detection, last-write-wins and tombstones.
- **AI pipeline:** this is the main technical contribution.
  1. **Retrieve** relevant ayahs on the device.
  2. Send only the references to `/api/ask`. The **server re-reads the verse text from its own verified copy**, so a client can't inject fake sources.
  3. The LLM is instructed to answer only from those sources and to cite `[surah:ayah]`.
  4. **Validate:** citations outside the retrieved set are stripped, and answers with no valid citation are withheld.
  5. Display the answer in a labelled box, separate from the verified sources.
- **Resilience:** fallback chains at every external dependency:
  - hadith CDN → GitHub mirror
  - primary → fallback LLM
  - AI → sources only
  - network → cache

## 6. Methodology

The project was built iteratively, with AI-assisted development (Claude Code) under strict project rules ([CLAUDE.md](../CLAUDE.md)). The rules covered never generating religious text, never committing secrets, and verifying every feature in a real browser. Each iteration went through the same loop: requirement, implementation, a type-check and build, a Playwright run against a local build, deployment, and a re-check against production.

## 7. Testing and results

See [TESTING.md](TESTING.md).

- Unit tests for citation validation and the compass maths.
- An end-to-end sweep of 31 routes at phone and desktop sizes, in light and dark themes, three accent themes and Urdu RTL. It fails on any console error or horizontal overflow.
- Live tests against production data sources and the AI endpoint.
- **Bug found by testing:** the hadith CDN had started returning 403 for two of the six major books (Nasaʾi and Ibn Majah). This was found while checking the Urdu translation feature, and fixed with a mirror fallback.
- **Bug found by user feedback:** after sharing to WhatsApp, the app showed a blank screen. The cause was a leftover `wa.me` tab, fixed by opening the WhatsApp app scheme directly with a timed fallback.

## 8. Challenges and how they were solved

| Challenge | Solution |
|---|---|
| Stopping AI from inventing verses | Server-side source lookup, citation whitelist validation, withholding uncited answers |
| Large content (Quran audio, 9 hadith collections) | On-demand loading, service-worker caching, opt-in offline packs |
| Licensing of translations | Bundle only public-domain or CC-licensed texts; fetch everything else at runtime with attribution |
| Accurate Qibla on phones | Magnetic-to-true-north correction (WMM 2025), tilt and screen-rotation compensation, smoothing |
| Sync without per-table schemas | One generic RLS-protected table, device-independent keys, hash diffing |
| Installed PWAs stuck on old versions | `no-cache` service worker, hourly and on-focus update checks, automatic reload |
| Urdu typography and RTL | Noto Nastaliq Urdu, logical CSS properties, a mirrored layout |

## 9. Limitations

- The Urdu hadith dataset doesn't name its translator, and the app labels this. Verified printed editions remain the reference.
- Some collections (Abu Dawud, Tirmidhi, Nasaʾi, Ibn Majah) include weak hadith. Grades are shown, but weak hadith aren't hidden by default.
- Reminders rely on browser notifications and calendar export. There is no server push yet.
- On-device AI needs WebGPU and a large model download.

## 10. Future work

- Hide weak hadith by default, with a "show all" toggle.
- Web Push reminders.
- Play Store listing through a Trusted Web Activity.
- Multi-user family accounts for kids mode.
- Further licensed translations (Sindhi, Pashto, Bengali).

## 11. Skills demonstrated

- **Frontend engineering:** React 19, TypeScript strict, responsive and RTL design, accessibility.
- **PWA and offline architecture:** Workbox strategies, IndexedDB, background update handling.
- **Applied AI safety:** retrieval-augmented generation (RAG) with citation validation. This is a concrete method for reducing LLM hallucination.
- **Backend and security:** Postgres Row Level Security, security-definer functions, secret management, origin checks and rate limiting.
- **Product and growth:** SEO, Open Graph, WhatsApp sharing, install funnel, analytics.
- **Quality:** automated browser testing, production verification, documentation.

**CV line:**

> Built and launched *Sirat Path* (siratpath.vercel.app), an offline-first Islamic companion PWA (React/TypeScript/Supabase). It has a retrieval-grounded AI assistant whose citations are validated against verified Quran text, Urdu/English support with RTL, cross-device sync secured with Postgres RLS, and a $0/month serverless architecture.
