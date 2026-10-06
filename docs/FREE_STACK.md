# Free-stack audit

| Dependency / service | Purpose | Open source? | Required? | Free? | Credit card? | Limitations | Alternative |
|---|---|---|---|---|---|---|---|
| React, React DOM, React Router | UI & routing | Yes (MIT) | Yes | Yes | No | — | — |
| Vite, TypeScript | Build tooling | Yes (MIT/Apache-2.0) | Dev | Yes | No | — | — |
| Tailwind CSS v4 | Styling | Yes (MIT) | Yes | Yes | No | — | — |
| vite-plugin-pwa / Workbox | Service worker, offline, install | Yes (MIT) | Yes | Yes | No | iOS limits background tasks | — |
| Dexie (+ dexie-react-hooks) | IndexedDB storage | Yes (Apache-2.0) | Yes | Yes | No | Data is per-browser; use Export | Raw IndexedDB |
| MiniSearch | On-device full-text search | Yes (MIT) | Yes | Yes | No | — | FlexSearch |
| adhan-js | Prayer times & Qibla maths | Yes (MIT) | Yes | Yes | No | Results depend on chosen method | praytimes.js |
| lucide-react | Icons | Yes (ISC) | Yes | Yes | No | — | Heroicons |
| Amiri Quran, Inter (Fontsource) | Typography, bundled | Yes (SIL OFL) | Yes | Yes | No | — | Scheherazade New |
| Tanzil.net | Quran text & metadata (bundled) | Open licence (CC BY 3.0) | Yes | Yes | No | Text must stay verbatim, with attribution | — |
| Pickthall translation (via Tanzil) | English meaning (bundled) | Public domain | Yes | Yes | No | Archaic English | Add other licensed translations |
| EveryAyah.com | Recitation audio (streamed) | Free public archive | Optional | Yes | No | Needs internet the first time each file plays | Other free recitation CDNs |
| hadith-api (jsDelivr CDN) | Hadith (fetched on demand) | Yes (repo is open source) | Optional | Yes | No | Needs internet the first time each book is opened | sunnah.com links |
| Browser Intl (Umm al-Qura) | Hijri dates | Built in | Yes | Yes | No | ±1 day vs local sighting (adjustable) | — |
| Notification / Geolocation / DeviceOrientation APIs | Reminders, location, compass | Built in | Optional | Yes | No | No guaranteed delivery once the app is closed; some devices lack a compass | Manual location, bearing shown |
| Playwright | End-to-end tests | Yes (Apache-2.0) | Dev, optional | Yes | No | — | — |
| GitHub | Code hosting | — | Yes | Free plan | No | — | GitLab |
| Vercel Hobby | Hosting | — | For a public URL | Free plan | No | Non-commercial use, bandwidth caps | Cloudflare Pages, GitHub Pages |

**Not used:** OpenAI, Anthropic, Gemini or any paid AI; paid vector DBs; Algolia; Google Maps; paid analytics; Sentry; OneSignal or Firebase; paid email; paid fonts, icons or templates.

## Can this project be run without spending money?

**Yes.** Every required piece is open source, built into the browser, or a free plan that needs no payment method.
