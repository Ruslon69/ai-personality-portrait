#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';

import { canonicalIdentityForCard, readCanonicalIdentityManifest } from './canonical-identity.mjs';
import {
  planCandidateImport,
  publishCandidateArtifacts,
  readJson,
  readProductionManifest,
} from './lib.mjs';
import {
  readReferenceSet,
  readSourceNumberMap,
  referenceReadiness,
  setSequenceApprovalState,
} from './mass-production.mjs';
import { saveCandidateReview } from './review-workflow.mjs';
import { planApprovedSupersede } from './supersede-lib.mjs';

const results = [];
function check(condition, name) {
  if (!condition) throw new Error(`Supersede regression failed: ${name}`);
  results.push(name);
}

function approvedCard(overrides = {}) {
  return {
    cardId: 'major-empress',
    isGoldenMaster: false,
    version: 1,
    productionStatus: 'approved',
    reviewStatus: 'approved',
    styleVersion: 'premium-tarot-style-v2',
    checksum: 'candidate-v1',
    sourcePath: 'source-v1.png',
    outputPath: 'approved-v1.jpg',
    reviewPath: 'approved-v1.review.json',
    candidateMetadata: {
      inputChecksum: 'prepared-v1',
      preparation: { sourceChecksum: 'source-v1', preparedChecksum: 'prepared-v1' },
    },
    candidateHistory: [],
    approvedBy: 'Reviewer',
    approvedAt: '2026-08-01T10:00:00.000Z',
    approvalNotes: 'Approved v1.',
    ...overrides,
  };
}

function supersede(card, version = card.version) {
  return planApprovedSupersede(card, {
    approvalTimestamp: card.approvedAt ?? `2026-08-0${version}T10:00:00.000Z`,
    category: 'canonical-number',
    notes: `Canonical correction for v${version}.`,
    reviewArtifactChecksum: `review-artifact-v${version}`,
    sourceArtifactChecksum: `source-artifact-v${version}`,
    sourceArtifacts: [
      {
        index: 1,
        path: `premium-production/approved/history/major-empress-v${version}.source.part-01.bin`,
        checksum: `source-part-v${version}`,
        sizeBytes: 100,
      },
    ],
    supersededAt: `2026-08-1${version}T10:00:00.000Z`,
  });
}

const original = approvedCard();
const originalSnapshot = JSON.stringify(original);
const replacementV2 = supersede(original);
check(
  replacementV2.productionStatus === 'replacement-required' &&
    replacementV2.reviewStatus === 'not-reviewed' &&
    replacementV2.version === 2 &&
    replacementV2.candidateHistory.length === 1 &&
    replacementV2.candidateHistory[0].productionStatus === 'superseded',
  'approved v1 transitions explicitly to replacement-required v2',
);
check(
  JSON.stringify(original) === originalSnapshot &&
    replacementV2.candidateHistory[0].approvedBy === 'Reviewer' &&
    replacementV2.candidateHistory[0].approvalNotes === 'Approved v1.' &&
    replacementV2.candidateHistory[0].supersedeReason.category === 'canonical-number',
  'approved v1 provenance remains immutable in retained history',
);

let goldenRejected = false;
try {
  supersede(approvedCard({ cardId: 'major-fool', isGoldenMaster: true }));
} catch (error) {
  goldenRejected = error.message.includes('Golden Master cannot use');
}
check(goldenRejected, 'Golden Master cannot use generic supersede');

const distinctV2 = planCandidateImport(replacementV2, {
  inputChecksum: 'prepared-v2',
  sourceChecksum: 'source-v2',
});
const duplicateV1 = planCandidateImport(replacementV2, {
  inputChecksum: 'prepared-v1',
  sourceChecksum: 'source-v1',
});
check(
  distinctV2.mode === 'create' && distinctV2.version === 2,
  'distinct replacement source becomes v2',
);
check(
  duplicateV1.mode === 'reuse' && duplicateV1.version === 1,
  'same checksum reuses retained attempt without a fake replacement version',
);

const approvedV2 = approvedCard({
  ...replacementV2,
  approvalNotes: 'Approved v2.',
  approvedAt: '2026-08-02T10:00:00.000Z',
  approvedBy: 'Reviewer Two',
  candidateMetadata: {
    inputChecksum: 'prepared-v2',
    preparation: { sourceChecksum: 'source-v2', preparedChecksum: 'prepared-v2' },
  },
  checksum: 'candidate-v2',
  outputPath: 'approved-v2.jpg',
  productionStatus: 'approved',
  replacementReason: undefined,
  replacementRequiredAt: undefined,
  reviewPath: 'approved-v2.review.json',
  reviewStatus: 'approved',
  sourcePath: 'source-v2.png',
});
const replacementV3 = supersede(approvedV2, 2);
const distinctV3 = planCandidateImport(replacementV3, {
  inputChecksum: 'prepared-v3',
  sourceChecksum: 'source-v3',
});
check(
  replacementV3.version === 3 &&
    replacementV3.candidateHistory.map((attempt) => attempt.version).join(',') === '1,2' &&
    distinctV3.mode === 'create' &&
    distinctV3.version === 3,
  'second supersede retains v1 and v2 then creates v3',
);

