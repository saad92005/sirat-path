# Security & privacy

- **No backend, no accounts, no secrets.** There's nothing to leak. The repository contains no keys, and none are needed.
- **Private by design:** journal, notes, salah log and habits live in IndexedDB on the user's device. They are never sent anywhere, and never to any AI.
- **Location** is used only for local prayer and Qibla maths and is stored in `localStorage`.
- **No analytics or third-party trackers.** The only network requests are for static assets, recitation audio (everyayah.com) and hadith files (cdn.jsdelivr.net).
- **XSS:** all content is rendered through React, with no `dangerouslySetInnerHTML`. Imported backups are validated before they're written.
- **Dependencies:** run `npm audit` periodically.

## Cloud AI (Groq)

- `GROQ_API_KEY` is stored only as an **encrypted Vercel environment variable**. It's never in the client bundle or the repo; CI can check this with `git grep gsk_`.
- The browser calls our own function `/api/ask`, which then calls Groq. The function:
  - only accepts the app's own origins (other sites get 403)
  - validates input (question 3–500 characters, up to 8 references in `s:a` format)
  - rate-limits each IP (best effort)
  - looks up verse text from the deployment's own verified `quran.json`, so clients can't inject fake sources
- Only the question and the verse references are sent. Journal, notes and other personal data are never sent.
- The answer is checked again in the browser: invented citations are removed and uncited answers are withheld.
- **If a key is ever exposed, regenerate it** at console.groq.com and run `vercel env rm GROQ_API_KEY` and then `vercel env add GROQ_API_KEY`.

## Optional cloud sync (Supabase)

- Only the public **anon** key goes in the client. The service-role key is never used.
- **Row Level Security on every table:** `user_records` is readable and writable only where `user_id = auth.uid()`. Users can rename their profile but can't change their own role (`my_role()` check). `content_reports` can be filed by signed-in users and reviewed only by admins (`is_admin()`).
- **Admin access** is enforced in the database. The `/admin` page only hides UI and isn't itself the security boundary.
- **Account deletion** uses a `security definer` function callable only by the authenticated user, for their own account.
- **Input limits** are enforced with SQL `check` constraints (report length, key length, allowed collection names).
- **The journal syncs only to the user's own RLS-protected rows** and is never sent to any AI. The on-device AI only receives the question and public Quran text.
