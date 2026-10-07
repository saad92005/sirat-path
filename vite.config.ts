import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: { chunkSizeWarningLimit: 7000 },
  worker: { format: 'es' },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Sirat Path — Walk the straight path, step by step',
        short_name: 'Sirat Path',
        description: 'Walk the straight path, step by step. A free, offline-first Islamic companion: Quran, Salah, Duas, Hadith and more.',
        theme_color: '#0b2a24',
        background_color: '#0b2a24',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // The optional on-device AI runtime (~6 MB) is cached on first use instead of precached.
        globIgnores: ['**/ai-worker-*.js', '**/lib-*.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/assets\/(ai-worker|lib)-.*\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'ai-runtime', expiration: { maxEntries: 6 } },
          },
          {
            // Optional study layer (tajweed, word-by-word, tafsir, extra translations).
            urlPattern: /^https:\/\/api\.quran\.com\/api\/v4\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'quran-study', cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 1500 } },
          },
          {
            // Hadith sections — fetched on demand, kept for offline re-reading.
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/fawazahmed0\/hadith-api@1\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'hadith', cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 400 } },
          },
          {
            // Recitation audio streamed from EveryAyah; cached only once the user plays/downloads it.
            urlPattern: /^https:\/\/everyayah\.com\/data\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 3000 },
            },
          },
        ],
      },
    }),
  ],
})
