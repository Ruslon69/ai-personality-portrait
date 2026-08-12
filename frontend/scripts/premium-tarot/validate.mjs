#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  PILOT_CARD_IDS,
  buildPromptHandoff,
  frontendRoot,
  promptFileName,
  promptsRoot,
  readJson,
  readProductionManifest,
  readStyleLock,
  rubricPath,
  validateProductionManifest,
} from './lib.mjs';

const [manifest, style, rubric] = await Promise.all([
  readProductionManifest(),
  readStyleLock(),
  readJson(rubricPath),
]);
const failures = await validateProductionManifest(manifest);
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
  const expected = buildPromptHandoff(card, style, rubric);
  const path = resolve(promptsRoot, promptFileName(cardId));
  if (!existsSync(path) || (await readFile(path, 'utf8')) !== expected) {
    failures.push(`${cardId}: checked-in prompt differs from deterministic prompt builder output.`);
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
