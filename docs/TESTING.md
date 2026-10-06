# Testing

```bash
npm test                      # unit: AI citation validation (tsx)
npm run build                 # type-check (tsc -b) + production build
npm run preview               # in one terminal
npx playwright install chromium
npm run test:e2e              # in another terminal
```

`tests/e2e.mjs`:

- visits **31 routes** at phone size (390 px) and desktop size (1440 px), in light and dark, with all three accent themes and Urdu right-to-left
- fails on any page error, console error, error-boundary screen or horizontal overflow
- exercises real interactions: marking a salah, counting an azkar, typing in the Zakat form (to catch focus loss), answering a quiz and checking that the default habits were seeded
- saves screenshots to `tests/screens/`

Last run: all routes passed with no errors.

Additional e2e checks:

- **Regression guards** for previously fixed bugs: Zakat inputs keep focus while typing, no duplicated "Quran · Quran" label, hero gradients visible under the pattern, no horizontal overflow on phones
- **Study tools** with live data: tajweed colouring, Urdu translation, word-by-word and tafsir
- **Ask** shows verified sources, and **Account** shows guest mode when Supabase isn't configured

## Not covered automatically

- **On-device AI generation:** needs WebGPU plus a 300 MB+ model download. The retrieval, citation-validation (unit-tested) and "unavailable on this device" paths are tested. Model loading was verified up to the parameter download, but the test machine's bandwidth was too low to finish it.
- **Supabase sync and auth:** needs a real project. Guest mode is tested. See SETUP.md for the five-minute manual check after creating a free project.
