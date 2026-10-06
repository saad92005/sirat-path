# Security & privacy

- **No backend, no accounts, no secrets.** There's nothing to leak. The repository contains no keys, and none are needed.
- **Private by design:** journal, notes, salah log and habits live in IndexedDB on the user's device. They are never sent anywhere, and never to any AI.
- **Location** is used only for local prayer and Qibla maths and is stored in `localStorage`.
- **No analytics or third-party trackers.** The only network requests are for static assets, recitation audio (everyayah.com) and hadith files (cdn.jsdelivr.net).
- **XSS:** all content is rendered through React, with no `dangerouslySetInnerHTML`. Imported backups are validated before they're written.
- **Dependencies:** run `npm audit` periodically.

## Optional cloud sync (Supabase)

- Only the public **anon** key goes in the client. The service-role key is never used.
- **Row Level Security on every table:** `user_records` is readable and writable only where `user_id = auth.uid()`. Users can rename their profile but can't change their own role (`my_role()` check). `content_reports` can be filed by signed-in users and reviewed only by admins (`is_admin()`).
- **Admin access** is enforced in the database. The `/admin` page only hides UI and isn't itself the security boundary.
- **Account deletion** uses a `security definer` function callable only by the authenticated user, for their own account.
- **Input limits** are enforced with SQL `check` constraints (report length, key length, allowed collection names).
- **The journal syncs only to the user's own RLS-protected rows** and is never sent to any AI. The on-device AI only receives the question and public Quran text.
