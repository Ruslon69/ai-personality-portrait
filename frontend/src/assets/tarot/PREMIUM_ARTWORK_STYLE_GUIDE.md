# Premium AI Tarot Deck — artwork specification

## Product intent

The premium deck is a digitally hand-painted interpretation of the public-domain
Rider–Waite–Smith deck. It should feel cinematic, tactile, mystical, and mature,
while remaining readable as Tarot rather than fantasy-game loot.

The art direction may improve execution, never identity. A viewer familiar with
RWS must identify every card immediately without reading its name.

## Non-negotiable preservation contract

For every card, preserve:

- the complete RWS composition and spatial hierarchy;
- character count, identity, pose, gesture, gaze, costume silhouette, and props;
- every divinatory symbol, suit object, celestial body, animal, plant, building,
  landscape feature, path, crown, tool, and architectural element;
- the original color identity and the relative color relationships;
- title and Roman-numeral safe areas;
- canonical upright orientation. The Hanged Man remains canonically upright;
- historical recognizability at thumbnail size.

Do not add symbols that could change meaning. Do not remove, obscure, mirror, or
relocate existing symbols. Do not reinterpret characters as anime, cartoon,
photoreal celebrity, horror creature, or unrelated fantasy archetype.

## Visual language

- **Medium:** premium digital oil/gouache painting with visible, controlled brush
  texture; never plastic 3D rendering or smooth AI airbrush.
- **Lighting:** soft volumetric key light, grounded bounce light, readable rim
  light, and cinematic but plausible shadows. Light must support the existing
  symbolism rather than invent a new focal point.
- **Depth:** clear foreground, midground, and background separation using value,
  edge control, atmosphere, and occlusion. Do not blur symbolic details.
- **Materials:** distinguish aged paper, woven cloth, weathered wood, stone,
  polished metal, water, foliage, skin, and sky through restrained texture.
- **Highlights:** antique gold and warm magical highlights may accent existing
  suns, halos, crowns, pentacles, cups, wands, swords, and celestial motifs.
- **Glow:** subtle and localized to an existing symbolic light source. No neon,
  bloom wash, or arbitrary aura.
- **Contrast:** stronger than the archival scans, with protected shadow detail
  and no crushed titles, numerals, faces, or suit symbols.
- **Color:** harmonize and grade the original palette; do not radically recolor.
  Use warm highlights and cool shadows sparingly for depth.
- **Mood:** elegant, solemn, mysterious, luxurious, and timeless. Avoid gore,
  grimdark desaturation, kitsch ornament, and game-rarity spectacle.

## Family calibration

- **Major Arcana:** neutral parchment, deep ink, muted antique gold; strongest
  symbolic light and the most ceremonial atmosphere.
- **Wands:** warm earth, ember, ochre, muted firelight; retain all yellow and
  desert cues from the source.
- **Cups:** cool blue, mineral teal, pearl and silver highlights; water remains
  natural and readable.
- **Swords:** cool neutral, steel, storm light, restrained blue-grey; blades stay
  materially distinct without becoming luminous weapons.
- **Pentacles:** olive, umber, moss, parchment, restrained gold; coins retain
  their exact count and placement.

## Master asset specification

- Canonical aspect ratio: `7 / 12`, portrait.
- Canonical pixel content: upright with metadata orientation removed.
- Recommended premium master: 1400 × 2400 px or larger, lossless working file.
- Runtime derivative: one visually lossless, web-appropriate asset per layer;
  avoid device-specific duplicate sets unless measured performance requires it.
- Color space: sRGB.
- Safe area: preserve the entire original frame, numeral, title, and all edge
  symbols. Do not use arbitrary CSS cropping to repair a source.
- Alpha: allowed only for foreground, atmosphere, and light planes. Background
  and midground must fully cover the artwork well.

## Layer delivery contract

Layered editions may provide these planes:

1. `background` — sky, distant architecture, landscape;
2. `midground` — primary canonical illustration and mandatory `required` plane;
3. `foreground` — existing near-field objects or figures with transparent alpha;
4. `atmosphere` — optional fog or dust that does not obscure symbols;
5. `light` — optional existing-source illumination, normally `screen` blend.

Depth values are normalized semantic offsets, not pixels. Recommended range is
`-1` to `1`; the UI clamps the visible response to restrained micro-parallax.
Every layered edition must mark a complete static composite or midground as
`required`. If that layer fails, the renderer uses the symbolic fallback rather
than displaying a semantically incomplete scene.

Optional fog, particles, glow, and light rays are provider capabilities. They are
off by default, disabled for compact cards, and must respect reduced motion.

## Generation and paint-over workflow

1. Start from the normalized canonical RWS image and its card identity record.
2. Create a card-specific inventory of characters, poses, objects, counts,
   symbols, colors, text, numeral, and spatial relationships.
3. Use image-to-image or controlled paint-over, never unconstrained text-only
   generation for a production card.
4. Lock composition and silhouette before improving texture or lighting.
5. Compare the output against the inventory at full size and thumbnail size.
6. Correct hands, faces, object counts, suit symbols, text, and geometry manually.
7. Export the upright composite and any optional alpha layers.
8. Record provider, edition, version, quality, rights, provenance, dimensions,
   checksum, and review status in the artwork manifest.
9. Run the 78-card mapping/orientation/provider validation before release.

Suggested prompt framing: “Faithful premium digital oil-and-gouache repaint of
the supplied public-domain Rider–Waite–Smith card. Preserve the exact composition,
characters, poses, object counts, symbolism, spatial relationships, title and
numeral. Improve only material texture, volumetric lighting, depth, shadow detail,
color harmony and restrained antique-gold highlights. Mature elegant dark-fantasy
art direction; not anime, cartoon, photobash, game UI, or a redesigned scene.”

## Review acceptance

Each premium card requires:

- side-by-side approval against the normalized canonical reference;
- exact symbol and suit-object count verification;
- upright/reversed runtime verification with no embedded rotation;
- title/numeral/frame visibility at desktop and 375 px mobile size;
- no hallucinated text, anatomy, faces, duplicated objects, or missing objects;
- no trademarked frame, commercial-deck motif, or third-party game asset;
- documented rights and source provenance;
- readable values in both light and dark application themes;
- a fallback test proving the reading remains usable if a layer fails.

The premium treatment fails review if it is more impressive but less recognizably
Rider–Waite–Smith.
