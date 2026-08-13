#!/usr/bin/env node

import process from 'node:process';

import { PILOT_CARD_IDS, readProductionManifest, validateProductionManifest } from './lib.mjs';

const manifest = await readProductionManifest();
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
  'rejected',
  'integrated',
]) {
  process.stdout.write(`${String(count(status)).padStart(2, ' ')} ${status}\n`);
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
