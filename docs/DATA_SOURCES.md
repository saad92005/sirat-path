# Data sources & licensing

| Content | Source | Licence | How it is used |
|---|---|---|---|
| Quran Arabic text (Uthmani v1.1) | [Tanzil Project](https://tanzil.net) | CC BY 3.0, verbatim copies only | Bundled byte-for-byte in `data-src/`; `.gitattributes` prevents line-ending changes; attribution on every reader page and in Sources |
| Quran metadata (surahs, juz, sajdah) | Tanzil | CC BY 3.0 | Bundled |
| English translation | M. M. Pickthall (1930), via Tanzil | Public domain (author d. 1936) | Bundled |
| Recitation audio | [EveryAyah.com](https://everyayah.com) | Free public archive | Streamed; cached on the device only after the user plays or downloads it. Not bundled or redistributed |
| Hadith (Arabic, English, grades) | [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) via jsDelivr | Open dataset. English translations are the work of their original translators and publishers | Fetched on demand when the user opens a book and cached on the device. Not bundled or redistributed in this repo |
| Tajweed text, word-by-word, tafsir (Ibn Kathir, Maʿarif al-Quran, Bayan ul Quran, al-Muyassar), Urdu translations (Jalandhari, Junagarhi, Maududi, Israr Ahmad, Wahiduddin Khan) | [Quran.com API v4](https://api.quran.com) | Each work stays the property of its author or publisher | **Fetched on demand** and cached on the device; never bundled or redistributed. The local Tanzil text stays the default; tajweed colouring is an opt-in display mode, labelled with its source |
| Adhan audio | [Wikimedia Commons — Azan.ogg](https://commons.wikimedia.org/wiki/File:Azan.ogg) by Andrewler | CC BY-SA 4.0 | Streamed, with attribution in the Salah screen |
| Sunnah duas | Hadith references as numbered on sunnah.com | Arabic wording is classical text; English renderings are this project's own | `src/content/duas.ts` |
| Learning courses, Hajj & Umrah guide, Zakat notes | Written for this project | Project licence | `src/content/` |
| 99 Names | Widely circulated list (Tirmidhi narration) | Classical; glosses are this project's own | `src/lib/names.ts` |
| Fonts | Amiri Quran, Inter | SIL OFL 1.1 | Bundled |

## Adding a translation

1. Confirm it is public domain or explicitly licensed for redistribution.
2. Put the verbatim source file in `data-src/` along with its licence notice.
3. Extend `scripts/build-data.mjs` and add a `sources` entry (name, author, licence, language, URL).

Unlicensed or unclear content is never added.
| Feature icons (3D) | [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | MIT | Bundled (resized to 128px WebP) in public/icons/3d |
