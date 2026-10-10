# Deployment and Operations Guide

This guide covers how Sirat Path runs in production and how to operate it. For local development, see [SETUP.md](SETUP.md).

## 1. Production topology

| Component | Provider (free tier) | Configured where |
|---|---|---|
| Static site + service worker | Vercel (Hobby) | `vercel.json`, `vite.config.ts` |
| `/api/ask` serverless function | Vercel Functions | `api/ask.ts` |
| Auth + database | Supabase (project `csosessgjfpgmjqriurc`) | `supabase/schema.sql`, Supabase dashboard |
| AI model | Groq (`openai/gpt-oss-120b`, falling back to `gpt-oss-20b`) | `GROQ_API_KEY` in Vercel |
| Analytics | Vercel Web Analytics | Vercel dashboard → Analytics |
| Google sign-in | Google Cloud OAuth client → Supabase provider | Google Cloud Console + Supabase Auth |
| Source control | GitHub `saad92005/sirat-path` | `main` branch |

**Live URL:** https://siratpath.vercel.app

## 2. Release process

Every push to `main` deploys to production automatically.

```bash
npm run build                                       # must pass (type-check + build)
npm run preview                                     # sanity-check the PWA on :4173
U=http://localhost:4173 node tests/responsive.mjs   # no overflow or console errors
git push                                            # Vercel builds and deploys (~1 minute)
U=https://siratpath.vercel.app node tests/responsive.mjs   # verify production
```

Installed PWAs update themselves. The service worker checks hourly and on focus, then reloads when the new worker takes control. `vercel.json` serves `sw.js` with `no-cache` and hashed assets as `immutable`.

**Branch previews:** every other branch or pull request gets a preview URL like `siratpath-<hash>.vercel.app`. `/api/ask` accepts these origins.

## 3. Environment variables

These are set in Vercel → Project → Settings → Environment Variables. They are never committed.

| Name | Scope | Exposed to the browser? | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Production, Preview | Yes (public) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview | Yes (public; RLS protects the data) | Supabase anon/publishable key |
| `GROQ_API_KEY` | Production, Preview | **No (server only)** | Used only by `api/ask.ts` |

`VITE_*` variables are baked in at build time, so **redeploy after changing them**.

## 4. Supabase setup (one-off, or for a new project)

1. Run `supabase/schema.sql` in the SQL editor. It is idempotent apart from policies; on a re-run, drop the policies first.
2. Go to **Auth → URL configuration**:
   - Site URL: `https://siratpath.vercel.app`
   - Redirect URLs: `https://siratpath.vercel.app/account`, `http://localhost:5173/account`
3. Go to **Auth → Providers → Google**: paste the Google OAuth client ID and secret.
   - In Google Cloud, the authorised redirect URI is `https://<project>.supabase.co/auth/v1/callback`.
4. To make an admin, run this in the SQL editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'admin@example.com');
   ```
5. **Free-tier note:** Supabase pauses free projects after about 7 days without activity. Open the dashboard and click *Restore* if the app reports that sync is unavailable.

## 5. SEO and sharing

| Item | Location |
|---|---|
| Meta, Open Graph, Twitter and JSON-LD | `index.html`, plus per-route tags from `src/lib/seo.ts` |
| Preview image (1200×630) | `public/og-image.png` |
| `sitemap.xml`, `robots.txt` | `public/` (excluded from the SPA fallback in `vite.config.ts`) |
| Google Search Console | Add the `google-site-verification` meta tag to `index.html`, deploy, click Verify, then submit `/sitemap.xml` |

## 6. Monitoring

- **Traffic:** Vercel → Analytics (visitors, top pages, referrers, countries).
- **Function errors:** Vercel → Logs, filtered on `/api/ask`.
- **Users:** Supabase → Authentication → Users.
- **Content reports:** `/admin` in the app (admin account).
- **Uptime of data sources:** if a hadith collection fails to load, check `tests/urdu-hadith.mjs` against production.

## 7. Rollback

In Vercel → Deployments, open the last good deployment and choose **Promote to Production**. This is instant and needs no rebuild. Then fix forward on `main`.

## 8. Incident checklist

| Symptom | Likely cause | Action |
|---|---|---|
| A hadith collection won't load | jsDelivr refusing files (403) | The mirror fallback should handle it. If GitHub also fails, the data is still served from the user's cache |
| Ask returns "unavailable" | Groq quota or key problem | Check Vercel logs, then rotate the key if needed (see [SECURITY.md](SECURITY.md)) |
| Sync fails for everyone | Supabase project paused | Restore it from the dashboard |
| Google login error | Redirect URL mismatch | Check Supabase redirect URLs and the Google OAuth redirect URI |
| Users see an old version | Service-worker caching | Confirm `sw.js` is `no-cache`. Users can reload twice |

## 9. Cost

The app runs entirely on free tiers: $0 per month. See [FREE_STACK.md](FREE_STACK.md). Limits to watch:

- Vercel: 100 GB bandwidth per month on Hobby.
- Supabase: 500 MB database and 50k monthly active users.
- Groq: per-minute and per-day token limits.