let immutableReviewRejected = false;
try {
  await saveCandidateReview(
    replacementV2,
    replacementV2.candidateHistory[0],
    {},
    {},
    { pathResolver: () => '/unreachable' },
  );
} catch (error) {
  immutableReviewRejected = error.message.includes('immutable');
}
check(immutableReviewRejected, 'superseded approved review cannot be edited');

const directory = await mkdtemp(resolve(tmpdir(), 'tarot-supersede-'));
try {
  const historical = resolve(directory, 'approved-v1.jpg');
  const stagedSource = resolve(directory, 'staged-source.png');
  const destination = resolve(directory, 'tracked-source.png');
  await Promise.all([
    writeFile(historical, 'immutable approved v1\n'),
    writeFile(stagedSource, 'new source provenance\n'),
  ]);
  let failed = false;
  try {
    await publishCandidateArtifacts([{ source: stagedSource, destination }], async () => {
      throw new Error('simulated manifest failure');
    });
  } catch (error) {
    failed = error.message === 'simulated manifest failure';
  }
  check(
    failed &&
      !existsSync(destination) &&
      (await readFile(historical, 'utf8')) === 'immutable approved v1\n',
    'failed supersede publication rolls back only new artifacts',
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}

const [manifest, referenceSet, sourceMap, canonicalIdentityManifest] = await Promise.all([
  readProductionManifest(),
  readReferenceSet(),
  readSourceNumberMap(),
  readCanonicalIdentityManifest(),
]);
const sourceMapFixture = JSON.parse(JSON.stringify(sourceMap));
setSequenceApprovalState(sourceMapFixture, 'major-empress', false);
const approvalFixture = {
  cards: [approvedCard(), approvedCard({ cardId: 'major-emperor' })],
};
const activeEmpress = approvalFixture.cards[0];
const approvedBefore = approvalFixture.cards.filter((card) =>
  ['approved', 'integrated'].includes(card.productionStatus),
).length;
activeEmpress.productionStatus = 'replacement-required';
activeEmpress.reviewStatus = 'not-reviewed';
const approvedAfter = approvalFixture.cards.filter((card) =>
  ['approved', 'integrated'].includes(card.productionStatus),
).length;
check(
  sourceMapFixture.records[15].approvedState === 'not-approved' &&
    approvedAfter === approvedBefore - 1,
  'superseded historical approval is not an active sequence approval',
);

const referenceFixture = JSON.parse(JSON.stringify(manifest));
const magician = referenceFixture.cards.find((card) => card.cardId === 'major-magician');
const magicianEntry = referenceSet.cards.find((card) => card.cardId === 'major-magician');
magician.candidateHistory = [
  {
    version: magician.version,
    productionStatus: 'superseded',
    reviewStatus: 'approved',
    styleVersion: magician.styleVersion,
    checksum: magician.checksum,
    outputPath: magician.outputPath,
    reviewPath: magician.reviewPath,
  },
];
magician.version += 1;
magician.productionStatus = 'replacement-required';
magician.reviewStatus = 'not-reviewed';
magician.checksum = undefined;
check(
  magicianEntry.role === 'approved-reference' &&
    referenceReadiness(referenceFixture, referenceSet).approved === 15,
  'reference set remains complete while a historical reference approval is superseded',
);

check(
  canonicalIdentityForCard(canonicalIdentityManifest, 'major-empress').canonicalRomanNumeral ===
    'III' &&
    canonicalIdentityForCard(canonicalIdentityManifest, 'major-emperor').canonicalRomanNumeral ===
      'IV' &&
    canonicalIdentityForCard(canonicalIdentityManifest, 'major-hierophant')
      .canonicalRomanNumeral === 'V',
  'production numbers 16–18 retain independent canonical numerals III–V',
);
const runtimeRelease = await readJson(
  resolve('src/assets/tarot/metadata/premium-release-manifest.json'),
);
check(
  manifest.releaseThreshold.approved === 78 &&
    ((manifest.releaseMode === 'classic' &&
      runtimeRelease.mode === 'classic' &&
      runtimeRelease.records.length === 0) ||
      (manifest.releaseMode === 'premium-complete' &&
        runtimeRelease.mode === 'premium-complete' &&
        runtimeRelease.records.length === 78)),
  'runtime remains atomic across classic and 78-card Premium activation',
);

const summary = { assertions: results.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${results.length} supersede regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
