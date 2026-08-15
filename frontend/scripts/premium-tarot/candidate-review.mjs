#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  findProductionCard,
  generatedRoot,
  manifestCandidateAttempts,
  readProductionManifest,
  validateProductionManifest,
} from './lib.mjs';
import {
  canonicalIdentityForCard,
  createCanonicalIdentityReview,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { readSourceNumberMap } from './mass-production.mjs';

const [cardId, ...extras] = process.argv.slice(2).filter((argument) => argument !== '--json');
if (!cardId || extras.length) {
  throw new Error('Usage: npm run tarot:premium:review-page -- <card-id>');
}

const [manifest, canonicalIdentityManifest, sourceMap] = await Promise.all([
  readProductionManifest(),
  readCanonicalIdentityManifest(),
  readSourceNumberMap(),
]);
const failures = await validateProductionManifest(manifest);
failures.push(...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap));
if (failures.length) throw new Error(failures.join('\n'));
const card = findProductionCard(manifest, cardId);
const canonicalIdentity = canonicalIdentityForCard(canonicalIdentityManifest, cardId);
if (card.isGoldenMaster) {
  throw new Error('Use the existing Golden Master Comparison Studio for major-fool.');
}
const attempts = manifestCandidateAttempts(card)
  .filter(
    (attempt) =>
      Number.isInteger(attempt.version) &&
      attempt.reviewPath &&
      attempt.outputPath &&
      existsSync(resolve(generatedRoot, '..', '..', attempt.reviewPath)),
  )
  .sort((left, right) => left.version - right.version);
if (!attempts.length) throw new Error(`${cardId} has no reviewable candidate attempts.`);

const templatePath = resolve(generatedRoot, '..', 'candidate-review-studio-template.html');
const template = await readFile(templatePath, 'utf8');
if (!template.includes('__CANDIDATE_REVIEW_STUDIO_DATA__')) {
  throw new Error('Candidate review studio template is missing its data placeholder.');
}
const outputDirectory = resolve(generatedRoot, 'candidate-reviews');
await mkdir(outputDirectory, { recursive: true });
const pages = [];
for (const attempt of attempts) {
  const readOnly = ['approved', 'integrated', 'superseded'].includes(attempt.productionStatus);
  const data = {
    card: {
      cardId: card.cardId,
      canonicalName: card.canonicalName,
      canonicalIdentity,
      symbolismChecklist: card.symbolismChecklist,
    },
    attempt: {
      version: attempt.version,
      productionStatus: attempt.productionStatus,
      reviewStatus: attempt.reviewStatus,
      checksum: attempt.checksum,
      styleVersion: attempt.styleVersion,
      candidateMetadata: attempt.candidateMetadata,
    },
    attempts: attempts.map((item) => ({
      version: item.version,
      productionStatus: item.productionStatus,
      reviewStatus: item.reviewStatus,
      href: `/review/${card.cardId}/v${item.version}`,
    })),
    approvalCommand: readOnly
      ? 'Immutable historical approval — import and review a replacement candidate.'
      : `npm run tarot:premium:review -- ${card.cardId} approve`,
    candidateUrl: `/api/art/candidate/${card.cardId}/v${attempt.version}`,
    classicUrl: `/api/art/classic/${card.cardId}`,
    canonicalIdentityReview: createCanonicalIdentityReview(canonicalIdentity),
    reviewApi: `/api/review/${card.cardId}/v${attempt.version}`,
    readOnly,
  };
  const outputPath = resolve(outputDirectory, `${card.cardId}-v${attempt.version}.html`);
  const serialized = JSON.stringify(data).replaceAll('<', '\\u003c');
  await writeFile(outputPath, template.replace('__CANDIDATE_REVIEW_STUDIO_DATA__', serialized));
  pages.push(outputPath);
}

const result = {
  cardId,
  pages,
  currentUrl: `http://127.0.0.1:4178/review/${cardId}/v${attempts.at(-1).version}`,
  serveCommand: `npm run tarot:premium:review-studio -- ${cardId}`,
};
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(result) : `Generated ${pages.length} candidate review page${pages.length === 1 ? '' : 's'}.\nCurrent page: ${pages.at(-1)}\nStart the review studio: ${result.serveCommand}\nOpen: ${result.currentUrl}`}\n`,
);
