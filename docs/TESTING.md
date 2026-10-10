# Test Plan and Testing Guide

## 1. Strategy

| Level | Tool | What it proves |
|---|---|---|
| Static | `tsc -b` (strict TypeScript), `oxlint` | Type safety, no dead imports, lint rules |
| Unit | `tsx` scripts | AI citation validation, Qibla and compass maths |
| End-to-end | Playwright (Chromium) | Real pages render, interactions work, no console errors, no overflow |
| Live data | Playwright against production | Third-party sources (quran.com, hadith-api, Groq) respond as expected |
| Manual | Real phones | Sensors, install, WhatsApp handoff, Google login, cross-device sync |

**Rule:** a feature is only "done" once it has been exercised in a real browser. A passing build isn't enough.

## 2. Running the tests

```bash
npm test                                  # unit
npm run build                             # type-check + production build
npm run preview                           # terminal 1 (http://localhost:4173)
npx playwright install chromium           # first time only
npm run test:e2e                          # terminal 2: full route sweep
U=http://localhost:4173 node tests/responsive.mjs    # responsive audit
U=https://siratpath.vercel.app node tests/urdu-hadith.mjs   # against production
```

## 3. Automated suites

| File | Covers |
|---|---|
| `tests/citations.test.ts` | Invented `[s:a]` references are stripped; uncited answers are withheld |
| `tests/compass.test.ts` | Qibla bearing, declination and tilt compensation |
| `tests/e2e.mjs` | 31 routes at 390 px and 1440 px, light and dark, all accents, Urdu RTL, error boundaries. Also: marking a salah, an azkar counter, Zakat input focus, a quiz, seeded habits |
| `tests/responsive.mjs` | Horizontal overflow and console errors from 320 to 1440 px |
| `tests/urdu-hadith.mjs` | Urdu loads and matches the cards in Bukhari and Nasaʾi (mirror fallback); Urdu-only mode hides English |
| `tests/offline-*.mjs` | App shell and downloaded packs work with the network disabled |
| `tests/ai-live.mjs` | `/api/ask` returns grounded, cited answers in production |

## 4. Manual test cases

Run these before major releases. Record the result and the device.

| ID | Case | Steps | Expected |
|---|---|---|---|
| M1 | Install (Android) | Open the site in Chrome → Install banner → Install | Icon on the home screen; opens full-screen |
| M2 | Install (iOS) | Safari → Share → Add to Home Screen | Opens standalone, with the correct icon and name |
| M3 | Offline | Visit once, turn on airplane mode, reopen | Home, Quran, Salah, Duas and Qibla all work |
| M4 | Prayer times | Allow location | Times match a trusted local timetable within 1–2 minutes for the chosen method |
| M5 | Qibla | Hold the phone flat, away from metal | Points towards Makkah, matching the map bearing |
| M6 | WhatsApp share | Share an ayah → send → return to the app | WhatsApp opens with text and link; the app is **not** blank on return |
| M7 | Link preview | Paste the site link into WhatsApp | Preview shows the title, description and image |
| M8 | Urdu hadith | Hadith → Bukhari → book 1 → اردو | Urdu text in Nastaliq, right-to-left, with grades below |
| M9 | Email sign-up | Account → sign up → confirm the email | Signed in, and the profile is created |
| M10 | Google sign-in | Account → Continue with Google | Returns to `/account` signed in |
| M11 | Sync | Bookmark on phone A, then open laptop B signed in as the same user | The bookmark appears on B |
| M12 | RLS isolation | Sign in as user X; using user Y's id, query `user_records` through the API | Zero rows returned |
| M13 | Report | Signed in → Report on a dua → submit | Appears in `/admin` for the admin only |
| M14 | Delete account | Account → Delete account → confirm | Signed out; the user and their rows are gone in Supabase |
| M15 | Backup | Settings → Your data → Export, clear site data, Import | All data restored |
| M16 | Update | Deploy a change, then reopen the installed app | The new version appears within one focus or reload |

## 5. Latest results

| Date | Scope | Result |
|---|---|---|
| 2026-10-10 | `urdu-hadith.mjs` local + production | Pass (Bukhari 7/7, Nasaʾi 23/23 with Urdu) |
| 2026-10-08 | `responsive.mjs` on production | Pass, no overflow or errors |
| 2026-10-08 | M6 WhatsApp handoff | Fixed in code; still to be confirmed on a real phone |
| 2026-10-07 | M11 cross-device sync | Pass (user-verified) |
| — | M14 account deletion | **Not yet tested** |
| — | M10 Google sign-in in a real browser | Server config verified; real login not yet tested |

## 6. Not covered automatically

- **On-device AI generation:** needs WebGPU and a model download of 300 MB or more. The retrieval and fallback paths are tested.
- **Sensors, install prompts and the WhatsApp handoff:** these need real devices (M1–M6).
