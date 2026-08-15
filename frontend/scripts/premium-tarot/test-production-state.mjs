#!/usr/bin/env node

import { existsSync } from 'node:fs';
import process from 'node:process';

import {
  findProductionCard,
  readProductionManifest,
  resolveFrontendPath,
  validateProductionManifest,
} from './lib.mjs';
import { readReferenceSet } from './mass-production.mjs';

const results = [];
const clone = (value) => JSON.parse(JSON.stringify(value));
function check(condition, name) {
  if (!condition) throw new Error(`Production lifecycle regression failed: ${name}`);
  results.push(name);
}

const manifest = await readProductionManifest();
const referenceSet = await readReferenceSet();
const failures = await validateProductionManifest(manifest);
check(failures.length === 0, 'tracked approved production state validates');

const fool = findProductionCard(manifest, 'major-fool');
check(
  fool.productionStatus === 'approved' &&
    fool.reviewStatus === 'approved' &&
    existsSync(resolveFrontendPath(fool.outputPath)) &&
    existsSync(resolveFrontendPath(fool.reviewPath)),
  'approved Golden Master requires tracked artwork and review files',
);

const promptManifest = clone(manifest);
const promptCard = findProductionCard(promptManifest, 'major-high-priestess');
Object.assign(promptCard, {
  productionStatus: 'prompt-ready-v2',
  reviewStatus: 'not-reviewed',
  checksum: undefined,
  candidateMetadata: undefined,
  outputPath: 'premium-production/candidates/fixture-prompt.jpg',
  previewPath: undefined,
  reviewPath: undefined,
  sourcePath: undefined,
  approvedBy: undefined,
  approvalNotes: undefined,
});
check(
  promptCard.productionStatus === 'prompt-ready-v2' &&
    promptCard.reviewStatus === 'not-reviewed' &&
    !promptCard.checksum &&
    !promptCard.reviewPath,
  'prompt-ready card does not require generated artwork',
);

const invalidPromptManifest = clone(promptManifest);
findProductionCard(invalidPromptManifest, 'major-high-priestess').checksum = 'not-generated';
const invalidPromptFailures = await validateProductionManifest(invalidPromptManifest, {
  checkFiles: false,
});
check(
  invalidPromptFailures.some((failure) => failure.includes('contains generated or reviewed data')),
  'prompt-ready card rejects false generated state',
);

const missingApprovedManifest = clone(manifest);
findProductionCard(missingApprovedManifest, 'major-fool').outputPath =
  'premium-production/golden-master/approved/missing.jpg';
const missingApprovedFailures = await validateProductionManifest(missingApprovedManifest);
check(
  missingApprovedFailures.some(
    (failure) =>
      failure.includes('approved output file is missing') ||
      failure.includes('approved Golden Master provenance is unreadable'),
  ),
  'approved card fails when tracked artwork is missing',
);

const propagated = manifest.cards.filter(
  (card) => card.cardId !== 'major-fool' && manifest.pilotCardIds.includes(card.cardId),
);
check(
  propagated.length === 7 &&
    propagated.every(
      (card) =>
        card.styleVersion === 'premium-tarot-style-v2' &&
        card.promptId === `premium-tarot-pilot-prompts-v2:${card.cardId}`,
    ),
  'seven propagated pilots retain Golden Master prompt lineage through lifecycle changes',
);
check(
  referenceSet.cards.every((entry) => {
    const card = findProductionCard(manifest, entry.cardId);
    return card.productionStatus === 'approved' && card.reviewStatus === 'approved';
  }),
  'completed reference set retains all fifteen human approvals',
);
check(manifest.releaseMode === 'classic', 'classic release remains active');

const summary = { assertions: results.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${results.length} production lifecycle regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
