#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';

import { frontendRoot, planCandidateImport, readProductionManifest } from './lib.mjs';
import {
  DECLARED_REFERENCE_CARD_IDS,
  LOCKED_PRODUCTION_CARD_IDS,
  applyLockedProductionStyle,
  buildProductionQueue,
  lockedSequenceRecord,
  nextProductionCard,
  readReferenceCoverage,
  readReferenceSet,
  readSourceNumberMap,
  referenceReadiness,
  resolveNumberedSourceInput,
  runBatchEntries,
  setSourceProcessed,
  validateBatchManifest,
  validateReferenceProduction,
} from './mass-production.mjs';

const results = [];
function check(condition, name) {
  if (!condition) throw new Error(`Reference production regression failed: ${name}`);
  results.push(name);
}

const [manifest, referenceSet, coverage, sourceMap] = await Promise.all([
  readProductionManifest(),
  readReferenceSet(),
  readReferenceCoverage(),
  readSourceNumberMap(),
]);
const failures = await validateReferenceProduction(manifest, referenceSet, coverage, sourceMap);
check(failures.length === 0, 'tracked reference production state validates');
check(
  referenceSet.cards.length === 15 &&
    new Set(referenceSet.cards.map((card) => card.cardId)).size === 15 &&
    JSON.stringify(referenceSet.cards.map((card) => card.cardId)) ===
      JSON.stringify(DECLARED_REFERENCE_CARD_IDS),
  'reference set contains the exact declared fifteen canonical cards',
);
check(
  referenceSet.cards.filter((card) => card.role === 'golden-master').length === 1 &&
    referenceSet.cards.find((card) => card.role === 'golden-master')?.cardId === 'major-fool',
  'The Fool remains the sole Golden Master',
);
check(
  referenceSet.cards
    .filter((card) => card.role === 'reference-target')
    .every(
      (card) =>
        card.approvedArtworkVersion === null &&
        card.checksum === null &&
        card.approvedArtworkPath === null &&
        card.approvedReviewPath === null,
    ),
  'planned reference cards do not fake approval',
);

