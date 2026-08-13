#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  PILOT_CARD_IDS,
  PRODUCTION_VERSIONS,
  buildGoldenGenerationHandoff,
  buildPromptHandoff,
  frontendRoot,
  goldenHandoffPath,
  goldenMasterRoot,
  goldenRubricPath,
  promptFileName,
  promptsRoot,
  readJson,
  readProductionManifest,
  readStyleLock,
  rubricPath,
  validateProductionManifest,
} from './lib.mjs';

const [manifest, rubric] = await Promise.all([readProductionManifest(), readJson(rubricPath)]);
const failures = await validateProductionManifest(manifest);
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
  const expected = buildPromptHandoff(card, style, rubric);
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
