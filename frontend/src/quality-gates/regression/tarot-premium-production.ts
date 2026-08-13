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
const productionStatuses = [
  'pending',
  'prompt-ready',
  'generated',
  'processing',
  'review',
  'approved',
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
  'NEGATIVE CONSTRAINTS:',
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
  cardId: string;
  checksum?: string;
  compositionReference: Record<string, string>;
  finalPath?: string;
  forbiddenChanges: string[];
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
  const release = JSON.parse(
    readFileSync(
      resolve(rootDir, 'src/assets/tarot/metadata/premium-release-manifest.json'),
      'utf8',
    ),
  );
  const cards = manifest.cards as PremiumProductionCard[];
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
    assertions.assert(
      Boolean(card.canonicalName) &&
        ['major', 'minor'].includes(card.arcana) &&
        productionStatuses.includes(card.productionStatus) &&
        reviewStatuses.includes(card.reviewStatus) &&
        card.sourceReferenceId === `rws-public-domain-v1:${card.cardId}` &&
        card.promptId === `premium-tarot-prompts-v1:${card.cardId}` &&
        card.styleVersion ===
          (card.isGoldenMaster ? 'premium-tarot-style-v2' : 'premium-tarot-style-v1') &&
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
    assertions.assert(
      promptSections.every((section) => prompt.includes(section)),
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

  const builtJavaScript = readdirSync(resolve(rootDir, 'dist/assets'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(resolve(rootDir, 'dist/assets', name), 'utf8'))
    .join('');
  assertions.assert(
    !builtJavaScript.includes('premium-tarot-prompts-v1') &&
      !builtJavaScript.includes('premium-tarot-style-v2') &&
      !builtJavaScript.includes('Final generation prompt'),
    {
      code: 'premium-production-runtime-isolation',
      message: 'Prompt and review production metadata must not enter production JavaScript.',
    },
  );

  return assertions.result({ fixtureCount: cards.length + promptFiles.length });
}
