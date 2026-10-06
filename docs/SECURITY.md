# Security & privacy

- **No backend, no accounts, no secrets.** There's nothing to leak. The repository contains no keys, and none are needed.
- **Private by design:** journal, notes, salah log and habits live in IndexedDB on the user's device. They are never sent anywhere, and never to any AI.
- **Location** is used only for local prayer and Qibla maths and is stored in `localStorage`.
- **No analytics or third-party trackers.** The only network requests are for static assets, recitation audio (everyayah.com) and hadith files (cdn.jsdelivr.net).
- **XSS:** all content is rendered through React, with no `dangerouslySetInnerHTML`. Imported backups are validated before they're written.
- **Dependencies:** run `npm audit` periodically.

## If cloud sync is added later

Use the Supabase free tier with Row Level Security on every table (`user_id = auth.uid()`). Only expose the anon key in the client, never the service-role key. Sync should stay optional, so guest mode keeps working.
