#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import process from 'node:process';

import {
  findProductionCard,
  generatedRoot,
  goldenMasterRoot,
  goldenRubricPath,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  validateProductionManifest,
} from './lib.mjs';

function localUrl(frontendPath) {
  if (!frontendPath || !existsSync(resolveFrontendPath(frontendPath))) return '';
  return relative(generatedRoot, resolveFrontendPath(frontendPath)).split(sep).join('/');
}

async function readOptionalJson(frontendPath) {
  if (!frontendPath || !existsSync(resolveFrontendPath(frontendPath))) return undefined;
  return readJson(resolveFrontendPath(frontendPath));
}

const manifest = await readProductionManifest();
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
const card = findProductionCard(manifest, 'major-fool');
const rubric = await readJson(goldenRubricPath);
const currentReview = await readOptionalJson(card.reviewPath);
const history = await Promise.all(
  (card.goldenMasterHistory ?? []).map(async (attempt) => ({
    ...attempt,
    candidateUrl: localUrl(attempt.outputPath),
    review: await readOptionalJson(attempt.reviewPath),
  })),
);
const attempts = [
  ...history,
  {
    candidateMetadata: card.candidateMetadata,
    candidateUrl: localUrl(card.outputPath),
    candidateVersion: card.goldenMasterCandidateVersion,
    checksum: card.checksum,
    outputPath: card.outputPath,
    review: currentReview,
    reviewPath: card.reviewPath,
    reviewer: currentReview?.reviewer ?? card.goldenMasterApprovedBy,
    status: card.goldenMasterStatus,
    styleVersion: card.goldenMasterStyleVersion,
  },
];
const studioData = {
  card: {
    cardId: card.cardId,
    canonicalName: card.canonicalName,
    reviewPath: card.reviewPath,
    reviewStatus: card.goldenMasterReviewStatus,
    status: card.goldenMasterStatus,
    styleVersion: card.goldenMasterStyleVersion,
    symbolismChecklist: card.symbolismChecklist,
  },
  classicUrl: localUrl(card.compositionReference.referenceAsset),
  currentReview,
  attempts,
  rubric,
};
const serializedData = JSON.stringify(studioData).replaceAll('<', '\\u003c');
const template = await readFile(resolve(goldenMasterRoot, 'studio-template.html'), 'utf8');
if (!template.includes('__GOLDEN_MASTER_STUDIO_DATA__')) {
  throw new Error('Golden Master studio template is missing its data placeholder.');
}

await mkdir(generatedRoot, { recursive: true });
const outputPath = resolve(generatedRoot, 'the-fool-golden-review.html');
await writeFile(outputPath, template.replace('__GOLDEN_MASTER_STUDIO_DATA__', serializedData));
process.stdout.write(`Wrote development-only Golden Master review studio: ${outputPath}\n`);
