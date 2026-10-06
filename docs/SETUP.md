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

None are required. The core app has no keys or secrets.

## Deploy free on Vercel

1. Push the repo to GitHub.
2. On vercel.com, choose **Add New → Project** and import the repo. Vite is detected automatically.
3. Deploy. `vercel.json` already contains the SPA rewrite.
4. Open `https://<project>.vercel.app` on your phone and use **Add to Home Screen** (iOS Safari) or **Install app** (Android Chrome).

The Hobby plan needs no credit card. A custom domain is optional.

## Deploy free on Cloudflare Pages

Build command `npm run build`, output directory `dist`. Add a `_redirects` file containing `/* /index.html 200` in `public/`.
