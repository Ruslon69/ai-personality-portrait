# Owner Zodiac artwork v1

The owner’s numeric mapping is authoritative. `frontend/zodiak/` is immutable input,
not a public runtime directory. All 24 intended sign sources were decoded and visually inspected
before optimization. Approved Pig source 25 replaces the obsolete source 24. Each source is 1254 × 1254 (1:1). No corruption or byte-identical
originals were found.

## Provenance and production files

`source-manifest.json` records every original filename, numeric mapping, dimensions,
byte count and SHA-256, plus each production variant’s size and SHA-256. `retiredSources` preserves
the obsolete source 24’s provenance and hash without an active production entry.
`index.ts` is the typed runtime registry. Paths are resolved through that registry,
never assembled in product components.

Production files: `public/zodiac/{western|chinese}/{sign}-{480|800|1254}.webp`.
WebP quality 0.90, sRGB, high-quality resize. Original pixels are not cropped,
recolored or overlaid. The complete square preserves horns, scales, the archer’s
bow/arrow, fish and celestial symbols. All entries use `crop: 'none'`; their
center position is metadata, not a center-crop instruction.

Encoding used the existing isolated local Chrome Canvas WebP encoder, with no
installed project dependencies. The review package retains the encoding script.
Run `node scripts/validate-zodiac-artwork.mjs` to verify originals and derivatives
against the immutable manifest. Do not regenerate or update hashes silently.

## Mapping

| Source | Western     | Source | Chinese |
| ------ | ----------- | ------ | ------- |
| 1      | Aries       | 13     | Rat     |
| 2      | Taurus      | 14     | Ox      |
| 3      | Gemini      | 15     | Tiger   |
| 4      | Cancer      | 16     | Rabbit  |
| 5      | Leo         | 17     | Dragon  |
| 6      | Virgo       | 18     | Snake   |
| 7      | Libra       | 19     | Horse   |
| 8      | Scorpio     | 20     | Goat    |
| 9      | Sagittarius | 21     | Monkey  |
| 10     | Capricorn   | 22     | Rooster |
| 11     | Aquarius    | 23     | Dog     |
| 12     | Pisces      | 25     | Pig     |

## Integration

Western artwork appears inside Numerology’s existing optional zodiac disclosure
and the Portrait’s existing optional zodiac interpretation. Below-fold images use
native lazy loading, responsive `srcset`/`sizes`, intrinsic dimensions and localized
visual descriptions. Native disclosure behavior and symbolic disclaimers remain.
Numerology uses its existing `signId`; immutable Portrait snapshots retain only a
localized title, so the registry resolves its existing sign prefix without another
calculation or snapshot migration. Unknown historical titles retain the original
text-only presentation.

There is no Chinese Zodiac product surface or calculation in the application.
The typed `getZodiacArtwork('chinese', sign)` API is prepared for a future approved
Chinese result surface; it does not infer an animal from a Gregorian year.

**Pig is verified and resolves only to `zodiak/25.png`.** Its 480/800/1254 WebP
variants replace the former Pig derivatives. Dragon continues to resolve to the
approved `zodiak/17.png`; its derivatives are unchanged.

`zodiak/24.png` is an obsolete Dragon illustration from the former Pig slot.
It remains safely preserved as owner artwork, with its original SHA-256 recorded
in `retiredSources`. It has no active registry mapping or production derivative.
The collection has exactly 24 semantic production entries: 12 Western and 12 Chinese.
