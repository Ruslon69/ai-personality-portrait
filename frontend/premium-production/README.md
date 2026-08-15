# Premium Tarot production workflow

The approved The Fool candidate v1 is the only Golden Master. The 15-card
reference set, coverage matrix, style consistency contract, and immutable
approved reference artifacts live under `reference-set/`. The production release
remains `classic` until all 78 cards are approved and integrated atomically.

## Permanent identity rule

`canonical-identity.json` is the locked Tarot identity contract for all 78 cards.
Production identity and Tarot identity are independent:

- **Production number** controls external file naming and workflow order.
- **Canonical Tarot identity** controls title, Major Arcana numeral, Minor Arcana
  rank, suit, and symbolism.

Never derive a Tarot numeral or rank from a production number. In particular,
`17.png ≠ XVII`: `17.png` is The Emperor, whose canonical Rider–Waite–Smith
numeral is `IV`. Strength is `VIII`; Justice is `XI`. Court cards use Page,
Knight, Queen, or King and never receive production-derived Roman numerals.

Immutable Fool provenance stays under `golden-master/approved/`; other approved
references and retained reviewable attempts are tracked under
`reference-set/approved/` and `reference-set/attempts/`. Draft candidates, source
imports, previews, and generated studios remain ignored. Tracking production
evidence does not activate it in the runtime deck.

## Reference expansion and readiness

```sh
npm run tarot:premium:reference
npm run tarot:premium:queue
```

The report prints `Reference set readiness: X / 15 approved` and emits
`REFERENCE STYLE SET COMPLETE` only at 15/15. The queue deterministically lists
all 78 canonical cards, their current version and lifecycle, reference role,
locked numeric source, and next required action. Reference completion permits
mass production; it never changes the runtime release mode.

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

## Numeric production loop

External files permanently use `1.png` through `78.png`. The tracked locked
sequence manifest at `source-number-map.json` is the immutable source of truth
for number → card ID → filename. Numbers must never be reassigned, reused, or
inferred from canonical deck order. The tooling reads external files without
renaming them:

```sh
npm run tarot:premium:source-map -- list
npm run tarot:premium:next
npm run tarot:premium:number-process -- 16 /Users/ruslon69/Desktop/cards-ai-personality-portrait/16.png
```

For example, `16.png` is always `major-empress`, `52.png` is always
`swords-ace`, and `78.png` is always `pentacles-king`. A mismatched number,
filename, or card identity is rejected before preparation starts. The older
`tarot:premium:numeric-process` alias remains available but follows this same
locked contract.

The loop is:

```text
ChatGPT / art direction
→ generate one image
→ save as N.png
→ numeric process
→ Review Studio
→ human approve or reject
→ next number
```

The numeric process delegates to the same preparation, versioning, import, and
review-page pipeline as the single-card command. A changed checksum creates the
next candidate version; the same checksum is idempotent. Neither command approves
artwork.

## Prepare and import directly

For any of the seven pilots, run the existing general process command:

```sh
cd frontend
npm run tarot:premium:process -- major-magician /absolute/path/to/generated-magician.png
```

This prepares the source when needed, validates it, imports a versioned candidate,
and regenerates the development contact sheet. It never approves artwork. The
original stays unchanged, while prepared assets and lineage reports remain in the
Git-ignored `premium-production/prepared/<card-id>/` directory.

Candidate versions are allocated from the manifest, retained attempt history, and
existing production artifacts. A distinct image advances `v1 → v2 → v3`; rerunning
the exact same source checksum reuses its existing attempt. Retained candidate
artwork and review provenance are promoted to durable `history/`,
`reference-set/attempts/`, or approved storage before a later version becomes
active. Ephemeral source, preview, and working-review directories are not part of
clean-checkout provenance.

For preparation without import:

```sh
npm run tarot:premium:prepare -- /absolute/path/to/image.png --card-id major-magician
```

Undersized sources use one deterministic FFmpeg Lanczos resample to 1680×2880;
this is not AI super-resolution. Native sources at least 1400×2400 keep their
dimensions unless a centered crop of at most 4% is required for 7:12. Larger
ratio differences are rejected for human reframing.

## Review and decide

The process command creates a version-specific review page automatically. Start
the local production-only Studio and open the printed URL:

```sh
npm run tarot:premium:review-studio -- major-magician
```