const readiness = referenceReadiness(manifest, referenceSet);
check(
  readiness.approved ===
    referenceSet.cards.filter((card) => card.role !== 'reference-target').length &&
    readiness.approved === 15 &&
    readiness.total === 15 &&
    readiness.complete === true,
  'reference readiness reports the complete fifteen approved members',
);
const outsideApprovalManifest = JSON.parse(JSON.stringify(manifest));
const outsideCard = outsideApprovalManifest.cards.find((card) => card.cardId === 'major-emperor');
Object.assign(outsideCard, { productionStatus: 'approved', reviewStatus: 'approved' });
check(
  referenceReadiness(outsideApprovalManifest, referenceSet).approved === readiness.approved,
  'approved cards outside the declared reference set do not affect readiness',
);
const queue = buildProductionQueue(manifest, referenceSet, sourceMap);
const repeatedQueue = buildProductionQueue(manifest, referenceSet, sourceMap);
check(
  queue.length === 78 &&
    queue.every((item, index) => item.sequenceNumber === index + 1) &&
    JSON.stringify(queue.map((item) => item.cardId)) ===
      JSON.stringify(LOCKED_PRODUCTION_CARD_IDS) &&
    JSON.stringify(queue) === JSON.stringify(repeatedQueue),
  'full-deck queue follows the exact deterministic locked sequence',
);
check(
  sourceMap.records.length === 78 &&
    new Set(sourceMap.records.map((item) => item.sequenceNumber)).size === 78 &&
    new Set(sourceMap.records.map((item) => item.cardId)).size === 78 &&
    new Set(sourceMap.records.map((item) => item.sourceFilename)).size === 78 &&
    sourceMap.records.every(
      (item, index) =>
        item.sequenceNumber === index + 1 && item.sourceFilename === `${index + 1}.png`,
    ),
  'locked numeric records are continuous and unique',
);
const lockedAnchors = new Map([
  [16, 'major-empress'],
  [24, 'major-judgement'],
  [25, 'wands-ace'],
  [39, 'cups-two'],
  [52, 'swords-ace'],
  [65, 'pentacles-ace'],
  [78, 'pentacles-king'],
]);
check(
  [...lockedAnchors].every(([number, cardId]) => sourceMap.records[number - 1]?.cardId === cardId),
  'locked sequence anchor mappings remain exact',
);
check(
  sourceMap.records.slice(0, 15).every((item) => item.approvedState === 'approved') &&
    sourceMap.records.slice(15).every((item) => item.referenceRole === 'production-card'),
  'completed references are preserved and the remaining 63 are ordinary production cards',
);
const styleReadyCard = JSON.parse(
  JSON.stringify(manifest.cards.find((card) => card.cardId === 'major-emperor')),
);
styleReadyCard.productionStatus = 'pending';
applyLockedProductionStyle(styleReadyCard, sourceMap);
const preservedApprovedCard = JSON.parse(
  JSON.stringify(manifest.cards.find((card) => card.cardId === 'major-emperor')),
);
const preservedApprovedStyle = preservedApprovedCard.styleVersion;
applyLockedProductionStyle(preservedApprovedCard, sourceMap);
check(
  styleReadyCard.styleVersion === 'premium-tarot-style-v2' &&
    styleReadyCard.promptId === 'premium-tarot-full-production-v2:major-emperor' &&
    styleReadyCard.productionStyleLineage?.referenceSetStatus === 'complete' &&
    styleReadyCard.productionStyleLineage?.approvedReferenceCount === 15 &&
    preservedApprovedCard.styleVersion === preservedApprovedStyle,
  'future candidates inherit the completed v2 reference style without mutating approvals',
);
const resetSixteen = JSON.parse(JSON.stringify(queue));
resetSixteen[15].productionState = 'pending';
const unfinishedSixteen = JSON.parse(JSON.stringify(queue));
unfinishedSixteen[15].productionState = 'review';
const completedSixteen = JSON.parse(JSON.stringify(queue));
completedSixteen[15].productionState = 'approved';
completedSixteen[16].productionState = 'pending';
check(
  nextProductionCard(resetSixteen)?.sequenceNumber === 16 &&
    nextProductionCard(resetSixteen)?.cardId === 'major-empress' &&
    nextProductionCard(resetSixteen)?.sourceFilename === '16.png' &&
    nextProductionCard(unfinishedSixteen)?.sequenceNumber === 16 &&
    nextProductionCard(completedSixteen)?.sequenceNumber === 17,
  'next production card never skips the earliest unfinished number',
);
const numericFixtureRoot = await mkdtemp(join(tmpdir(), 'tarot-locked-number-'));
const mismatchedPath = join(numericFixtureRoot, '17.png');
await writeFile(mismatchedPath, 'fixture');
let mismatchRejected = false;
try {
  await resolveNumberedSourceInput(mismatchedPath, sourceMap.records[15]);
} catch (error) {
  mismatchRejected = error.message.includes('expects 16.png');
} finally {
  await rm(numericFixtureRoot, { recursive: true, force: true });
}
check(mismatchRejected, 'wrong number and filename combination is rejected');
let invalidNumberRejected = false;
try {
  lockedSequenceRecord(sourceMap, 999);
} catch (error) {
  invalidNumberRejected = error.message.includes('outside the locked 1–78 sequence');
}
check(invalidNumberRejected, 'production numbers outside 1–78 are rejected clearly');
check(
  validateBatchManifest(
    {
      schemaVersion: 'premium-tarot-batch-v1',
      sourceDirectory: '/absolute/fixture',
      entries: [{ sourceNumber: 16, cardId: 'major-emperor' }],
    },
    manifest,
    sourceMap,
  ).some((failure) => failure.includes('Source 16 is not mapped to major-emperor')),
  'numeric card-ID mismatch is rejected before processing',
);
const numericStateFixture = JSON.parse(JSON.stringify(sourceMap));
numericStateFixture.records[77].sourceState = 'reserved';
numericStateFixture.records[77].approvedState = 'not-approved';
const approvalBefore = numericStateFixture.records[77].approvedState;
check(
  setSourceProcessed(numericStateFixture, 78) === true &&
    numericStateFixture.records[77].sourceState === 'processed' &&
    numericStateFixture.records[77].approvedState === approvalBefore,
  'numeric processing cannot auto-approve a candidate',
);

