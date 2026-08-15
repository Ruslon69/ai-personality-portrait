#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  canonicalDisplayValue,
  canonicalIdentityForSequence,
  canonicalIdentityReviewFailures,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import {
  readJson,
  readProductionManifest,
  generatedRoot,
  resolveFrontendPath,
  writeJsonAtomic,
} from './lib.mjs';
import { readSourceNumberMap } from './mass-production.mjs';

const [manifest, sourceMap, canonicalIdentityManifest] = await Promise.all([
  readProductionManifest(),
  readSourceNumberMap(),
  readCanonicalIdentityManifest(),
]);
const failures = validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap);
if (failures.length) throw new Error(failures.join('\n'));

const records = [];
for (let sequenceNumber = 1; sequenceNumber <= 18; sequenceNumber += 1) {
  const identity = canonicalIdentityForSequence(canonicalIdentityManifest, sequenceNumber);
  const card = manifest.cards.find((candidate) => candidate.cardId === identity.cardId);
  let canonicalQaProvenance = 'not-recorded';
  if (card.reviewPath && existsSync(resolveFrontendPath(card.reviewPath))) {
    const review = await readJson(resolveFrontendPath(card.reviewPath));
    const reviewFailures = canonicalIdentityReviewFailures(review, identity);
    if (
      reviewFailures.metadataMatches &&
      reviewFailures.validShape &&
      reviewFailures.missingPasses.length === 0
    ) {
      canonicalQaProvenance = `explicit-human-pass:${review.reviewer}`;
    } else if (card.productionStatus === 'review') {
      canonicalQaProvenance = 'pending-explicit-human-review';
    }
  }
  records.push({
    sequence: sequenceNumber,
    cardId: card.cardId,
    canonicalExpectedNumeralOrRank: canonicalDisplayValue(identity),
    canonicalDisplayTitle: identity.canonicalDisplayTitle,
    activeVersion: card.version,
    activeLifecycleState: card.productionStatus,
    activeReviewState: card.reviewStatus,
    historicalSupersededVersions: (card.candidateHistory ?? [])
      .filter((attempt) => attempt.productionStatus === 'superseded')
      .map((attempt) => attempt.version),
    canonicalQaProvenance,
  });
}

const report = {
  schemaVersion: 'premium-tarot-canonical-identity-audit-v1',
  scope: 'production-sequence-1-18',
  visualVerificationPolicy:
    'Lifecycle state is factual. Visual numeral/title correctness is asserted only when explicit canonical QA passes exist in human review provenance.',
  records,
};
await mkdir(generatedRoot, { recursive: true });
const outputPath = resolve(generatedRoot, 'canonical-identity-audit-1-18.json');
await writeJsonAtomic(outputPath, report);

process.stdout.write('Canonical Tarot identity audit — production 1–18\n');
for (const record of records) {
  process.stdout.write(
    `${String(record.sequence).padStart(2, ' ')}  ${record.cardId.padEnd(22)} ${record.canonicalExpectedNumeralOrRank.padEnd(6)} v${record.activeVersion} ${record.activeLifecycleState}/${record.activeReviewState} superseded:${record.historicalSupersededVersions.join(',') || '-'} canonical-QA:${record.canonicalQaProvenance}\n`,
  );
}
process.stdout.write(`Report: ${outputPath}\n`);
