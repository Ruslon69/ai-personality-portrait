#!/usr/bin/env node

import { constants } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  productionRoot,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  sha256,
  validateProductionManifest,
} from './lib.mjs';
import {
  readCanonicalIdentityManifest,
  validateCanonicalApprovalProvenance,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { readSourceNumberMap } from './mass-production.mjs';
import { validateActiveApprovalProvenance } from './approval-provenance.mjs';
import { acquireProductionLock } from './production-lock.mjs';
import { validatePremiumReleaseRecords } from './release-integrity.mjs';
import { executeReleaseTransaction } from './release-transaction.mjs';

const complete = process.argv.includes('--complete');
const productionLock = await acquireProductionLock('premium release');
try {
  const manifest = await readProductionManifest();
  const failures = await validateProductionManifest(manifest);
  const [canonicalIdentityManifest, sourceMap] = await Promise.all([
    readCanonicalIdentityManifest(),
    readSourceNumberMap(),
  ]);
  failures.push(
    ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
    ...(await validateCanonicalApprovalProvenance(manifest, canonicalIdentityManifest)),
    ...(await validateActiveApprovalProvenance(manifest, canonicalIdentityManifest)),
  );
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
  } else {
    if (manifest.cards.length !== 78 || notApproved.length || rejected.length) {
      throw new Error(
        'premium-complete requires 78/78 approved, zero rejected and every checksum/output.',
      );
    }
    const releaseProvenanceFailures = await validateActiveApprovalProvenance(
      manifest,
      canonicalIdentityManifest,
      { requireAllApproved: true },
    );
    if (releaseProvenanceFailures.length) {
      throw new Error(releaseProvenanceFailures.join('\n'));
    }
    for (const card of manifest.cards) {
      if ((await sha256(resolveFrontendPath(card.outputPath))) !== card.checksum) {
        throw new Error(`${card.cardId}: candidate checksum mismatch.`);
      }
    }

    const targetProductionManifest = JSON.parse(JSON.stringify(manifest));
    const releaseRecords = [];
    for (const card of targetProductionManifest.cards) {
      const finalPath = `src/assets/tarot/cards/premium-rws-remastered/${card.cardId}.jpg`;
      Object.assign(card, { finalPath, productionStatus: 'integrated' });
      releaseRecords.push({
        artworkVersion: `premium-tarot-art-v${card.version}`,
        assetPath: `../cards/premium-rws-remastered/${card.cardId}.jpg`,
        cardId: card.cardId,
        checksum: card.checksum,
      });
    }
    targetProductionManifest.releaseMode = 'premium-complete';
    const canonicalIds = canonicalIdentityManifest.records.map((record) => record.cardId);
    const releaseRecordFailures = validatePremiumReleaseRecords(releaseRecords, canonicalIds);
    if (releaseRecordFailures.length) throw new Error(releaseRecordFailures.join('\n'));

    const targetRuntimeManifest = {
      editionId: manifest.editionId,
      mode: 'premium-complete',
      records: releaseRecords,
      version: manifest.schemaVersion,
    };
    const productionManifestPath = resolve(productionRoot, 'production-manifest.json');
    const runtimeManifestPath = resolveFrontendPath(
      'src/assets/tarot/metadata/premium-release-manifest.json',
    );
    const originalRuntimeManifest = await readJson(runtimeManifestPath);
    if (originalRuntimeManifest.mode !== 'classic' || originalRuntimeManifest.records.length) {
      throw new Error('Premium release may only activate from the empty classic runtime state.');
    }
    const cardsRoot = resolveFrontendPath('src/assets/tarot/cards');
    const stagingRoot = resolve(cardsRoot, '.premium-rws-remastered-staging');
    const finalRoot = resolve(cardsRoot, 'premium-rws-remastered');
    const journalPath = resolve(productionRoot, '.release-transaction.json');
    await executeReleaseTransaction({
      finalRoot,
      journalPath,
      originalProductionManifest: manifest,
      originalRuntimeManifest,
      productionManifestPath,
      runtimeManifestPath,
      stagingRoot,
      targetProductionManifest,
      targetRuntimeManifest,
      async stageArtwork(staging) {
        for (const card of manifest.cards) {
          await copyFile(
            resolveFrontendPath(card.outputPath),
            resolve(staging, `${card.cardId}.jpg`),
            constants.COPYFILE_EXCL,
          );
        }
      },
      async validateStaged(staging) {
        for (const card of manifest.cards) {
          if ((await sha256(resolve(staging, `${card.cardId}.jpg`))) !== card.checksum) {
            throw new Error(`${card.cardId}: staged release artwork checksum mismatch.`);
          }
        }
      },
    });
    process.stdout.write(
      'Integrated the complete 78-card premium edition through the restartable release transaction.\n',
    );
  }
} finally {
  await productionLock.release();
}
