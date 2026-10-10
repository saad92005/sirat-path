# Software Requirements Specification: Sirat Path

*Structure follows IEEE 830 / ISO/IEC/IEEE 29148.*

| | |
|---|---|
| Version | 1.0 |
| Date | 10 October 2026 |
| Author | saad92005 |
| Live system | https://siratpath.vercel.app |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements of **Sirat Path**, an offline-first Islamic companion Progressive Web App. It's written for developers, testers, supervisors and evaluators.

### 1.2 Scope

Sirat Path provides:

- Quran reading and recitation
- prayer times, a prayer tracker and the Qibla
- duas and azkar
- hadith collections
- Islamic learning
- tools for Ramadan, Zakat and Hajj

It runs in any modern browser, installs on Android, iOS and desktop, and works offline. Accounts and cloud sync are optional. The system doesn't issue religious rulings, and it doesn't generate religious text.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| PWA | Progressive Web App: a website that installs and runs offline through a service worker |
| Ayah / Surah | A verse / a chapter of the Quran |
| Azkar | Remembrance formulas, e.g. morning and evening |
| Hadith grade | A scholar's authenticity assessment (sahih, hasan, daʿif) |
| RLS | Row Level Security (Postgres per-row access control) |
| Guest mode | Using the app without an account; all data stays on the device |
| Tanzil | The verified Quran text project used as the canonical Arabic source |

### 1.4 References

- [PRD.md](PRD.md): product goals
- [ARCHITECTURE.md](ARCHITECTURE.md), [DESIGN.md](DESIGN.md), [DATA_MODEL.md](DATA_MODEL.md)
- [RELIGIOUS_CONTENT_POLICY.md](RELIGIOUS_CONTENT_POLICY.md), [DATA_SOURCES.md](DATA_SOURCES.md)
- [SECURITY.md](SECURITY.md), [PRIVACY_POLICY.md](PRIVACY_POLICY.md)

## 2. Overall description

### 2.1 Product perspective

Sirat Path is a standalone client application. It talks to these external services:

| Service | Purpose |
|---|---|
| Supabase | Auth and sync (optional) |
| Vercel function → Groq | AI answers |
| api.quran.com | Study content |
| hadith-api (jsDelivr / GitHub) | Hadith |
| EveryAyah | Recitation audio |
| OpenStreetMap | Map tiles |

### 2.2 User classes

| Class | Description | Privileges |
|---|---|---|
| Guest | Anyone using the app | Every feature except sync and in-app reporting |
| Registered user | Signed in with email or Google | + cloud sync, content reports, account deletion |
| Administrator | A registered user with `role = 'admin'` | + review and resolve content reports |

### 2.3 Operating environment

- Chrome or Edge 100+, Safari 16.4+ and Firefox 110+, on Android, iOS, Windows, macOS and Linux.
- Screen widths from 320 px to 2560 px.
- Optional WebGPU for on-device AI.

### 2.4 Constraints

- **C1:** Only free-tier services may be used.
- **C2:** Quran text must be reproduced verbatim from Tanzil (CC BY 3.0, verbatim-only licence).
- **C3:** Third-party translations may only be fetched at runtime, not redistributed, unless their licence permits redistribution.
- **C4:** No server-side secrets may reach the client.

### 2.5 Assumptions

- Users have internet access on the first visit.
- Location permission, or a manually chosen city, is available for prayer times.

## 3. Functional requirements

Priority: **H** = must, **M** = should, **L** = could.

### 3.1 Quran

| ID | Requirement | Priority |
|---|---|---|
| FR-Q1 | The system shall list all 114 surahs with name, translation, ayah count and revelation place | H |
| FR-Q2 | The system shall display each ayah's Arabic text exactly as in Tanzil Uthmani v1.1 | H |
| FR-Q3 | The user shall choose a translation mode: English, Urdu, Both or Off. The choice persists | H |
| FR-Q4 | The user shall choose between five Urdu translators | M |
| FR-Q5 | The system shall offer verse mode, Mushaf mode and Hifz (hide-text) mode | M |
| FR-Q6 | The user shall bookmark ayahs, add notes and resume from the last-read position | H |
| FR-Q7 | The system shall offer tajweed colouring, word-by-word and five tafsirs on demand | M |
| FR-Q8 | The system shall play recitation from five reciters, with repeat, speed and a sleep timer | H |
| FR-Q9 | The user shall plan a Khatm with a daily target | M |

### 3.2 Salah and Qibla

| ID | Requirement | Priority |
|---|---|---|
| FR-S1 | The system shall calculate the five daily prayers and sunrise on the device, using 12 methods and Hanafi or Shafi Asr | H |
| FR-S2 | The system shall show a countdown to the next prayer | H |
| FR-S3 | The user shall log each prayer as on time, in jamaʿah, late or missed, and view 7-day history | H |
| FR-S4 | The system shall send reminders and export prayer times as an `.ics` calendar | M |
| FR-S5 | The system shall show a monthly printable timetable | M |
| FR-S6 | The system shall show the Qibla direction, corrected to true north, with tilt compensation and a map | H |

### 3.3 Duas, azkar and dhikr

| ID | Requirement | Priority |
|---|---|---|
| FR-D1 | The system shall show duas in 14 categories, each with a Quran or hadith reference | H |
| FR-D2 | The system shall run morning and evening azkar sessions with counters and daily completion | H |
| FR-D3 | The system shall provide a tasbih counter with presets, custom dhikr and history | M |

### 3.4 Hadith

