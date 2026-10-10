# Design Document: Sirat Path

This document covers system design (use cases, components, sequences) and UI design. The data design is in [DATA_MODEL.md](DATA_MODEL.md), and the high-level architecture is in [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. System context

```mermaid
flowchart LR
    U([User<br/>phone / desktop]) --> APP[Sirat Path PWA<br/>static SPA + service worker]
    APP -->|optional auth + sync| SB[(Supabase<br/>Postgres + Auth)]
    APP -->|POST /api/ask| FN[Vercel function<br/>api/ask.ts]
    FN --> GQ[Groq LLM API]
    APP -->|study content| QC[api.quran.com]
    APP -->|hadith JSON| HA[jsDelivr → GitHub mirror]
    APP -->|audio| EA[EveryAyah]
    APP -->|tiles| OSM[OpenStreetMap]
    APP -->|page views| VA[Vercel Analytics]
```

## 2. Use cases

```mermaid
flowchart LR
    G((Guest))
    R((Registered user))
    A((Admin))
    R -.inherits.-> G
    A -.inherits.-> R

    G --- UC1[Read Quran + translation]
    G --- UC2[Listen to recitation]
    G --- UC3[View prayer times / log salah]
    G --- UC4[Find Qibla]
    G --- UC5[Read duas & do azkar]
    G --- UC6[Read hadith EN/UR]
    G --- UC7[Ask Islam]
    G --- UC8[Share to WhatsApp]
    G --- UC9[Download offline packs]
    G --- UC10[Export / import backup]
    R --- UC11[Sync across devices]
    R --- UC12[Report content error]
    R --- UC13[Delete account]
    A --- UC14[Review content reports]
```

### Key use case descriptions

**UC3: View prayer times and log a salah**

- **Actor:** Guest.
- **Precondition:** a location is set (GPS or a chosen city).
- **Main flow:**
  1. The user opens Salah.
  2. The system calculates times on the device and highlights the next prayer.
  3. The user taps a prayer and picks a status.
  4. The system saves it to IndexedDB and updates the 7-day history.
- **Alternate flow:** no location, so the system shows the location picker.
- **Postcondition:** the log persists offline. If the user is signed in, it syncs.

**UC6: Read hadith in Urdu**

- **Actor:** Guest.
- **Main flow:**
  1. Hadith → collection → book.
  2. The system fetches the English and Arabic editions through `hadithFetch` (jsDelivr first, then GitHub).
  3. The user selects اردو. The system fetches the Urdu edition and matches it by hadith number.
  4. Each card shows the Arabic, then the Urdu, and the grades.
- **Alternate flows:**
  - The Urdu edition fails to load, so a notice appears and English is shown.
  - A hadith is missing from the Urdu edition, so English is shown for that card.

**UC7: Ask Islam (Cloud mode)**

- **Actor:** Guest.
- **Main flow:** see the sequence diagram in §4.2.
- **Exception flows:**
  - No relevant ayahs, so the system answers "not enough reliable sources".
  - Groq rate limit, so the fallback model is tried.
  - Still failing, so the system shows sources only.

**UC8: Share to WhatsApp**

- **Main flow:**
  1. The user taps Share on an ayah, hadith or dua.
  2. The system builds the message (text, reference, deep link).
  3. On mobile, it opens `whatsapp://send`. On desktop, it opens WhatsApp Web.
  4. The user returns and the app is unchanged.
- **Alternate flow:** the WhatsApp app isn't installed. After 1.8 s the system falls back to wa.me.

## 3. Component design

```mermaid
flowchart TB
    subgraph Shell
        L[Layout<br/>nav, sidebar, AudioBar, CommandPalette]
        EB[ErrorBoundary]
    end
    subgraph Pages["pages/ (lazy routes)"]
        HOME[Home] --- RD[Reader] --- PR[Prayer] --- HD[Hadith] --- ASK[Ask] --- ACC[Account] --- ADM[Admin]
    end
    subgraph Lib["lib/ (domain)"]
        Q[quran.ts] --- QC[qurancom.ts]
        HAPI[hadithApi.ts]
        P[prayer.ts / compass.ts / hijri.ts]
        DB[db.ts Dexie] --- CL[cloud.ts sync]
        ST[settings.ts store]
        AI[ai.ts providers]
        SH[share.ts / shareImage.ts]
        SEO[seo.ts]
        OFF[offline.ts]
    end
    L --> Pages
    Pages --> Lib
    CL --> DB
    CL --> ST
```

**Design patterns**

| Pattern | Where it's used |
|---|---|
| **Provider / strategy** | `AIProvider`, implemented as `NoAI`, `FreeRemote` and `Local` (WebLLM in a worker) |
| **External store** | `settings.ts` and `offline.ts` use `useSyncExternalStore`, so they're hydration-safe and synchronous |
| **Repository** | `db.ts` hides IndexedDB. `cloud.ts` mirrors it to Supabase without the pages knowing |
| **Fallback chain** | `hadithFetch` (CDN → GitHub), Groq model list, AI mode → sources-only |
| **Cache-first / stale-while-revalidate** | Workbox `runtimeCaching` rules for each remote origin |

## 4. Sequence diagrams

### 4.1 Cloud sync

```mermaid
sequenceDiagram
    participant UI as Page
    participant DB as Dexie (IndexedDB)
    participant CL as cloud.ts
    participant SB as Supabase (RLS)
    UI->>DB: write record
    DB-->>CL: change → scheduleSync()
    CL->>SB: select user_records where updated_at > lastSync
    SB-->>CL: rows (own rows only, via RLS)
    CL->>DB: apply last-write-wins / tombstones
    CL->>CL: hash local records, diff vs last push
    CL->>SB: upsert changed rows
    CL->>CL: save sirat-last-sync
```

### 4.2 Ask Islam (grounded AI)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Browser (Ask.tsx)
    participant F as /api/ask
    participant G as Groq
    U->>C: question
    C->>C: MiniSearch retrieval → top ayah refs
    C->>F: { question, refs }
    F->>F: origin check, validate, rate-limit
    F->>F: look up ayah text from own quran.json
    F->>G: prompt: answer ONLY from these sources, cite [s:a]
    G-->>F: answer
    F-->>C: { answer, model }
    C->>C: strip citations not in refs, withhold if none
    C-->>U: "AI reflection" box + verified sources listed separately
```

### 4.3 Hadith load with mirror fallback

```mermaid
sequenceDiagram
    participant P as Hadith page
    participant SW as Service worker
    participant J as jsDelivr
    participant GH as raw.githubusercontent
    P->>SW: GET editions/urd-nasai/sections/2
    SW->>J: (cache miss)
    J-->>SW: 403
    SW-->>P: 403
    P->>SW: GET same path on GitHub mirror
    SW->>GH: fetch
    GH-->>SW: 200 JSON (cached)
    SW-->>P: JSON
```

## 5. UI design

### 5.1 Principles

- **Calm and reverent:** soft surfaces, generous spacing, Arabic set large in Amiri Quran, and Urdu in Noto Nastaliq.
- **Mobile-first:** a bottom navigation (Home, Quran, Salah, Duas, More), with sheets for options. On desktop, a sidebar layout and a command palette (Ctrl+K).
- **Sources are always visible:** every ayah, hadith and dua shows its reference chip.
- **Inclusive:** the layout mirrors fully in RTL for Urdu and Arabic, and tap targets are at least 40 px.

### 5.2 Design tokens

These are defined in `src/index.css` as CSS variables and switched by `data-theme` and `data-accent`:

| Token | Use |
|---|---|
| `--bg`, `--surface`, `--surface-2` | Page and card backgrounds |
| `--ink`, `--muted`, `--line` | Text and borders |
| `--brand`, `--brand-ink`, `--gold` | Accent colours (Emerald, Lavender, Teal themes) |
| `--hero-a`, `--hero-b` | Gradient for the home hero |

Fonts: **Inter** (UI), **Amiri Quran** (Arabic), **Noto Nastaliq Urdu** (Urdu).

### 5.3 Screen inventory

There are 35 routes, defined in `src/App.tsx`.

| Area | Screens |
|---|---|
| Core | Today (`/`), Quran list, Reader, Search, Salah, Qibla, Duas, Azkar, Tasbih, Hadith (collection → book → hadith) |
| Study | Ask, Learn (course → lesson), Library, 99 Names, Calendar |
| Practice | Khatm, Ramadan, Zakat, Hajj, Habits, Journal, Insights, Kids, Saved |
| System | Account, Admin, Settings, More, About, 404 |

Screenshots of every route at 390 px and 1440 px are produced by `npm run test:e2e` in `tests/screens/`.

### 5.4 Key UI components (`src/components`)

| Component | Role |
|---|---|
| `ui.tsx` | Primitives: `PageHeader`, `Sheet` (portal), `Tabs`, `Ring`, `Empty` |
| `Layout` | Navigation shell, theme, RTL |
| `AudioBar` | Persistent recitation player |
| `WhatsAppButton` | Green share pill, used on every shareable item |
| `InstallBanner` | Install prompt plus share invitation |
| `ReportButton` | Content-error reporting (Supabase or GitHub) |
| `SalahTracker`, `QiblaMap`, `LocationPicker` | Feature widgets |
