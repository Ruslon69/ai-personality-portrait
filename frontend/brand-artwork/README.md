# Soul Arkana identity — Sprint 14.4

## Immutable source

Owner-approved original: `../home-artwork/soul-arkana-logo-master.png`.
1131 × 1391, transparent PNG, 1,161,517 bytes.
SHA-256: `3348881ae02ab8f2f5c0eabd797a71cdacfe8a22f6f4ee18c8598707508afb4a`.

The master is not changed, recolored, replaced, or copied into `public`/`dist`.
It contains the detailed Tarot-card frame, crescent, central star, celestial
geometry, upper luminous ribbon, lettering, and tagline. No human imagery is added.

## One responsive system

`BrandIdentity` in `src/shared/ui/brand` provides three explicit variants:

| Variant          | Use                                                          | Detail                                                                 |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `full`           | Larger brand/marketing contexts, not added to existing pages | Original emblem derivative with real SOUL ARKANA text; no tiny tagline |
| `header`         | All existing shared headers                                  | Compact card/crescent/star plus real wordmark                          |
| `compact`        | Narrow/compact contexts                                      | Essential emblem only, with text fallback on asset failure             |
| Favicon/app mark | Browser chrome / saved shortcut                              | Same compact geometry on navy, no lettering, filigree, or glow         |

The header automatically suppresses the wordmark where application navigation or
Tarot Reading tools need the space. It does not truncate the brand or remove any
navigation controls. The linked identity has exactly one accessible name,
“Soul Arkana”; its decorative children are hidden from assistive technology.

The live wordmark uses the existing Prata display font, normal weight, restrained
tracking, and uppercase lettering, following the master's classical serif identity.
It is a responsive typographic companion, **not an exact tracing** of the raster
lettering. No new font or tagline is introduced. A darker gold text token on light
surfaces preserves readability without recoloring the master.

## Production derivatives

| File in `public/brand` | Dimensions      |   Bytes | Purpose                                          |
| ---------------------- | --------------- | ------: | ------------------------------------------------ |
| `compact-mark.svg`     | viewBox 64 × 64 |     597 | Header/compact identity, cacheable across routes |
| `emblem-384.webp`      | 384 × 501       | 121,712 | Larger original-artwork emblem                   |
| `emblem-768.webp`      | 768 × 1001      | 360,418 | High-density larger emblem                       |
| `favicon-16.png`       | 16 × 16         |     491 | Native tiny favicon                              |
| `favicon-32.png`       | 32 × 32         |   1,041 | Native favicon                                   |
| `favicon-48.png`       | 48 × 48         |   1,667 | Native favicon                                   |
| `app-mark-180.png`     | 180 × 180       |   6,950 | Apple touch / app mark                           |

`public/favicon.svg` (654 bytes) uses the same compact shapes plus a navy foundation.
The document uses `?v=moon-star-1` to avoid reusing a cached candle favicon; the
existing hosting/cache policy is unchanged.
The canonical authored compact geometry is `compact-mark.svg` beside this document.
This is an explicitly simplified vector reconstruction of the essential approved
geometry, **not a claim that the original raster has been vectorized**.

The emblem derivatives use the source rectangle **x=180, y=0, width=770,
height=1004**. This retains the upper emblem and excludes the separate lettering
and tagline. The operation is performed on derivatives only. Transparent WebP is
encoded at quality 0.94 with high-quality downsampling; source colors are retained.
PNG favicons are rasterized from the favicon SVG with an explicit 64 × 64 SVG
viewport before resizing, avoiding accidental partial-viewport crops.

Asset preparation used a temporary local Chrome/canvas encoder, as in Home artwork
preparation. There is no canvas, image processor, new dependency, or remote request
in the product runtime. Preparation scripts and QA captures remain outside the repo.

The header loads only the 597-byte SVG. Large WebPs are lazy-loaded exclusively by
the `full` variant and are not requested by current customer routes. Full-variant
layout and font-scaled dimensions remain constrained by their container.

## Audit and boundaries

- Home, Tarot entry/setup/reading/result, Numerology, Portrait, Profile, History,
  Settings, legal/recovery screens: the same `Header` mounts the shared identity.
- The previous card/candle SVG and flame/orbit animation lived only in `Header`
  and the old favicon. These are replaced; no per-route logo markup is introduced.
- Footer copyright and metadata use existing canonical text, not a second emblem.
  They are preserved. There was no web-app manifest; no PWA behavior is added.
- Home/Tarot artwork and their candle/celestial scene details are illustrations,
  not alternate navigation logos. They remain frozen.
- No constant motion: hover/focus illumination only; reduced motion removes
  transitions. Full source-artwork detail is never squeezed into a 40px header.

Regression checks cover master checksum, shared geometry, favicon dimensions and
checksums, single accessible naming, asset-failure fallback hooks, and the header
payload boundary. Owner visual acceptance of the accumulated Sprint 14 remains
separate from automated validation.
