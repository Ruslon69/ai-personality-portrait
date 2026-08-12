#!/usr/bin/env node

import { existsSync } from 'node:fs';
import process from 'node:process';

import {
  PILOT_CARD_IDS,
  PRODUCTION_VERSIONS,
  productionCards,
} from '../../premium-production/catalog.mjs';
import { manifestPath, writeJsonAtomic } from './lib.mjs';

if (existsSync(manifestPath) && !process.argv.includes('--force')) {
  throw new Error(
    'production-manifest.json already exists. Pass --force only when intentionally rebuilding its initial state.',
  );
}

if (
  productionCards.length !== 78 ||
  new Set(productionCards.map((card) => card.cardId)).size !== 78
) {
  throw new Error('The production catalog must contain exactly 78 unique cards.');
}

await writeJsonAtomic(manifestPath, {
  schemaVersion: PRODUCTION_VERSIONS.artwork,
  editionId: PRODUCTION_VERSIONS.edition,
  styleVersion: PRODUCTION_VERSIONS.style,
  promptVersion: PRODUCTION_VERSIONS.prompts,
  reviewVersion: PRODUCTION_VERSIONS.review,
  releaseMode: 'classic',
  allowedReleaseModes: ['classic', 'premium-preview', 'premium-complete'],
  releaseThreshold: {
    approved: 78,
    canonicalIds: 78,
    rejectedActive: 0,
    missingAssets: 0,
    missingChecksums: 0,
    nonUprightOrientationRecords: 0,
    nonApprovedReviewRecords: 0,
  },
  pilotCardIds: PILOT_CARD_IDS,
  cards: productionCards,
});

process.stdout.write(`Created ${manifestPath} with ${productionCards.length} card records.\n`);