| ID | Requirement | Priority |
|---|---|---|
| FR-H1 | The system shall provide nine collections, browsable by book | H |
| FR-H2 | Each hadith shall show Arabic text, collection and number, and the available scholars' grades | H |
| FR-H3 | The user shall choose English, Urdu or Both for seven collections that have an Urdu edition | H |
| FR-H4 | If the primary CDN fails, the system shall load hadith from a mirror | H |
| FR-H5 | The user shall search within a book and save hadith | M |

### 3.5 Ask Islam (AI)

| ID | Requirement | Priority |
|---|---|---|
| FR-A1 | The system shall retrieve relevant ayahs for a question on the device | H |
| FR-A2 | The system shall generate an answer only from the retrieved ayahs (Cloud or On-device mode) | M |
| FR-A3 | The system shall remove citations not in the retrieved set, and withhold answers with no valid citation | H |
| FR-A4 | AI output shall be visibly labelled "AI reflection: not Quran, hadith or a ruling" | H |
| FR-A5 | The system shall offer a Sources-only mode that needs no AI | H |

### 3.6 Accounts, sync and administration

| ID | Requirement | Priority |
|---|---|---|
| FR-U1 | The user shall register and sign in with email and password, or Google | M |
| FR-U2 | The user shall reset a forgotten password | M |
| FR-U3 | The system shall sync personal data two ways when signed in, with tombstones for deletions | M |
| FR-U4 | The user shall permanently delete their account and synced data | H |
| FR-U5 | Signed-in users shall report content errors; guests are sent to GitHub Issues | M |
| FR-U6 | Admins shall list, resolve and reject reports | M |
| FR-U7 | The user shall export and import a JSON backup | H |

### 3.7 Other tools

| ID | Requirement | Priority |
|---|---|---|
| FR-O1 | Ramadan mode is detected automatically, with Suhoor and Iftar countdowns and a 30-day tracker | M |
| FR-O2 | A Zakat calculator with a gold or silver nisab, showing its assumptions | M |
| FR-O3 | Hajj and Umrah step-by-step guides with checklists | M |
| FR-O4 | A Hijri calendar with events and an adjustable offset | M |
| FR-O5 | The 99 Names with flashcards; habits; a private journal; an insights heatmap; kids mode | L |
| FR-O6 | Learn: courses → lessons → quizzes, with progress and sources | M |
| FR-O7 | Universal search (Ctrl+K) across the Quran, duas, pages and names | M |

### 3.8 Sharing and growth

| ID | Requirement | Priority |
|---|---|---|
| FR-G1 | Share any ayah, hadith or dua to WhatsApp with its text, reference and deep link | H |
| FR-G2 | Share an ayah or hadith as an image | M |
| FR-G3 | Every route shall have a title, description and Open Graph preview image | M |
| FR-G4 | Show an install banner (Android prompt, iOS instructions), dismissible for 14 days | M |

## 4. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Home is interactive in under 3 s on a mid-range phone on 4G. Later visits load from cache |
| NFR-2 | Offline | All bundled features work with no network after the first visit. Viewed remote content stays available offline |
| NFR-3 | Responsiveness | No horizontal overflow from 320 px to 1440 px, in light and dark, LTR and RTL |
| NFR-4 | Security | RLS on all tables, no secrets in the client, AI endpoint restricted to allowed origins and rate-limited |
| NFR-5 | Privacy | No personal data leaves the device in guest mode. Cookie-free analytics only |
| NFR-6 | Integrity | Quran text is generated only from the unmodified Tanzil files in `data-src/` (protected from line-ending changes by `.gitattributes`). No invented references |
| NFR-7 | Availability | Hosted on Vercel's CDN. Data-source outages handled through mirrors and cache |
| NFR-8 | Usability | Tap targets at least 40 px. English, Urdu and Arabic UI with RTL. Keyboard shortcuts on desktop |
| NFR-9 | Maintainability | TypeScript strict, one file per route, domain logic kept in `src/lib` |
| NFR-10 | Cost | $0 per month to operate |
| NFR-11 | Updates | Installed PWAs pick up new deployments automatically, within an hour or on focus |

## 5. External interfaces

- **User interface:** a mobile bottom nav with sheets, and a desktop sidebar. See [DESIGN.md](DESIGN.md).
- **Software interfaces:**
  - Supabase JS SDK (REST + Auth)
  - `POST /api/ask` (JSON: `{ question, refs[] }` → `{ answer, model }`)
  - quran.com v4 REST
  - hadith-api static JSON
- **Hardware interfaces:** GPS, magnetometer and orientation sensors (Qibla), audio output, vibration (tasbih).

## 6. Traceability

| Requirement group | Implemented in | Verified by |
|---|---|---|
| Quran (FR-Q) | `src/pages/Reader.tsx`, `src/lib/quran.ts`, `src/lib/qurancom.ts` | `tests/e2e.mjs`, manual |
| Salah (FR-S) | `src/pages/Prayer.tsx`, `src/lib/prayer.ts`, `src/lib/compass.ts` | `tests/compass.test.ts`, e2e |
| Hadith (FR-H) | `src/pages/Hadith.tsx`, `src/lib/hadithApi.ts` | `tests/urdu-hadith.mjs` |
| AI (FR-A) | `src/pages/Ask.tsx`, `src/lib/ai.ts`, `api/ask.ts` | `tests/citations.test.ts`, `tests/ai-live.mjs` |
| Sync (FR-U) | `src/lib/cloud.ts`, `supabase/schema.sql` | Manual two-device test ([TESTING.md](TESTING.md)) |
| Responsive (NFR-3) | All pages | `tests/responsive.mjs` |
| Offline (NFR-2) | `vite.config.ts`, `src/lib/offline.ts` | `tests/offline-*.mjs` |
