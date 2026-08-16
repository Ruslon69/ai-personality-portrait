import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { getTarotArtwork } from '../../assets/tarot';
import { standardTarotDeck } from '../../features/tarot/data';
import { QualityAssertions } from '../assertions';

const pilotIds = [
  'major-fool',
  'major-magician',
  'major-high-priestess',
  'major-death',
  'major-tower',
  'major-star',
  'swords-three',
  'cups-ace',
];
const propagatedPilotIds = pilotIds.filter((cardId) => cardId !== 'major-fool');
const productionStatuses = [
  'pending',
  'prompt-ready',
  'prompt-ready-v2',
  'generated',
  'processing',
  'review',
  'approved',
  'replacement-required',
  'rejected',
  'integrated',
];
const reviewStatuses = ['not-reviewed', 'needs-review', 'approved', 'rejected'];
const promptSections = [
  'CARD TITLE:',
  'RIDER–WAITE SYMBOLIC IDENTITY:',
  'MAIN SUBJECT:',
  'POSE AND COMPOSITION:',
  'MANDATORY OBJECTS:',
  'EMOTIONAL TONE:',
  'FOREGROUND:',
  'MIDGROUND:',
  'BACKGROUND:',
  'LIGHTING:',
  'MATERIAL RENDERING:',
  'PALETTE:',
  'DEPTH:',
  'FRAMING:',
  'REALISM LEVEL:',
];
const requiredExclusions = [
  'no text inside artwork',
  'no baked card frame, border, UI, logo or watermark',
  'no anime, manga',
  'no cyberpunk',
  'no extra limbs',
  'no modern clothing or technology',
];

type PremiumProductionCard = {
  approvalNotes?: string;
  approvedBy?: string;
  arcana: string;
  canonicalName: string;
  candidateHistory?: Array<{
    checksum: string;
    productionStatus: string;
    version: number;
  }>;
  cardId: string;
  checksum?: string;
  compositionReference: Record<string, string>;
  finalPath?: string;
  forbiddenChanges: string[];
  goldenMasterLineage?: {
    goldenMasterArtworkVersion: string;
    goldenMasterCard: string;
    goldenMasterChecksum: string;
    goldenMasterReferenceVersion: string;
  };
  productionStyleLineage?: {
    styleVersion: string;
  };
  isGoldenMaster: boolean;
  outputPath: string;
  productionStatus: string;
  promptId: string;
  requiredObjects: string[];
  reviewPath?: string;
  reviewStatus: string;
  sourceReferenceId: string;
  styleVersion: string;
  symbolismChecklist: string[];
  version: number;
};

