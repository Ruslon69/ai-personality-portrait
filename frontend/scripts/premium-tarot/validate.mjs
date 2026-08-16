#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  PILOT_CARD_IDS,
  PRODUCTION_VERSIONS,
  buildGoldenGenerationHandoff,
  buildPilotGenerationHandoff,
  buildPilotPromptHandoff,
  buildPromptHandoff,
  frontendRoot,
  goldenHandoffPath,
  goldenMasterRoot,
  goldenReferencePath,
  goldenRubricPath,
  pilotDirectionPath,
  pilotGenerationRoot,
  promptFileName,
  promptsRoot,
  readJson,
  readProductionManifest,
  readStyleLock,
  rubricPath,
  validateProductionManifest,
} from './lib.mjs';
import {
  readReferenceCoverage,
  readReferenceSet,
  readSourceNumberMap,
  validateReferenceProduction,
} from './mass-production.mjs';
import {
  canonicalIdentityPassIds,
  readCanonicalIdentityManifest,
  validateCanonicalApprovalProvenance,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { validateActiveApprovalProvenance } from './approval-provenance.mjs';
import { validatePremiumReleaseRecords } from './release-integrity.mjs';

const [manifest, rubric, goldenReference, pilotMatrix, canonicalIdentityManifest] =
  await Promise.all([
    readProductionManifest(),
    readJson(rubricPath),
    readJson(goldenReferencePath),
    readJson(pilotDirectionPath),
    readCanonicalIdentityManifest(),
  ]);
const failures = await validateProductionManifest(manifest);
const [referenceSet, referenceCoverage, sourceMap] = await Promise.all([
  readReferenceSet(),
  readReferenceCoverage(),
  readSourceNumberMap(),
]);
failures.push(
  ...(await validateReferenceProduction(manifest, referenceSet, referenceCoverage, sourceMap)),
  ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
  ...(await validateCanonicalApprovalProvenance(manifest, canonicalIdentityManifest)),
  ...(await validateActiveApprovalProvenance(manifest, canonicalIdentityManifest)),
);
if (JSON.stringify(rubric.canonicalIdentityPasses) !== JSON.stringify(canonicalIdentityPassIds)) {
  failures.push('Review rubric canonical identity passes differ from the locked QA contract.');
}
const propagatedPilotIds = PILOT_CARD_IDS.filter((cardId) => cardId !== 'major-fool');
const golden = manifest.cards.find((card) => card.cardId === 'major-fool');
const expectedGoldenChecksum = '8cccbb26fd91a70df31c3f2c0c5705d11a0ec4b8ca15a5383130864534e7aa9f';
if (
  !['approved', 'integrated'].includes(golden?.productionStatus) ||
  golden.reviewStatus !== 'approved' ||
  golden.goldenMasterStatus !== 'approved' ||
  golden.goldenMasterReviewStatus !== 'approved' ||
  golden.styleVersion !== PRODUCTION_VERSIONS.goldenStyle ||
  golden.checksum !== expectedGoldenChecksum ||
  goldenReference.checksum !== expectedGoldenChecksum
) {
  failures.push('The approved Fool Golden Master record changed or is incomplete.');
}
const expectedLineage = {
  goldenMasterCard: 'major-fool',
  goldenMasterReferenceVersion: PRODUCTION_VERSIONS.goldenMaster,
  goldenMasterArtworkVersion: goldenReference.artworkVersion,
  goldenMasterChecksum: goldenReference.checksum,
};
if (
  pilotMatrix.version !== 'premium-tarot-pilot-direction-v2' ||
  pilotMatrix.goldenMasterCard !== 'major-fool' ||
  pilotMatrix.cards.length !== 7 ||
  JSON.stringify(pilotMatrix.cards.map((card) => card.cardId).sort()) !==
    JSON.stringify([...propagatedPilotIds].sort())
) {
  failures.push('Pilot art-direction matrix must contain exactly the seven propagated cards.');
}
const goldenRubric = await readJson(goldenRubricPath);
const expectedGoldenSections = [
  'composition',
  'lighting',
  'perspective',
  'depth',
  'anatomy',
  'materials',
  'color',
  'symbolism',
  'recognizability',
  'collectibleQuality',
  'overallImpression',
];
const expectedGoldenWarnings = [
  'croppingRisk',
  'lowContrast',
  'possibleAiArtifact',
  'unreadableHand',
  'unreadableFace',
  'compositionImbalance',
  'perspectiveIssue',
];
if (
  JSON.stringify(goldenRubric.reviewSections) !== JSON.stringify(expectedGoldenSections) ||
  JSON.stringify(goldenRubric.reviewWarnings) !== JSON.stringify(expectedGoldenWarnings) ||
  goldenRubric.scale?.approvalMinimumPerCategory !== 4
) {
  failures.push('Golden Master Comparison Studio rubric differs from the locked review contract.');
}
const studioTemplate = await readFile(resolve(goldenMasterRoot, 'studio-template.html'), 'utf8');
if (
  !studioTemplate.includes('__GOLDEN_MASTER_STUDIO_DATA__') ||
  !['Classic', 'Candidate', 'Side-by-side', 'Overlay', 'Split view', 'Difference'].every((mode) =>
    studioTemplate.includes(mode),
  ) ||
  ![
    'Source resolution',
    'Prepared resolution',
    'Resize method',
    'Preparation version',
    'nativeResolutionEligible',
    'preparedResolutionEligible',
  ].every((field) => studioTemplate.includes(field)) ||
  !studioTemplate.includes(
    'Candidate source was below Golden Master native resolution and was upscaled.',
  )
) {
  failures.push('Golden Master Comparison Studio template is incomplete.');
}
if (
  PRODUCTION_VERSIONS.preparation !== 'premium-tarot-preparation-v1' ||
  !existsSync(resolve(frontendRoot, 'scripts/premium-tarot/prepare.mjs')) ||
  !existsSync(resolve(frontendRoot, 'scripts/premium-tarot/golden-process.mjs'))
) {
  failures.push('Premium artwork preparation pipeline is missing or has an invalid version.');
}
const promptFiles = existsSync(promptsRoot)
  ? (await readdir(promptsRoot)).filter((name) => name.endsWith('.md')).sort()
  : [];
const expectedPromptFiles = PILOT_CARD_IDS.map(promptFileName).sort();
if (JSON.stringify(promptFiles) !== JSON.stringify(expectedPromptFiles)) {
  failures.push(`Expected exactly eight pilot prompts: ${expectedPromptFiles.join(', ')}.`);
}
for (const cardId of PILOT_CARD_IDS) {
  const card = manifest.cards.find((candidate) => candidate.cardId === cardId);
  if (!card) continue;
  const style = await readStyleLock(card.styleVersion);
  const direction = pilotMatrix.cards.find((candidate) => candidate.cardId === cardId);
  const expected = card.isGoldenMaster
    ? buildPromptHandoff(card, style, rubric)
    : buildPilotPromptHandoff(card, style, direction, expectedLineage, rubric);
  const path = resolve(promptsRoot, promptFileName(cardId));
  if (!existsSync(path) || (await readFile(path, 'utf8')) !== expected) {
    failures.push(`${cardId}: checked-in prompt differs from deterministic prompt builder output.`);
  }
  if (
    card.isGoldenMaster &&
    (!existsSync(goldenHandoffPath) ||
      (await readFile(goldenHandoffPath, 'utf8')) !== buildGoldenGenerationHandoff(card, style))
  ) {
    failures.push(`${cardId}: Golden Master generation handoff is missing or non-deterministic.`);
  }
  if (!card.isGoldenMaster) {
    const handoffPath = resolve(pilotGenerationRoot, `${cardId}.txt`);
    const expectedHandoff = buildPilotGenerationHandoff(card, style, direction);
    if (!existsSync(handoffPath) || (await readFile(handoffPath, 'utf8')) !== expectedHandoff) {
      failures.push(`${cardId}: pilot generation handoff is missing or non-deterministic.`);
    }
    if (
      card.styleVersion !== PRODUCTION_VERSIONS.goldenStyle ||
      JSON.stringify(card.goldenMasterLineage) !== JSON.stringify(expectedLineage)
    ) {
      failures.push(`${cardId}: propagated pilot state or Golden Master lineage is invalid.`);
    }
  }
}

const pilotHandoffFiles = existsSync(pilotGenerationRoot)
  ? (await readdir(pilotGenerationRoot)).filter((name) => name.endsWith('.txt')).sort()
  : [];
if (
  JSON.stringify(pilotHandoffFiles) !==
  JSON.stringify(propagatedPilotIds.map((cardId) => `${cardId}.txt`).sort())
) {
  failures.push('Expected exactly seven Golden-Master-aware pilot generation handoffs.');
}

const requiredPromptSections = [
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
  'NEGATIVE PROMPT:',
  'OUTPUT REQUIREMENTS:',
];
const genericPromptLanguage = [
  'Preserve the canonical distant landscape',
  'Keep every canonical near-field',
  'where applicable',
  'dark fantasy atmosphere without horror spectacle',
];
for (const cardId of propagatedPilotIds) {
  const card = manifest.cards.find((candidate) => candidate.cardId === cardId);
  const prompt = await readFile(resolve(promptsRoot, `${cardId}.md`), 'utf8');
  const handoff = await readFile(resolve(pilotGenerationRoot, `${cardId}.txt`), 'utf8');
  const headings = [...handoff.matchAll(/^(FINAL PROMPT|NEGATIVE PROMPT|OUTPUT REQUIREMENTS)$/gmu)];
  if (
    requiredPromptSections.some((section) => !prompt.includes(section)) ||
    genericPromptLanguage.some((phrase) => prompt.includes(phrase)) ||
    card.symbolismChecklist.some((symbol) => !prompt.includes(symbol)) ||
    !prompt.includes(`goldenMasterChecksum: ${goldenReference.checksum}`) ||
    !prompt.includes('no baked card frame') ||
    headings.length !== 3 ||
    handoff.includes('goldenMasterChecksum') ||
    handoff.includes('Review checklist')
  ) {
    failures.push(`${cardId}: v2 prompt is generic, incomplete, or has an invalid handoff shape.`);
  }
}
const exactCountCoverage = {
  'major-magician': ['one Cup, one Pentacle, one Sword, and one Wand'],
  'major-star': ['one large eight-pointed star', 'seven smaller stars'],
  'swords-three': ['exactly three clearly separated swords'],
  'cups-ace': ['one and only one principal Cup', 'exactly five overflowing streams'],
};
for (const [cardId, phrases] of Object.entries(exactCountCoverage)) {
  const prompt = await readFile(resolve(promptsRoot, `${cardId}.md`), 'utf8');
  if (phrases.some((phrase) => !prompt.includes(phrase))) {
    failures.push(`${cardId}: exact-count symbolism is not explicit in the v2 prompt.`);
  }
}

const matrixFields = [
  'dominantMood',
  'paletteFamily',
  'lightingFamily',
  'materialEmphasis',
  'depthStrategy',
  'compositionStrategy',
  'mainVisualRisk',
  'mainSubject',
  'poseAndComposition',
  'foreground',
  'midground',
  'background',
  'lighting',
  'materialRendering',
  'palette',
  'framing',
];
for (const direction of pilotMatrix.cards) {
  if (
    matrixFields.some(
      (field) => typeof direction[field] !== 'string' || !direction[field].trim(),
    ) ||
    !Array.isArray(direction.negativeConstraints) ||
    direction.negativeConstraints.length < 4
  ) {
    failures.push(`${direction.cardId}: pilot art direction is incomplete.`);
  }
}

const plannedReferenceIds = new Set(
  referenceSet.cards.filter((card) => card.role === 'reference-target').map((card) => card.cardId),
);
if (
  [...plannedReferenceIds].some((cardId) => {
    const card = manifest.cards.find((candidate) => candidate.cardId === cardId);
    const allowedTargetStates = new Map([
      ['prompt-ready-v2', 'not-reviewed'],
      ['generated', 'not-reviewed'],
      ['processing', 'not-reviewed'],
      ['review', 'needs-review'],
      ['rejected', 'rejected'],
    ]);
    return (
      allowedTargetStates.get(card.productionStatus) !== card.reviewStatus ||
      card.styleVersion !== PRODUCTION_VERSIONS.goldenStyle ||
      card.promptId !== `${PRODUCTION_VERSIONS.referenceTargets}:${cardId}`
    );
  })
) {
  failures.push('Planned reference targets must remain unapproved with valid v2 lineage.');
}

const rightsSource = await readFile(
  resolve(frontendRoot, 'src/assets/tarot/metadata/rws-public-domain-manifest.ts'),
  'utf8',
);
const canonicalIds = [...rightsSource.matchAll(/cardId: '([^']+)'/gu)]
  .map((match) => match[1])
  .sort();
const productionIds = manifest.cards.map((card) => card.cardId).sort();
if (JSON.stringify(canonicalIds) !== JSON.stringify(productionIds)) {
  failures.push('Production IDs do not match the unchanged classic 78-card rights manifest.');
}

const orientation = await readJson(
  resolve(frontendRoot, 'src/assets/tarot/metadata/rws-orientation-manifest.json'),
);
if (
  orientation.reviewRecords.length !== 78 ||
  orientation.reviewRecords.some(
    (record) => record.canonicalOrientation !== 'upright' || record.needsManualReview,
  )
) {
  failures.push('Classic orientation fallback is not fully reviewed canonical upright.');
}

const release = await readJson(
  resolve(frontendRoot, 'src/assets/tarot/metadata/premium-release-manifest.json'),
);
if (
  manifest.releaseMode === 'classic' &&
  (release.mode !== 'classic' || release.records.length !== 0)
) {
  failures.push('Classic production mode requires an empty classic runtime release manifest.');
}
if (
  manifest.releaseMode === 'premium-complete' &&
  (release.mode !== 'premium-complete' || release.records.length !== 78)
) {
  failures.push('premium-complete requires exactly 78 runtime release records.');
}

if (release.mode === 'premium-complete') {
  failures.push(...validatePremiumReleaseRecords(release.records, productionIds));
}

if (manifest.releaseMode === 'premium-complete') {
  const releaseReady =
    manifest.cards.length === 78 &&
    manifest.cards.every(
      (card) =>
        card.productionStatus === 'integrated' &&
        card.reviewStatus === 'approved' &&
        card.checksum &&
        card.finalPath,
    );
  if (!releaseReady)
    failures.push('premium-complete requires 78/78 integrated and approved records.');
}
if (
  manifest.releaseMode === 'classic' &&
  manifest.cards.some((card) => card.productionStatus === 'integrated')
) {
  failures.push('Classic release mode cannot expose integrated premium assets.');
}

if (failures.length) {
  failures.forEach((failure) => process.stderr.write(`FAIL ${failure}\n`));
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Premium production validation passed: 78 cards, ${promptFiles.length} pilot prompts, release mode ${manifest.releaseMode}.\n`,
  );
}