const processedChecksums = new Map();
const fakeProcess = async (entry) => {
  const checksum = `fixture-${entry.sourceNumber}`;
  const prior = processedChecksums.get(entry.cardId);
  if (prior === checksum) return 'reused';
  processedChecksums.set(entry.cardId, checksum);
  return 'created';
};
const batch = [
  { sourceNumber: 9, cardId: 'major-sun' },
  { sourceNumber: 10, cardId: 'major-moon' },
];
const firstBatch = await runBatchEntries(batch, fakeProcess);
const secondBatch = await runBatchEntries(batch, fakeProcess);
check(
  firstBatch.every((result) => result.status === 'succeeded' && result.detail === 'created') &&
    secondBatch.every((result) => result.status === 'succeeded' && result.detail === 'reused'),
  'batch reruns are idempotent',
);
const partialBatch = await runBatchEntries(
  [
    { sourceNumber: 16, cardId: 'major-empress' },
    { sourceNumber: 17, cardId: 'major-emperor' },
    { sourceNumber: 18, cardId: 'major-hierophant' },
  ],
  async (entry) => {
    if (entry.cardId === 'major-emperor') throw new Error('fixture failure');
    return 'processed';
  },
);
check(
  partialBatch.map((result) => result.status).join(',') === 'succeeded,failed,succeeded',
  'partial batch failure is isolated per card',
);
check(
  referenceSet.cards
    .filter((entry) => entry.role === 'reference-target')
    .every((entry) => {
      const card = manifest.cards.find((candidate) => candidate.cardId === entry.cardId);
      const allowedTargetStates = new Map([
        ['prompt-ready-v2', 'not-reviewed'],
        ['generated', 'not-reviewed'],
        ['processing', 'not-reviewed'],
        ['review', 'needs-review'],
        ['rejected', 'rejected'],
      ]);
      return allowedTargetStates.get(card.productionStatus) === card.reviewStatus;
    }),
  'batch and reference tooling never auto-approve planned cards',
);

const versionFixture = {
  cardId: 'fixture-card',
  productionStatus: 'review',
  reviewStatus: 'needs-review',
  version: 2,
  checksum: 'candidate-two',
  sourcePath: 'source-v2',
  outputPath: 'candidate-v2',
  reviewPath: 'review-v2',
  candidateMetadata: { inputChecksum: 'input-two' },
  candidateHistory: [
    {
      version: 1,
      productionStatus: 'rejected',
      reviewStatus: 'rejected',
      checksum: 'candidate-one',
      sourcePath: 'source-v1',
      outputPath: 'candidate-v1',
      reviewPath: 'review-v1',
      candidateMetadata: { inputChecksum: 'input-one' },
    },
  ],
};
check(
  planCandidateImport(versionFixture, { inputChecksum: 'input-three' }).version === 3 &&
    versionFixture.candidateHistory.length === 1 &&
    versionFixture.version === 2,
  'new batch candidates preserve previous candidate versions',
);
check(
  manifest.releaseThreshold.approved === 78 &&
    manifest.releaseThreshold.nonApprovedReviewRecords === 0,
  'atomic premium release remains locked to 78 approved cards',
);
const runtimeRelease = JSON.parse(
  await readFile(
    resolve(frontendRoot, 'src/assets/tarot/metadata/premium-release-manifest.json'),
    'utf8',
  ),
);
check(
  (manifest.releaseMode === 'classic' &&
    runtimeRelease.mode === 'classic' &&
    runtimeRelease.records.length === 0) ||
    (manifest.releaseMode === 'premium-complete' &&
      runtimeRelease.mode === 'premium-complete' &&
      runtimeRelease.records.length === 78),
  'reference approvals preserve atomic classic or complete Premium runtime assets',
);

const summary = { assertions: results.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${results.length} reference production regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
