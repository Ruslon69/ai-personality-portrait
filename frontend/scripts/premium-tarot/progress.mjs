#!/usr/bin/env node

import process from 'node:process';

import {
  buildProductionQueue,
  nextProductionCard,
  readReferenceSet,
  readSourceNumberMap,
  referenceReadiness,
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
const queue = buildProductionQueue(manifest, referenceSet, sourceMap);
const approved = queue.filter((item) =>
  ['approved', 'integrated'].includes(item.productionState),
).length;
const readiness = referenceReadiness(manifest, referenceSet);
const next = nextProductionCard(queue);
const remainingByFamily = (family) =>
  queue.filter(
    (item) =>
      (family === 'major' ? item.arcana === 'major' : item.suit === family) &&
      !['approved', 'integrated'].includes(item.productionState),
  ).length;

process.stdout.write(
  `Premium Tarot Production\n\nApproved: ${approved} / 78\nRemaining: ${78 - approved}\nReference set: ${readiness.complete ? 'COMPLETE' : `${readiness.approved} / ${readiness.total}`}\n`,
);
if (next) {
  const identity = canonicalIdentityForCard(canonicalIdentityManifest, next.cardId);
  process.stdout.write(
    `\nNext:\n${next.sequenceNumber} — ${next.canonicalName}\ncardId: ${next.cardId}\nexpected source: ${next.sourceFilename}\ncanonical Tarot ${identity.arcana === 'major' ? 'numeral' : 'rank'}: ${canonicalDisplayValue(identity)}\ncanonical title: ${identity.canonicalDisplayTitle}\n`,
  );
}
process.stdout.write(
  `\nMajor Arcana remaining: ${remainingByFamily('major')}\nWands remaining: ${remainingByFamily('wands')}\nCups remaining: ${remainingByFamily('cups')}\nSwords remaining: ${remainingByFamily('swords')}\nPentacles remaining: ${remainingByFamily('pentacles')}\n`,
);
