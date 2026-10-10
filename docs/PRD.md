# Product Requirements Document: Sirat Path

| | |
|---|---|
| **Product** | Sirat Path, *walk the straight path, step by step* |
| **Type** | Installable Progressive Web App (PWA), mobile-first with a desktop layout |
| **Live** | https://siratpath.vercel.app |
| **Repository** | https://github.com/saad92005/sirat-path |
| **Status** | Live (v1.x), October 2026 |
| **Owner** | saad92005 |

---

## 1. Problem

Muslims who want a daily companion for Quran, prayer, duas and hadith usually end up with several separate apps. Many of those apps:

- show ads, sell subscriptions or track users
- need an account and a constant internet connection
- mix verified religious text with unsourced or AI-generated content and don't say which is which
- support Urdu poorly, even though it's the first language of a very large share of Muslims (Pakistan, India and the diaspora)

## 2. Vision

One free, private, offline-first app that covers a Muslim's daily practice. Every piece of religious content traces back to a named, verifiable source.

## 3. Target users

| Persona | Needs |
|---|---|
| **Daily practitioner** (18–45, Urdu or English speaker) | Prayer times, Quran reading with translation, morning and evening azkar, tracking consistency |
| **Student of knowledge** | Tafsir, word-by-word, hadith with gradings, cross-references |
| **Parent** | Kids mode, simple duas, the 99 Names |
| **Ramadan / Hajj user** | Suhoor and Iftar timings, a 30-day tracker, Hajj and Umrah step-by-step guidance |
| **Low-connectivity user** | Everything core works offline after the first visit |

## 4. Goals and success metrics

| Goal | Metric | Target |
|---|---|---|
| Useful daily | Weekly returning visitors (Vercel Analytics) | 30% of monthly visitors |
| Spreads by sharing | Visits referred by WhatsApp and social links | Rising month over month |
| Trustworthy | Open content-error reports older than 7 days | 0 |
| Works everywhere | Responsive audit failures at 320–1440 px | 0 |
| Free to run | Monthly hosting and API cost | PKR 0 / $0 |

## 5. Scope

### 5.1 Must have (shipped)

- **Quran:** all 114 surahs from the verified Tanzil text, English translation (Pickthall) and five Urdu translations, a translation switch (English / Urdu / Both / Off), verse and Mushaf modes, bookmarks, notes, last-read position.
- **Audio:** five reciters, repeat, speed control, offline downloads.
- **Salah:** locally calculated prayer times (12 methods, Hanafi or Shafi Asr), reminders, a daily tracker, a monthly timetable.
- **Qibla:** compass with true-north correction, plus a map.
- **Duas and azkar:** every item has a Quran or hadith reference.
- **Hadith:** nine collections in Arabic, English and Urdu (seven collections), with scholars' gradings.
- **Search:** universal search across the app.
- **Offline:** the whole app shell works offline, and there are optional offline packs.
- **Sharing:** WhatsApp share on ayahs, hadith and duas, share-as-image, link previews.
- **UI languages:** English, Urdu and Arabic, with right-to-left layout.

### 5.2 Should have (shipped)

- **Ask Islam:** an AI feature that answers only from retrieved ayahs, with validated citations.
- **Study tools:** tajweed colouring, word-by-word and tafsir.
- **Accounts (optional):** email and Google accounts with two-way cloud sync.
- **Admin:** a review queue for user-reported content errors.
- **Practice tools:** Ramadan, Zakat, Hajj and Umrah, calendar, 99 Names, journal, habits, kids mode, Learn courses.

### 5.3 Could have (backlog)

- Option to hide weak (daʿif) hadith by default.
- Push notifications through a service-worker push service. Today's reminders are local and work through calendar export.
- Native Android packaging (TWA) for the Play Store.
- More Quran translations, added only if properly licensed.

### 5.4 Out of scope

- Issuing fatwas or rulings.
- Generating religious text with AI.
- Ads, paid tiers, or selling user data.
- Social features such as feeds, comments or followers.

## 6. Functional requirements (summary)

The full numbered list is in [SRS.md](SRS.md).

| ID | Requirement | Acceptance criterion |
|---|---|---|
| F1 | Read any surah with Arabic and the selected translation(s) | The text matches Tanzil byte for byte, and the translation switch persists between visits |
| F2 | Show today's prayer times for the user's location | Times are within 1 minute of the chosen calculation method; works offline |
| F3 | Show hadith with reference and grade | Every card shows collection + number and the scholars' grades where the dataset has them |
| F4 | Share any ayah, hadith or dua to WhatsApp | Opens WhatsApp with text, reference and link; returning to the app shows no blank screen |
| F5 | Use the app without an account | Every feature except sync and reporting works in guest mode |
| F6 | Sync across devices when signed in | A change on device A appears on device B after the next sync |
| F7 | AI answers are grounded | Uncited answers are withheld and invented references are stripped |

## 7. Non-functional requirements

- **Performance:** first load under 3 s on 4G; later loads served from the service worker.
- **Offline:** core features work with no network after the first visit.
- **Privacy:** personal data stays on the device unless the user signs in. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md).
- **Security:** Row Level Security on every table, and no secrets in the client. See [SECURITY.md](SECURITY.md).
- **Accessibility:** labelled controls, keyboard shortcuts, contrast that holds in both themes.
- **Cost:** free tiers only. See [FREE_STACK.md](FREE_STACK.md).

## 8. Religious content principles

These are non-negotiable. See [RELIGIOUS_CONTENT_POLICY.md](RELIGIOUS_CONTENT_POLICY.md).

1. The Quran text is never generated or edited.
2. Every dua and hadith carries a reference.
3. Gradings come from named scholars, never from the app.
4. AI output is labelled as AI reflection and kept separate from Quran and hadith.

## 9. Risks

| Risk | Mitigation |
|---|---|
| A third-party data source goes down (hadith CDN, quran.com) | Mirror fallback (jsDelivr → GitHub) and offline caching |
| Errors inside a translation dataset | Translator is named where known, report button on every item, admin review queue |
| AI hallucination | Retrieval-only grounding, server-side source lookup, citation validation, clear labelling |
| Free-tier limits (Groq, Supabase email) | Fallback model, guest mode, rate limiting |
