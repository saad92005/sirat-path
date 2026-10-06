# PWA & offline

- **Manifest:** name, icons (192/512, maskable), standalone display, theme colour.
- **Precache:** app shell, fonts and `quran.json` (about 3 MB in total). After the first load the Quran, duas, azkar, learning, prayer and Qibla maths, calendar and every tracker work fully offline.
- **Runtime caches:** `quran-audio` (CacheFirst, range requests) and `hadith` (StaleWhileRevalidate).
- **Offline indicator:** a banner appears when the device goes offline.
- **Install:** Chrome, Edge and Android show an in-app **Install** button (`beforeinstallprompt`). On iOS, use Safari → Share → Add to Home Screen. Safe-area insets are respected.

## Honest limitations

- **Reminders** use the Notification API and fire while the app is open or running in the background. Without a push server, browsers (especially iOS) don't guarantee delivery after the app is closed.
- **The compass** needs a magnetometer; desktops show the numeric bearing instead.
- **Background audio** depends on the OS. Lock-screen metadata is provided through the Media Session API.
