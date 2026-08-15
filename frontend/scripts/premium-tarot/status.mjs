#!/usr/bin/env node

import process from 'node:process';

import { PILOT_CARD_IDS, readProductionManifest, validateProductionManifest } from './lib.mjs';
import { readReferenceSet, referenceReadiness } from './mass-production.mjs';

const [manifest, referenceSet] = await Promise.all([readProductionManifest(), readReferenceSet()]);
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));

const count = (status) => manifest.cards.filter((card) => card.productionStatus === status).length;
process.stdout.write(`Premium Tarot production — ${manifest.editionId}\n`);
process.stdout.write(`Release mode: ${manifest.releaseMode}\n`);
process.stdout.write(`78 total\n`);
for (const status of [
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
]) {
  process.stdout.write(`${String(count(status)).padStart(2, ' ')} ${status}\n`);
}
const replacements = manifest.cards.filter(
  (card) => card.productionStatus === 'replacement-required',
);
if (replacements.length) {
  process.stdout.write('\nAwaiting replacement\n');
  for (const card of replacements) {
    const superseded = (card.candidateHistory ?? []).filter(
      (attempt) => attempt.productionStatus === 'superseded',
    );
    process.stdout.write(
      `${card.cardId}: replacement v${card.version} required; retained approved history ${superseded.map((attempt) => `v${attempt.version}`).join(', ')}\n`,
    );
  }
}
process.stdout.write('\nPilot batch\n');
for (const cardId of PILOT_CARD_IDS) {
  const card = manifest.cards.find((candidate) => candidate.cardId === cardId);
  process.stdout.write(`${cardId}: ${card?.productionStatus} / ${card?.reviewStatus}\n`);
}
const goldenMaster = manifest.cards.find((card) => card.isGoldenMaster);
process.stdout.write('\nGolden Master\n');
process.stdout.write(
  `${goldenMaster.cardId}: ${goldenMaster.goldenMasterStatus} / ${goldenMaster.goldenMasterReviewStatus} / ${goldenMaster.goldenMasterStyleVersion} / candidate v${goldenMaster.goldenMasterCandidateVersion}\n`,
);
const readiness = referenceReadiness(manifest, referenceSet);
process.stdout.write(
  `\nReference set readiness: ${readiness.approved} / ${readiness.total} approved\n`,
);
if (readiness.complete) process.stdout.write('REFERENCE STYLE SET COMPLETE\n');
