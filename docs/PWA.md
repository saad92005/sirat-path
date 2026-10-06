# PWA & offline

- **Manifest:** name, icons (192/512, maskable), standalone display, theme colour.
- **Precache:** app shell, fonts and `quran.json` (about 3 MB in total). After the first load the Quran, duas, azkar, learning, prayer and Qibla maths, calendar and every tracker work fully offline.
- **Runtime caches:** `quran-audio` (CacheFirst, range requests) and `hadith` (StaleWhileRevalidate).
- **Offline indicator:** a banner appears when the device goes offline.
- **Install:** Chrome, Edge and Android show an in-app **Install** button (`beforeinstallprompt`). On iOS, use Safari → Share → Add to Home Screen. Safe-area insets are respected.

## Honest limitations

- **Reminders** use the Notification API and fire while the app is open or running in the background. Without a push server, browsers (especially iOS) don't guarantee delivery after the app is closed.
  **Free workaround (built in):** Salah → *Add to calendar* exports the next 30 days of prayer times as an `.ics` file. The phone's calendar app then raises the alarms even when Sirat Path is closed. True Web Push would need an always-on scheduler, and free hosting tiers don't offer per-minute cron, so it's intentionally not used.
- **Adhan sound** plays when a reminder fires while the app is open. Browsers may block autoplay until you've interacted with the page.
- **The compass** needs a magnetometer; desktops show the numeric bearing instead.
- **Background audio** depends on the OS. Lock-screen metadata is provided through the Media Session API.