Select any retained attempt, complete reviewer, notes, scores, and required
passes, including every canonical identity check, then choose **Save review**.
The Studio prominently shows the immutable expected title, numeral/rank, suit,
and production number. The Studio writes directly to that attempt's
versioned JSON; no manual JSON editing or downloaded-file replacement is needed.
All required passes must pass, every score must be at least 4/5, and a named human
reviewer must decide.

```sh
npm run tarot:premium:review -- major-magician approve
```

Or reject with explicit provenance:

```sh
npm run tarot:premium:review -- major-magician reject --category style-drift --notes "Specific review finding" --regeneration-reason "Specific correction"
```

### Replace an already approved card

Normal rejection is intentionally limited to an active review candidate. If a
semantic defect is discovered after approval, first use the explicit supersede
transition:

```sh
npm run tarot:premium:supersede -- major-empress --category canonical-number --notes "Incorrect canonical Major Arcana numeral. The Empress must display III, not production sequence XVI."
```

This retains the approved artwork, source provenance, review, checksums, reviewer, approval
notes, timestamp, and reason as immutable superseded history. The card becomes
`replacement-required`; it is no longer counted as an active production
approval. Existing superseded sources already retained as ordered checksum parts
remain immutable. New approvals use the immutable approved artwork as the durable
replacement-source equivalent while preserving original generated/prepared source
checksums and dimensions in candidate metadata. Import the corrected, distinct
numbered source normally and it becomes the next version:

```sh
npm run tarot:premium:number-process -- 16 /Users/ruslon69/Desktop/cards-ai-personality-portrait/16.png
```

The replacement still requires Review Studio completion and human approval.
Same-checksum reruns reuse the retained attempt. The generic command cannot
supersede The Fool Golden Master. Production numbers are external file identity,
not Tarot numerals: production 16 is Empress III, 17 is Emperor IV, and 18 is
Hierophant V.

After all seven candidates are reviewed, compare the pilot set together. Match
the Golden Master's craftsmanship, anatomy, materials, depth, symbolic clarity,
and painterly finish—not its sky, palette, sunlight, costume, camera, or density.

## Optional batch processing

Copy `batch-manifest.example.json`, set one absolute source directory, and list
already assigned numeric sources:

```sh
npm run tarot:premium:batch-process -- /absolute/path/to/batch.json
```

Each card is processed independently. Successful cards remain successful when a
later entry fails; failures are summarized and can be rerun. Existing candidates
are never overwritten, same-file reruns reuse their attempt, and batch processing
never approves artwork.

Generate the development-only filtered dashboard with:

```sh
npm run tarot:premium:contact-sheet
```

It filters reference, approved, needs-review, and pending cards and shows the
current attempt, retained attempts, locked sequence/source, role, and next
action. Additional filters cover remaining cards, Major Arcana, and every suit.

## Status and validation

```sh
npm run tarot:premium:status
npm run tarot:premium:progress
npm run tarot:premium:next
npm run tarot:premium:identity-audit
npm run tarot:premium:validate
npm run tarot:premium:integrity:test
```

The identity audit writes a development-only machine-readable report for
production sequences 1–18. It reports lifecycle and superseded versions from
durable state and labels visual canonical correctness only when explicit human
review provenance contains the canonical identity passes.

The completed 15-card reference set locks `premium-tarot-style-v2`, the approved
Fool Golden Master, the approved reference set, and the existing Visual Language
Bible for cards 16–78. Remaining cards are ordinary production cards, not new
references. Keep using the numeric loop in strict sequence order and run periodic
cross-deck consistency review. Runtime activation still waits for the atomic
78/78 gate.

The complete premium edition can release only after 78/78 approved assets pass
the existing release threshold. Approval binds the exact active review path,
candidate checksum, style, version, reviewer, complete rubric, required passes,
and canonical QA. Earlier legitimate approvals are accepted only through the
checksum-locked `approval-provenance.json` grandfathering contract.

Manifest-changing commands use one production filesystem lock. A concurrent
writer fails before reading state rather than overwriting a newer manifest. Full
release uses a recoverable journal: artwork is staged and checksum-validated,
production state is prepared, and the runtime manifest switches last. A failure
before that final switch restores classic state; retry recovers an interrupted
transaction deterministically.

```sh
npm run tarot:premium:release -- --complete
```
