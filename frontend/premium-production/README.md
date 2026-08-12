# Premium Tarot production workflow

The production manifest is the source of truth. Prompt, source, candidate, preview,
review and release versions never change a Tarot `cardId` or meaning.

## 1. Check production state

```sh
npm run tarot:premium:status
npm run tarot:premium:validate
```

## 2. Generate externally

Open the matching file under `premium-production/prompts/`. Supply its **Final
generation prompt** and **Negative constraints** to the approved external image
workflow. Use the normalized classic image named in the production manifest only
as a semantic composition reference. Do not request a pixel copy.

Export a physically upright, sRGB, illustration-only source at a minimum of
1400×2400 pixels and a 7:12-compatible portrait ratio. Do not bake typography,
numerals, borders, frames, logos, or UI into the illustration.

## 3. Import safely

```sh
npm run tarot:premium:import -- major-fool /absolute/path/to/generated-fool.png
```

Import validates the card ID, regular file, supported format, dimensions, ratio,
and orientation metadata. It preserves the original under the ignored local
`source/` directory, creates metadata-stripped JPEG candidate and preview files,
records a checksum, writes a review template, and moves the card to `review`.
Import never approves or integrates artwork.

## 4. Review

```sh
npm run tarot:premium:contact-sheet
```

Open `premium-production/generated/contact-sheet.html` locally. It places the
classic semantic reference beside the premium candidate. Complete the generated
JSON review record under `premium-production/reviews/` using the locked rubric.
Scores are human guidance, not an automated claim of artistic quality.

Approve only after every required pass is true and each score is at least 4:

```sh
npm run tarot:premium:review -- major-fool approve --review premium-production/reviews/major-fool-v1.json
```

Reject with an explicit category and regeneration reason:

```sh
npm run tarot:premium:review -- major-fool reject --category missing-symbol --notes "White rose is absent" --regeneration-reason "Restore the canonical rose without changing the pose"
```

Rejected cards remain inactive. Importing a replacement advances their artwork
version while retaining the same card ID.

## 5. Release

`premium-preview` exists only through the local contact sheet. The application
continues using the verified classic edition throughout partial production.

```sh
npm run tarot:premium:release
```

This performs a dry threshold check. Only after 78/78 explicit approvals:

```sh
npm run tarot:premium:release -- --complete
```

The complete command verifies every checksum, stages all files atomically, writes
the provider release manifest, and marks all 78 entries integrated. It refuses a
partial or mixed production deck.
