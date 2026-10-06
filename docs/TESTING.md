# Testing

```bash
npm run build                 # type-check (tsc -b) + production build
npm run preview               # in one terminal
npm i -D playwright && npx playwright install chromium
node tests/e2e.mjs            # in another terminal
```

`tests/e2e.mjs`:

- visits **31 routes** at phone size (390 px) and desktop size (1440 px), in light and dark, with all three accent themes and Urdu right-to-left
- fails on any page error, console error, error-boundary screen or horizontal overflow
- exercises real interactions: marking a salah, counting an azkar, typing in the Zakat form (to catch focus loss), answering a quiz and checking that the default habits were seeded
- saves screenshots to `tests/screens/`

Last run: all routes passed with no errors.
