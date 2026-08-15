#!/usr/bin/env node

import process from 'node:process';

import {
  buildProductionQueue,
  nextProductionCard,
  readReferenceSet,
  readSourceNumberMap,
} from './mass-production.mjs';
import { readProductionManifest } from './lib.mjs';
import {
  canonicalDisplayValue,
  canonicalIdentityForCard,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';

const [manifest, referenceSet, sourceMap, canonicalIdentityManifest] = await Promise.all([
  readProductionManifest(),
  readReferenceSet(),
  readSourceNumberMap(),
  readCanonicalIdentityManifest(),
]);
const identityFailures = validateCanonicalIdentityManifest(
  canonicalIdentityManifest,
  manifest,
  sourceMap,
);
if (identityFailures.length) throw new Error(identityFailures.join('\n'));
const next = nextProductionCard(buildProductionQueue(manifest, referenceSet, sourceMap));

if (!next) {
  process.stdout.write('All 78 premium Tarot cards are approved. Run release validation.\n');
} else {
  const identity = canonicalIdentityForCard(canonicalIdentityManifest, next.cardId);
  process.stdout.write(
    `Next production card:\n${next.sequenceNumber} — ${next.canonicalName}\ncardId: ${next.cardId}\nexpected source: ${next.sourceFilename}\ncanonical Tarot ${identity.arcana === 'major' ? 'numeral' : 'rank'}: ${canonicalDisplayValue(identity)}\ncanonical title: ${identity.canonicalDisplayTitle}\n`,
  );
}
