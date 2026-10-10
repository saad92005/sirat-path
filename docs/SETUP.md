# Setup & deployment

Requirements: Node.js 20+ and Git. Works on Windows, macOS and Linux.

```bash
npm install
npm run dev        # development server
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ with the service worker (test offline/PWA here)
npm run data       # regenerate public/data/quran.json from data-src/
```

## Environment variables

None are required for local development. Copy `.env.example` to `.env.local` only if you want cloud sync. `GROQ_API_KEY` (Ask, cloud mode) is a **server-only** variable: set it in Vercel and never prefix it with `VITE_`. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Optional: accounts & cloud sync (Supabase free tier, no credit card)

1. Create a free project at supabase.com.
2. In **SQL Editor**, run `supabase/schema.sql`. It creates profiles, `user_records` and `content_reports`, all with Row Level Security.
3. In **Project Settings → API**, copy the Project URL and the `anon` public key into `.env` (and into the Vercel project's environment variables):
   `VITE_SUPABASE_URL=…` and `VITE_SUPABASE_ANON_KEY=…`. Never use the service-role key in the app.
4. In **Authentication → URL configuration**, set the Site URL to your deployment (e.g. `https://siratpath.vercel.app`) and add `/account` as a redirect URL.
5. Optional: enable the Google provider in **Authentication → Providers**. This needs a free Google Cloud OAuth client.
6. To make yourself an admin, run the `update public.profiles …` line at the bottom of the schema.

Email confirmation uses Supabase's built-in mailer, which is free but rate-limited. Without custom SMTP, expect a few emails per hour.

## Deploy free on Vercel

1. Push the repo to GitHub.
2. On vercel.com, choose **Add New → Project** and import the repo. Vite is detected automatically.
3. Deploy. `vercel.json` already contains the SPA rewrite.
4. Open `https://<project>.vercel.app` on your phone and use **Add to Home Screen** (iOS Safari) or **Install app** (Android Chrome).

The Hobby plan needs no credit card. A custom domain is optional.

## Deploy free on Cloudflare Pages

Build command `npm run build`, output directory `dist`. Add a `_redirects` file containing `/* /index.html 200` in `public/`.
