# Premium Tarot production workflow

The production manifest is the source of truth. Prompt, source, candidate, preview,
review and release versions never change a Tarot `cardId` or meaning.

## Golden Master: The Fool

The Fool is the only Golden Master and must be approved before visual production
expands to the other 77 cards. Copy only
`golden-master/the-fool-generation.txt` into the external generator.

The standard workflow is one command. Generated PNG/JPEG artwork may be smaller
than the Golden Master gate; no manual resizing is needed:

```sh
cd frontend
npm run tarot:premium:golden-process -- /absolute/path/to/the-fool.png
```

The command inspects the original, conservatively crops to 7:12, applies one
FFmpeg Lanczos high-quality resample only when the source is below 1400×2400,
normalizes orientation and sRGB, removes private/unnecessary metadata, validates
the result, imports it, generates the Comparison Studio, and prints its exact
local HTML path. It never alters the original and never approves the candidate.

Preparation uses the canonical 1680×2880 target for undersized sources. This is
deterministic resampling, not AI super-resolution and not a claim of new native
detail. Sources already at least 1400×2400 retain their pixel dimensions unless
a conservative aspect crop is required. A centered crop may remove at most 4%
from one axis; larger ratio differences are rejected for human reframing.

To prepare without importing:

```sh
npm run tarot:premium:prepare -- /absolute/path/to/the-fool.png
```

Prepared PNGs and lineage reports live under the Git-ignored
`premium-production/prepared/<card-id>/`. Reports record source/prepared
checksums, dimensions, crop, orientation, resampling, optional restrained
sharpening, color conversion, metadata removal, resolution eligibility, and
`premium-tarot-preparation-v1`. Repeating the same source and version reuses the
same verified output. Use `--sharpen` only when a reviewer explicitly requests
the documented one-pass restrained treatment.

The lower-level commands remain available for a natively compliant source:

```sh
npm run tarot:premium:golden-import -- /absolute/path/to/the-fool.png
npm run tarot:premium:golden-review
```

Open `premium-production/generated/the-fool-golden-review.html`. The studio offers
Classic, Candidate, Side-by-side, Overlay, Split, and Difference modes; synchronized
25–400% zoom and drag-to-pan; opacity and split controls; automatic candidate
metadata; version history; section scoring and notes; symbolism dispositions;
reviewer-only visual flags; and the approval preparation panel.
Its metadata also distinguishes generated source resolution from prepared
resolution, lists the exact preparation method and scale, and warns reviewers
when an undersized source was resampled. Resampling eligibility is technical;
human review decides whether the visible detail is Golden Master quality.

Studio edits are stored only in the browser for the active candidate checksum.
Use **Download review JSON**, then save the downloaded file over the displayed
versioned path in `premium-production/reviews/`. The studio never changes artwork
or production state. Every section must score at least 4, contain reviewer notes,
and pass; every required symbol and mandatory approval condition must pass.

Preview the review candidate inside every existing `TarotCardView` context by
running the development server and adding `?tarotGoldenMaster=major-fool` to a
Tarot, result, or Journey URL. This query is development-only, presentation-only,
and never persists.

Approve with explicit human provenance:

```sh
npm run tarot:premium:golden-approve -- --reviewer "Reviewer name" --notes "Approval rationale"
```

Or reject while retaining the versioned candidate and review provenance:

```sh
npm run tarot:premium:golden-reject -- --category style-drift --reason "Regeneration direction"
```

Approval creates `golden-master/reference.json` but does not activate the premium
edition. A rejected candidate is removed only from live development preview; its
versioned source, candidate, preview, review, checksum, and manifest history remain.

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

Prefer a physically upright, native sRGB, illustration-only source at a minimum
of 1400×2400 pixels and a 7:12-compatible portrait ratio. Smaller generator
outputs can enter review through `golden-process`, with their original resolution
preserved in provenance. Do not bake typography, numerals, borders, frames,
logos, or UI into the illustration.

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
