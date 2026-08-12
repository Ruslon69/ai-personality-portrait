#!/usr/bin/env node

import { constants } from 'node:fs';
import { copyFile, mkdir, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

import {
  manifestPath,
  readProductionManifest,
  resolveFrontendPath,
  sha256,
  validateProductionManifest,
  writeJsonAtomic,
} from './lib.mjs';

const complete = process.argv.includes('--complete');
const manifest = await readProductionManifest();
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
const notApproved = manifest.cards.filter(
  (card) =>
    card.productionStatus !== 'approved' ||
    card.reviewStatus !== 'approved' ||
    !card.checksum ||
    !card.outputPath,
);
const rejected = manifest.cards.filter(
  (card) => card.productionStatus === 'rejected' || card.reviewStatus === 'rejected',
);

process.stdout.write(
  `Premium release threshold: ${78 - notApproved.length}/78 approved, ${rejected.length} rejected active.\n`,
);
if (!complete) {
  process.stdout.write(
    'Dry check only. Pass --complete after all 78 cards are explicitly approved.\n',
  );
  process.exit(0);
}
if (manifest.cards.length !== 78 || notApproved.length || rejected.length) {
  throw new Error(
    'premium-complete requires 78/78 approved, zero rejected and every checksum/output.',
  );
}

for (const card of manifest.cards) {
  if ((await sha256(resolveFrontendPath(card.outputPath))) !== card.checksum) {
    throw new Error(`${card.cardId}: candidate checksum mismatch.`);
  }
}

const cardsRoot = resolveFrontendPath('src/assets/tarot/cards');
const stagingRoot = resolve(cardsRoot, '.premium-rws-remastered-staging');
const finalRoot = resolve(cardsRoot, 'premium-rws-remastered');
await rm(stagingRoot, { force: true, recursive: true });
await mkdir(stagingRoot, { recursive: false });
try {
  for (const card of manifest.cards) {
    await copyFile(
      resolveFrontendPath(card.outputPath),
      resolve(stagingRoot, `${card.cardId}.jpg`),
      constants.COPYFILE_EXCL,
    );
  }
  await rename(stagingRoot, finalRoot);
} catch (error) {
  await rm(stagingRoot, { force: true, recursive: true });
  throw error;
}

const releaseRecords = [];
for (const card of manifest.cards) {
  const finalPath = `src/assets/tarot/cards/premium-rws-remastered/${card.cardId}.jpg`;
  Object.assign(card, { finalPath, productionStatus: 'integrated' });
  releaseRecords.push({
    artworkVersion: `premium-tarot-art-v${card.version}`,
    assetPath: `../cards/premium-rws-remastered/${card.cardId}.jpg`,
    cardId: card.cardId,
    checksum: card.checksum,
  });
}
manifest.releaseMode = 'premium-complete';
await writeJsonAtomic(manifestPath, manifest);
const releaseManifestPath = resolveFrontendPath(
  'src/assets/tarot/metadata/premium-release-manifest.json',
);
await mkdir(dirname(releaseManifestPath), { recursive: true });
await writeJsonAtomic(releaseManifestPath, {
  editionId: manifest.editionId,
  mode: 'premium-complete',
  records: releaseRecords,
  version: manifest.schemaVersion,
});
process.stdout.write(
  'Integrated the complete 78-card premium edition. Run full validation before use.\n',
);
