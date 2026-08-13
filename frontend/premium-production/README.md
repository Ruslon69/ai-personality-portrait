# Premium Tarot production workflow

The approved The Fool candidate v1 is the only Golden Master. Its authoritative
style is `premium-tarot-style-v2`; the production release remains `classic` until
all 78 cards are approved and integrated atomically.

The immutable approved artwork and its real human review are tracked under
`golden-master/approved/`. Draft candidates, draft reviews, generated studios,
prepared images, and source imports remain ignored. This separation makes the
approved state reproducible from a clean checkout without activating the artwork
in the runtime deck.

## Pilot production sequence

```text
approved Golden Master
→ pilot generation handoff
→ external image generation
→ artwork preparation
→ import
→ comparison review
→ human approve or reject
→ pilot consistency review
→ full-deck production
```

The seven copy-ready external prompts are in `pilot-generation/`. Their technical
lineage and review checklists live separately under `prompts/`. Use
`GOLDEN_MASTER_VISUAL_LANGUAGE.md` and `pilot-art-direction.json` when reviewing
craftsmanship and cross-card coherence; do not paste either file into the image
generator.

## Generate externally

Choose one handoff, for example:

```text
premium-production/pilot-generation/major-magician.txt
```

Copy its `FINAL PROMPT`, `NEGATIVE PROMPT`, and `OUTPUT REQUIREMENTS` into the
human-controlled image generator. No generation API, credentials, or network
automation exists in this project.

Preferred source output remains portrait 7:12, at least 1400×2400, sRGB,
physically upright, illustration-only, with no title, numeral, card frame,
watermark, logo, or UI.

## Prepare and import

For any of the seven pilots, run the existing general process command:

```sh
cd frontend
npm run tarot:premium:process -- major-magician /absolute/path/to/generated-magician.png
```

This prepares the source when needed, validates it, imports a versioned candidate,
and regenerates the development contact sheet. It never approves artwork. The
original stays unchanged, while prepared assets and lineage reports remain in the
Git-ignored `premium-production/prepared/<card-id>/` directory.

For preparation without import:

```sh
npm run tarot:premium:prepare -- /absolute/path/to/image.png --card-id major-magician
```

Undersized sources use one deterministic FFmpeg Lanczos resample to 1680×2880;
this is not AI super-resolution. Native sources at least 1400×2400 keep their
dimensions unless a centered crop of at most 4% is required for 7:12. Larger
ratio differences are rejected for human reframing.

## Review and decide

```sh
npm run tarot:premium:contact-sheet
```

Open `premium-production/generated/contact-sheet.html` and compare the candidate
with its classic symbolic reference. Complete the versioned JSON review under
`premium-production/reviews/`. All symbols and required passes must pass, every
score must be at least 4/5, and a named human reviewer must decide.

```sh
npm run tarot:premium:review -- major-magician approve --review premium-production/reviews/major-magician-v1.json
```

Or reject with explicit provenance:

```sh
npm run tarot:premium:review -- major-magician reject --category style-drift --notes "Specific review finding" --regeneration-reason "Specific correction"
```

After all seven candidates are reviewed, compare the pilot set together. Match
the Golden Master's craftsmanship, anatomy, materials, depth, symbolic clarity,
and painterly finish—not its sky, palette, sunlight, costume, camera, or density.

## Status and validation

```sh
npm run tarot:premium:status
npm run tarot:premium:validate
```

Expected Sprint 8.5 state is one approved Fool, seven `prompt-ready-v2` pilots,
70 pending cards, and `classic` release mode. Prompt-ready status never implies
generated, reviewed, approved, or integrated artwork.

The complete premium edition can release only after 78/78 approved assets pass
the existing release threshold:

```sh
npm run tarot:premium:release -- --complete
```
