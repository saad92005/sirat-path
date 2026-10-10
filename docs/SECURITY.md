# Security Policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Use GitHub's private reporting instead:

**https://github.com/saad92005/sirat-path/security/advisories/new**

Please include the affected URL or file, the steps to reproduce, and what an attacker could gain. You'll get an acknowledgement within 7 days. Confirmed issues are fixed before anything is disclosed publicly. Testing must only use your own account. Don't access other users' data or degrade the service.

**In scope:**
- siratpath.vercel.app
- the `/api/ask` function
- the Supabase RLS policies in `supabase/schema.sql`
- the client code in this repo

**Out of scope:**
- third-party services (Supabase, Vercel, Groq, quran.com)
- rate-limit tuning
- reports from automated scanners with no demonstrated impact

## Supported versions

Only the live deployment (the latest `main`) is supported. Installed PWAs update themselves automatically.

---

## Security model

### Architecture

The app is a static SPA. It has one serverless function (`api/ask.ts`) and an **optional** Supabase backend. Guest mode sends no personal data anywhere.

### Secrets

| Secret | Where it lives | Notes |
|---|---|---|
| `GROQ_API_KEY` | Vercel encrypted environment variable (server only) | Never in the bundle or the repo. Check with `git grep gsk_` |
| Supabase service_role key | **Not used anywhere** | |
| Supabase URL + anon/publishable key | `VITE_SUPABASE_*` environment variables, shipped to the client | Public by design. All protection comes from RLS |
| Database password | Supabase dashboard only | Never in the repo or the app |

`.env*` files are git-ignored; only `.env.example` (no values) is committed.

If a key is ever exposed, rotate it:

```bash
# Groq: regenerate at console.groq.com, then
vercel env rm GROQ_API_KEY production && vercel env add GROQ_API_KEY production && vercel --prod
```

### Database (Supabase)

- **Row Level Security is enabled on every table.**
- `user_records`: select, insert, update and delete are allowed only where `user_id = auth.uid()`.
- `profiles`: users can read and rename only their own profile. They can't change `role`, which is enforced by `my_role()` in the update `with check`.
- `content_reports`: any signed-in user can file a report. Reporters see their own reports, and admins (`is_admin()`) see and update all of them.
- **Admin access is enforced in the database**, not just in the UI. Hiding the `/admin` page isn't what protects it.
- `delete_my_account()` is `security definer`, executable only by `authenticated`, and deletes only `auth.uid()`.
- `check` constraints limit input sizes and the allowed `collection` names.

### `/api/ask` (Groq proxy)

- Only the app's own origins are accepted; other sites get a 403.
- Input is validated: the question must be 3–500 characters, with at most 8 references in `s:a` format.
- Requests are rate-limited per IP (best effort, per instance).
- The server looks up verse text itself from the deployment's own `quran.json`, so a client can't inject fake "sources".
- Only the question and the references are sent to Groq.

### Client

- Everything renders through React. There is **no `dangerouslySetInnerHTML`**. Remote tafsir HTML is converted to plain text, and tajweed markup is parsed into safe segments.
- Imported backups are validated before being written.
- External links opened in a new tab use `rel="noreferrer"`, which also implies noopener.
- The service worker caches only allow-listed origins (see `runtimeCaching` in `vite.config.ts`).

### Privacy-relevant facts

- Vercel Web Analytics collects page views without cookies. It doesn't track users across sites.
- The journal syncs only to the owner's RLS-protected rows. It's encrypted at rest by Supabase but isn't end-to-end encrypted, which is stated in the [Privacy Policy](PRIVACY_POLICY.md). It is never sent to any AI.

### Routine checks

- `npm audit` before releases.
- Run `git grep -nE "gsk_|service_role|sb_secret_"`. It should return nothing.
- After any schema change, test as two different users and confirm that neither can read the other's rows.
