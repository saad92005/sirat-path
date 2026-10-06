import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Noor — Quran & Prayer',
        short_name: 'Noor',
        description: 'A free, offline-first Quran reader with prayer times, Qibla and dhikr.',
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        runtimeCaching: [
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