export function runTarotPremiumProductionGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const productionRoot = resolve(rootDir, 'premium-production');
  const manifest = JSON.parse(
    readFileSync(resolve(productionRoot, 'production-manifest.json'), 'utf8'),
  );
  const style = JSON.parse(readFileSync(resolve(productionRoot, 'style-lock.json'), 'utf8'));
  const goldenStyle = JSON.parse(
    readFileSync(resolve(productionRoot, 'style-lock-v2.json'), 'utf8'),
  );
  const rubric = JSON.parse(readFileSync(resolve(productionRoot, 'review-rubric.json'), 'utf8'));
  const goldenReference = JSON.parse(
    readFileSync(resolve(productionRoot, 'golden-master/reference.json'), 'utf8'),
  );
  const pilotMatrix = JSON.parse(
    readFileSync(resolve(productionRoot, 'pilot-art-direction.json'), 'utf8'),
  );
  const referenceSet = JSON.parse(
    readFileSync(resolve(productionRoot, 'reference-set/manifest.json'), 'utf8'),
  );
  const referenceCoverage = JSON.parse(
    readFileSync(resolve(productionRoot, 'reference-set/coverage-matrix.json'), 'utf8'),
  );
  const sourceNumberMap = JSON.parse(
    readFileSync(resolve(productionRoot, 'source-number-map.json'), 'utf8'),
  );
  const visualBible = readFileSync(
    resolve(productionRoot, 'GOLDEN_MASTER_VISUAL_LANGUAGE.md'),
    'utf8',
  );
  const release = JSON.parse(
    readFileSync(
      resolve(rootDir, 'src/assets/tarot/metadata/premium-release-manifest.json'),
      'utf8',
    ),
  );
  const artworkProviderSource = readFileSync(
    resolve(rootDir, 'src/assets/tarot/metadata/artwork.ts'),
    'utf8',
  );
  const cards = manifest.cards as PremiumProductionCard[];
  const lifecycleResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-production-state.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const candidateVersioningResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-candidate-versioning.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const reviewWorkflowResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-review-workflow.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const referenceProductionResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-reference-production.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const supersedeResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-supersede.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const canonicalIdentityResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-canonical-identity.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const productionIntegrityResult = JSON.parse(
    execFileSync(
      process.execPath,
      [resolve(rootDir, 'scripts/premium-tarot/test-production-integrity.mjs'), '--json'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );
  const canonicalIds = standardTarotDeck.cards.map((card) => card.id).sort();
  const productionIds = cards.map((card) => card.cardId).sort();

  assertions.assert(cards.length === 78 && new Set(productionIds).size === 78, {
    actual: cards.length,
    code: 'premium-production-manifest-coverage',
    expected: 78,
    message: 'Premium production manifest must contain exactly 78 unique cards.',
  });
  assertions.assert(JSON.stringify(productionIds) === JSON.stringify(canonicalIds), {
    code: 'premium-production-canonical-ids',
    message: 'Premium production IDs must exactly match the unchanged canonical deck.',
  });
  assertions.assert(JSON.stringify(manifest.pilotCardIds) === JSON.stringify(pilotIds), {
    code: 'premium-production-pilot-lock',
    message: 'Premium production must retain the exact eight-card pilot batch.',
  });
  const golden = cards.find((card) => card.cardId === 'major-fool');
  const goldenArtworkPath = resolve(rootDir, golden?.outputPath ?? '__missing-artwork__');
  const goldenReviewPath = resolve(rootDir, golden?.reviewPath ?? '__missing-review__');
  const goldenReview = existsSync(goldenReviewPath)
    ? JSON.parse(readFileSync(goldenReviewPath, 'utf8'))
    : undefined;
  const actualGoldenChecksum = existsSync(goldenArtworkPath)
    ? createHash('sha256').update(readFileSync(goldenArtworkPath)).digest('hex')
    : undefined;
  assertions.assert(
    golden?.isGoldenMaster === true &&
      ['approved', 'integrated'].includes(golden.productionStatus) &&
      golden.reviewStatus === 'approved' &&
      golden.styleVersion === 'premium-tarot-style-v2' &&
      golden.checksum === goldenReference.checksum &&
      golden.outputPath.startsWith('premium-production/golden-master/approved/') &&
      golden.reviewPath?.startsWith('premium-production/golden-master/approved/') &&
      goldenReference.approvedArtworkPath === golden.outputPath &&
      goldenReference.approvedReviewPath === golden.reviewPath &&
      actualGoldenChecksum === golden.checksum &&
      goldenReview?.candidateChecksum === golden.checksum &&
      goldenReview?.reviewer === 'Ruslan' &&
      goldenReview?.decision === 'approved' &&
      goldenReference.checksum ===
        '8cccbb26fd91a70df31c3f2c0c5705d11a0ec4b8ca15a5383130864534e7aa9f',
    {
      code: 'premium-production-approved-golden-master',
      message: 'The approved Fool Golden Master and its authoritative checksum must remain intact.',
    },
  );
  assertions.assert(lifecycleResult.passed === true && lifecycleResult.assertions >= 8, {
    actual: lifecycleResult,
    code: 'premium-production-lifecycle-regressions',
    message: 'Lifecycle regression fixtures must enforce prompt, review, and approved boundaries.',
  });
  assertions.assert(
    candidateVersioningResult.passed === true && candidateVersioningResult.assertions >= 9,
    {
      actual: candidateVersioningResult,
      code: 'premium-production-candidate-versioning-regressions',
      message:
        'Candidate versioning must preserve history, idempotency, and atomic failure safety.',
    },
  );
  assertions.assert(reviewWorkflowResult.passed === true && reviewWorkflowResult.assertions >= 8, {
    actual: reviewWorkflowResult,
    code: 'premium-production-review-workflow-regressions',
    message: 'Candidate review pages must load and save exact versioned review records.',
  });
  assertions.assert(
    referenceProductionResult.passed === true && referenceProductionResult.assertions >= 12,
    {
      actual: referenceProductionResult,
      code: 'premium-production-reference-regressions',
      message:
        'Reference membership, queue, batch idempotency, history, and release safety must pass.',
    },
  );
  assertions.assert(supersedeResult.passed === true && supersedeResult.assertions >= 11, {
    actual: supersedeResult,
    code: 'premium-production-supersede-regressions',
    message:
      'Approved replacements must preserve immutable history, version safely, and retain classic release safety.',
  });
  assertions.assert(
    canonicalIdentityResult.passed === true && canonicalIdentityResult.assertions >= 19,
    {
      actual: canonicalIdentityResult,
      code: 'premium-production-canonical-identity-regressions',
      message:
        'Production numbering and canonical Tarot identity must remain independently locked.',
    },
  );
  assertions.assert(
    productionIntegrityResult.passed === true && productionIntegrityResult.assertions >= 16,
    {
      actual: productionIntegrityResult,
      code: 'premium-production-integrity-hardening',
      message: 'Premium production integrity, release recovery, and writer locking must pass.',
    },
  );
  assertions.assert(
    manifest.releaseThreshold?.approved === 78 &&
      manifest.releaseThreshold?.canonicalIds === 78 &&
      manifest.releaseThreshold?.rejectedActive === 0 &&
      manifest.releaseThreshold?.missingAssets === 0 &&
      manifest.releaseThreshold?.missingChecksums === 0 &&
      manifest.releaseThreshold?.nonUprightOrientationRecords === 0 &&
      manifest.releaseThreshold?.nonApprovedReviewRecords === 0,
    {
      code: 'premium-production-release-threshold',
      message: 'Premium complete release must remain locked to 78/78 reviewed assets.',
    },
  );

  cards.forEach((card) => {
    const composition = card.compositionReference;
    const referenceMetadata = referenceSet.cards.find(
      (entry: { cardId: string; role: string; styleVersion: string }) =>
        entry.cardId === card.cardId,
    );
    const referenceV2Target =
      referenceMetadata &&
      !pilotIds.includes(card.cardId) &&
      referenceMetadata.styleVersion === 'premium-tarot-style-v2';
    const fullProductionV2 = card.productionStyleLineage?.styleVersion === 'premium-tarot-style-v2';
    assertions.assert(
      Boolean(card.canonicalName) &&
        ['major', 'minor'].includes(card.arcana) &&
        productionStatuses.includes(card.productionStatus) &&
        reviewStatuses.includes(card.reviewStatus) &&
        card.sourceReferenceId === `rws-public-domain-v1:${card.cardId}` &&
        card.promptId ===
          (pilotIds.includes(card.cardId) && !card.isGoldenMaster
            ? `premium-tarot-pilot-prompts-v2:${card.cardId}`
            : referenceV2Target
              ? `premium-tarot-reference-targets-v2:${card.cardId}`
              : fullProductionV2
                ? `premium-tarot-full-production-v2:${card.cardId}`
                : `premium-tarot-prompts-v1:${card.cardId}`) &&
        card.styleVersion ===
          (pilotIds.includes(card.cardId) || referenceV2Target || fullProductionV2
            ? 'premium-tarot-style-v2'
            : 'premium-tarot-style-v1') &&
        Number.isInteger(card.version),
      {
        code: `premium-production-record-${card.cardId}`,
        message: `${card.cardId} has incomplete production identity or state metadata.`,
      },
    );
    assertions.assert(
      Array.isArray(card.symbolismChecklist) &&
        card.symbolismChecklist.length > 0 &&
        new Set(card.symbolismChecklist).size === card.symbolismChecklist.length &&
        Array.isArray(card.requiredObjects) &&
        card.requiredObjects.length > 0 &&
        Array.isArray(card.forbiddenChanges) &&
        card.forbiddenChanges.length >= 4,
      {
        code: `premium-production-symbolism-${card.cardId}`,
        message: `${card.cardId} lacks explicit symbolism, required objects, or forbidden changes.`,
      },
    );
    assertions.assert(
      [
        'mainSubject',
        'poseAndComposition',
        'emotionalTone',
        'foreground',
        'midground',
        'background',
        'framing',
        'referenceAsset',
        'referenceRule',
      ].every((field) => Boolean(composition?.[field])) &&
        existsSync(resolve(rootDir, composition.referenceAsset)),
      {
        code: `premium-production-composition-${card.cardId}`,
        message: `${card.cardId} lacks a complete and valid semantic composition reference.`,
      },
    );
    assertions.assert(
      !['approved', 'integrated'].includes(card.productionStatus) ||
        (card.reviewStatus === 'approved' &&
          Boolean(card.approvalNotes) &&
          Boolean(card.approvedBy) &&
          Boolean(card.checksum) &&
          existsSync(resolve(rootDir, card.outputPath)) &&
          Boolean(card.reviewPath) &&
          existsSync(resolve(rootDir, card.reviewPath ?? '__missing-review__'))),
      {
        code: `premium-production-approved-file-${card.cardId}`,
        message: `${card.cardId} cannot be approved without a reviewed checksummed output.`,
      },
    );
    assertions.assert(card.productionStatus !== 'integrated' || card.reviewStatus === 'approved', {
      code: `premium-production-rejected-integration-${card.cardId}`,
      message: `${card.cardId} cannot integrate rejected artwork.`,
    });
  });

  const promptRoot = resolve(productionRoot, 'prompts');
  const promptFiles = readdirSync(promptRoot)
    .filter((name) => extname(name) === '.md')
    .sort();
  assertions.assert(
    promptFiles.length === 8 &&
      JSON.stringify(promptFiles) === JSON.stringify(pilotIds.map((id) => `${id}.md`).sort()),
    {
      actual: promptFiles.length,
      code: 'premium-production-prompt-count',
      expected: 8,
      message: 'Exactly the eight locked pilot prompts must be checked in.',
    },
  );
  promptFiles.forEach((name) => {
    const prompt = readFileSync(resolve(promptRoot, name), 'utf8');
    const isGoldenPrompt = name === 'major-fool.md';
    assertions.assert(
      promptSections.every((section) => prompt.includes(section)) &&
        (isGoldenPrompt
          ? prompt.includes('NEGATIVE CONSTRAINTS:') && prompt.includes('OUTPUT:')
          : prompt.includes('NEGATIVE PROMPT:') && prompt.includes('OUTPUT REQUIREMENTS:')),
      {
        code: `premium-production-prompt-sections-${name}`,
        message: `${name} lacks a required master prompt section.`,
      },
    );
    assertions.assert(
      requiredExclusions.every((constraint) => prompt.includes(constraint)),
      {
        code: `premium-production-prompt-negative-${name}`,
        message: `${name} lacks a required negative constraint.`,
      },
    );
  });

  assertions.assert(
    pilotMatrix.version === 'premium-tarot-pilot-direction-v2' &&
      pilotMatrix.goldenMasterCard === 'major-fool' &&
      pilotMatrix.cards.length === 7 &&
      JSON.stringify(pilotMatrix.cards.map((card: { cardId: string }) => card.cardId).sort()) ===
        JSON.stringify([...propagatedPilotIds].sort()),
    {
      code: 'premium-production-pilot-direction-matrix',
      message: 'The Golden-Master-derived pilot matrix must cover exactly seven cards.',
    },
  );
  const expectedLineage = {
    goldenMasterCard: 'major-fool',
    goldenMasterReferenceVersion: 'premium-tarot-golden-master-v1',
    goldenMasterArtworkVersion: 'premium-tarot-art-v1',
    goldenMasterChecksum: goldenReference.checksum,
  };
  const propagatedCards = cards.filter((card) => propagatedPilotIds.includes(card.cardId));
  assertions.assert(
    propagatedCards.length === 7 &&
      propagatedCards.every(
        (card) =>
          card.styleVersion === 'premium-tarot-style-v2' &&
          JSON.stringify(card.goldenMasterLineage) === JSON.stringify(expectedLineage),
      ),
    {
      code: 'premium-production-pilot-lineage-state',
      message: 'Seven propagated pilots require approved Fool lineage through lifecycle changes.',
    },
  );
  const allReferenceIds = new Set(
    referenceSet.cards.map((card: { cardId: string }) => card.cardId),
  );
  assertions.assert(
    cards
      .filter((card) => allReferenceIds.has(card.cardId))
      .every(
        (card) =>
          ['approved', 'integrated'].includes(card.productionStatus) &&
          card.reviewStatus === 'approved',
      ) && allReferenceIds.size === 15,
    {
      code: 'premium-production-reference-target-state',
      message: 'The complete reference set must retain all fifteen human approvals.',
    },
  );
  assertions.assert(
    referenceSet.cards.length === 15 &&
      new Set(referenceSet.cards.map((card: { cardId: string }) => card.cardId)).size === 15 &&
      referenceSet.cards.filter((card: { role: string }) => card.role === 'golden-master')
        .length === 1 &&
      referenceCoverage.cards.length === 15 &&
      sourceNumberMap.schemaVersion === 'premium-tarot-locked-production-sequence-v1' &&
      sourceNumberMap.records.length === 78 &&
      new Set(
        sourceNumberMap.records.map((item: { sequenceNumber: number }) => item.sequenceNumber),
      ).size === 78 &&
      new Set(sourceNumberMap.records.map((item: { cardId: string }) => item.cardId)).size === 78 &&
      new Set(
        sourceNumberMap.records.map((item: { sourceFilename: string }) => item.sourceFilename),
      ).size === 78,
    {
      code: 'premium-production-reference-model',
      message:
        'The completed reference model and locked 78-card production sequence must be unique.',
    },
  );

  const handoffRoot = resolve(productionRoot, 'pilot-generation');
  const handoffFiles = readdirSync(handoffRoot)
    .filter((name) => extname(name) === '.txt')
    .sort();
  assertions.assert(
    JSON.stringify(handoffFiles) ===
      JSON.stringify(propagatedPilotIds.map((cardId) => `${cardId}.txt`).sort()),
    {
      actual: handoffFiles.length,
      code: 'premium-production-pilot-handoff-count',
      expected: 7,
      message: 'Exactly seven external generation handoffs must exist.',
    },
  );
  handoffFiles.forEach((name) => {
    const handoff = readFileSync(resolve(handoffRoot, name), 'utf8');
    const headings = [
      ...handoff.matchAll(/^(FINAL PROMPT|NEGATIVE PROMPT|OUTPUT REQUIREMENTS)$/gmu),
    ];
    assertions.assert(
      headings.length === 3 &&
        handoff.startsWith('FINAL PROMPT\n') &&
        !handoff.includes('goldenMasterChecksum') &&
        !handoff.includes('Review checklist') &&
        !handoff.includes('implementation'),
      {
        code: `premium-production-pilot-handoff-shape-${name}`,
        message: `${name} must contain only the three external-generation sections.`,
      },
    );
  });

  const genericPromptLanguage = [
    'Preserve the canonical distant landscape',
    'Keep every canonical near-field',
    'where applicable',
    'dark fantasy atmosphere without horror spectacle',
  ];
  const propagatedPrompts = propagatedPilotIds.map((cardId) =>
    readFileSync(resolve(promptRoot, `${cardId}.md`), 'utf8'),
  );
  assertions.assert(
    propagatedPrompts.every(
      (prompt) =>
        !genericPromptLanguage.some((generic) => prompt.includes(generic)) &&
        prompt.includes('goldenMasterCard: major-fool') &&
        prompt.includes(`goldenMasterChecksum: ${goldenReference.checksum}`) &&
        prompt.includes('no baked card frame') &&
        prompt.includes('no card frame or border'),
    ) && new Set(propagatedPrompts).size === 7,
    {
      code: 'premium-production-card-specific-prompts',
      message: 'Pilot prompts must be distinct, lineage-aware, specific, and frame-free.',
    },
  );
  const promptById = Object.fromEntries(
    propagatedPilotIds.map((cardId, index) => [cardId, propagatedPrompts[index]]),
  );
  assertions.assert(
    promptById['major-magician'].includes('one Cup, one Pentacle, one Sword, and one Wand') &&
      promptById['swords-three'].includes('exactly three clearly separated swords') &&
      promptById['major-star'].includes('one large eight-pointed star') &&
      promptById['major-star'].includes('seven smaller stars') &&
      promptById['cups-ace'].includes('one and only one principal Cup') &&
      promptById['cups-ace'].includes('exactly five overflowing streams'),
    {
      code: 'premium-production-exact-symbol-counts',
      message: 'Critical suit tools, swords, stars, vessels, and streams must retain exact counts.',
    },
  );
  assertions.assert(
    [
      'Painterly surface',
      'Anatomy, faces, and hands',
      'Major and Minor Arcana',
      'Permitted artistic freedom',
      'Forbidden style drift',
      'Pilot coherence review',
    ].every((section) => visualBible.includes(section)) &&
      visualBible.includes(goldenReference.checksum),
    {
      code: 'premium-production-visual-language-bible',
      message: 'The approved Golden Master must anchor practical production guidance.',
    },
  );

  assertions.assert(
    style.version === 'premium-tarot-style-v1' &&
      style.status === 'locked' &&
      style.outputContract?.canonicalOrientation === 'upright' &&
      style.outputContract?.runtimeFormat === 'jpeg' &&
      style.globalNegativeConstraints.length >= 14,
    {
      code: 'premium-production-style-lock',
      message: 'The definitive style lock or proven JPEG output contract changed unexpectedly.',
    },
  );
  assertions.assert(
    goldenStyle.version === 'premium-tarot-style-v2' &&
      goldenStyle.supersedesForGoldenMaster === style.version &&
      goldenStyle.outputContract?.canonicalOrientation === 'upright' &&
      goldenStyle.globalNegativeConstraints.length >= 14,
    {
      code: 'premium-production-golden-style-lock',
      message: 'Golden Master style v2 must remain a canonical-upright refinement of v1.',
    },
  );
  assertions.assert(
    rubric.version === 'premium-tarot-review-v1' &&
      rubric.scoreCategories.length === 11 &&
      rubric.requiredPasses.length === 9 &&
      rubric.scale.approvalMinimumPerCategory === 4,
    {
      code: 'premium-production-human-review-rubric',
      message: 'Human review must retain all scoring and explicit approval requirements.',
    },
  );
  const classicReleaseSafe =
    release.mode === 'classic' &&
    release.records.length === 0 &&
    manifest.releaseMode === 'classic';
  const completeReleaseSafe =
    release.mode === 'premium-complete' &&
    release.records.length === 78 &&
    new Set(release.records.map((record: { cardId: string }) => record.cardId)).size === 78 &&
    manifest.releaseMode === 'premium-complete' &&
    cards.every(
      (card) => card.productionStatus === 'integrated' && card.reviewStatus === 'approved',
    );
  assertions.assert(classicReleaseSafe || completeReleaseSafe, {
    code: 'premium-production-release-atomicity',
    message: 'Runtime artwork must be either all classic or a complete approved 78-card edition.',
  });
  const classic = getTarotArtwork('major-fool');
  const requestedStandard = getTarotArtwork('major-fool', undefined, { quality: 'standard' });
  const requestedPremium = getTarotArtwork('major-fool', undefined, { quality: 'premium' });
  assertions.assert(
    requestedStandard.editionId === 'rws-archival-classic' &&
      (classicReleaseSafe
        ? classic.editionId === 'rws-archival-classic' &&
          requestedPremium.editionId === 'rws-archival-classic' &&
          classic.faceAsset === requestedPremium.faceAsset
        : classic.editionId === 'premium-rws-remastered' &&
          requestedPremium.editionId === 'premium-rws-remastered' &&
          classic.faceAsset === requestedPremium.faceAsset),
    {
      code: 'premium-production-edition-selection',
      message:
        'Artwork selection must preserve explicit classic fallback and atomic premium release.',
    },
  );
  const releaseRecords = new Map(
    release.records.map((record: { cardId: string }) => [record.cardId, record]),
  );
  const resolvedRuntimeArtwork = canonicalIds.map((cardId) => getTarotArtwork(cardId));
  assertions.assert(
    !completeReleaseSafe ||
      (resolvedRuntimeArtwork.length === 78 &&
        resolvedRuntimeArtwork.every(
          (artwork) =>
            artwork.editionId === 'premium-rws-remastered' &&
            artwork.quality === 'premium' &&
            artwork.sourceKind === 'ai-painting' &&
            Boolean(artwork.faceAsset),
        )),
    {
      code: 'premium-runtime-all-card-resolution',
      message:
        'A valid premium-complete release must resolve Premium face artwork for all 78 canonical IDs without classic fallback.',
    },
  );
  assertions.assert(
    !completeReleaseSafe ||
      cards.every((card) => {
        const record = releaseRecords.get(card.cardId) as
          { artworkVersion: string; assetPath: string; checksum: string } | undefined;
        return (
          record?.artworkVersion === `premium-tarot-art-v${card.version}` &&
          record.checksum === card.checksum &&
          record.assetPath === `../cards/premium-rws-remastered/${card.cardId}.jpg` &&
          !(card.candidateHistory ?? []).some(
            (attempt) =>
              attempt.productionStatus === 'superseded' && attempt.checksum === record.checksum,
          )
        );
      }),
    {
      code: 'premium-runtime-active-version-only',
      message:
        'Runtime release records must bind each current active artwork version and exclude superseded Ace or other historical checksums.',
    },
  );
  assertions.assert(
    artworkProviderSource.includes('premiumReleaseIsAtomic') &&
      artworkProviderSource.includes('premiumRelease.records.length === 78') &&
      artworkProviderSource.includes('new Set(premiumRecordIds).size === 78') &&
      artworkProviderSource.includes('premiumReleaseIsAtomic\n    ? premiumRelease.records.map'),
    {
      code: 'premium-runtime-invalid-release-fallback',
      message:
        'An invalid or partial Premium runtime manifest must expose no Premium records and safely retain classic artwork fallback.',
    },
  );

  const builtJavaScript = readdirSync(resolve(rootDir, 'dist/assets'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(resolve(rootDir, 'dist/assets', name), 'utf8'))
    .join('');
  assertions.assert(
    !builtJavaScript.includes('premium-tarot-prompts-v1') &&
      !builtJavaScript.includes('premium-tarot-pilot-prompts-v2') &&
      !builtJavaScript.includes('premium-tarot-style-v2') &&
      !builtJavaScript.includes('Final generation prompt') &&
      !builtJavaScript.includes('generic fantasy wizard'),
    {
      code: 'premium-production-runtime-isolation',
      message: 'Prompt and review production metadata must not enter production JavaScript.',
    },
  );

  return assertions.result({ fixtureCount: cards.length + promptFiles.length });
}
