#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { hostname } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  isDurableProductionArtifactPath,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  rubricPath,
  validateProductionManifest,
  writeJsonAtomic,
} from './lib.mjs';
import {
  approvalReviewCandidateFailures,
  createApprovedReview,
  createReviewBinding,
  validateActiveApprovalProvenance,
} from './approval-provenance.mjs';
import {
  canonicalIdentityForCard,
  readCanonicalIdentityManifest,
  validateCanonicalApprovalProvenance,
} from './canonical-identity.mjs';
import { acquireProductionLock } from './production-lock.mjs';
import { validatePremiumReleaseRecords } from './release-integrity.mjs';
import {
  RELEASE_TRANSACTION_SCHEMA,
  executeReleaseTransaction,
  recoverReleaseTransaction,
} from './release-transaction.mjs';

const passed = [];
function check(condition, name) {
  if (!condition) throw new Error(`Production integrity regression failed: ${name}`);
  passed.push(name);
}

const [manifest, identityManifest, rubric] = await Promise.all([
  readProductionManifest(),
  readCanonicalIdentityManifest(),
  readJson(rubricPath),
]);
check((await validateProductionManifest(manifest)).length === 0, 'production state validates');
check(
  manifest.cards.every((card) =>
    (card.candidateHistory ?? []).every(
      (attempt) =>
        isDurableProductionArtifactPath(attempt.outputPath) &&
        isDurableProductionArtifactPath(attempt.reviewPath) &&
        existsSync(resolveFrontendPath(attempt.outputPath)) &&
        existsSync(resolveFrontendPath(attempt.reviewPath)),
    ),
  ),
  'retained history uses durable existing artifacts',
);
check(
  manifest.cards
    .filter((card) => ['approved', 'integrated'].includes(card.productionStatus))
    .every(
      (card) =>
        card.sourcePath === card.outputPath &&
        isDurableProductionArtifactPath(card.sourcePath) &&
        existsSync(resolveFrontendPath(card.sourcePath)),
    ),
  'approved source provenance survives a clean checkout',
);
check(
  (await validateActiveApprovalProvenance(manifest, identityManifest)).length === 0,
  'active approval provenance is fully bound or explicitly grandfathered',
);

const reviewStateManifest = JSON.parse(JSON.stringify(manifest));
const reviewStateCard = reviewStateManifest.cards.find((card) => card.cardId === 'major-judgement');
Object.assign(reviewStateCard, {
  productionStatus: 'review',
  reviewStatus: 'needs-review',
  checksum: 'a'.repeat(64),
  outputPath: 'premium-production/history/review-fixture.jpg',
  reviewPath: 'premium-production/history/review-fixture.review.json',
  sourcePath: 'premium-production/history/review-fixture.jpg',
  candidateMetadata: { inputChecksum: 'b'.repeat(64) },
  canonicalIdentityContractVersion: undefined,
  canonicalIdentityReviewed: undefined,
});
check(
  (await validateProductionManifest(reviewStateManifest, { checkFiles: false })).length === 0 &&
    (await validateCanonicalApprovalProvenance(reviewStateManifest, identityManifest)).length === 0,
  'legitimate review state does not require approved canonical provenance',
);

const approvedCard = manifest.cards.find((card) => card.cardId === 'major-devil');
const approvedReview = await readJson(resolveFrontendPath(approvedCard.reviewPath));
const identity = canonicalIdentityForCard(identityManifest, approvedCard.cardId);
check(
  approvalReviewCandidateFailures(
    approvedCard,
    approvedReview,
    rubric,
    identity,
    'premium-production/reviews/another-version.json',
  ).includes('reviewPath'),
  'mismatched custom review path cannot approve a candidate',
);
check(
  approvalReviewCandidateFailures(
    approvedCard,
    { ...approvedReview, candidateChecksum: 'f'.repeat(64) },
    rubric,
    identity,
    approvedCard.reviewPath,
  ).includes('candidateChecksum'),
  'wrong review checksum cannot approve a candidate',
);
check(
  approvalReviewCandidateFailures(
    approvedCard,
    { ...approvedReview, artworkVersion: approvedCard.version + 1, styleVersion: 'wrong-style' },
    rubric,
    identity,
    approvedCard.reviewPath,
  ).every((failure) => ['artworkVersion', 'styleVersion'].includes(failure)),
  'wrong artwork version or style cannot approve a candidate',
);
check(
  approvalReviewCandidateFailures(
    approvedCard,
    {
      ...approvedReview,
      scores: { ...approvedReview.scores, composition: 3 },
      requiredPasses: {
        ...approvedReview.requiredPasses,
        canonicalIdentityObvious: false,
      },
    },
    rubric,
    identity,
    approvedCard.reviewPath,
  ).some((failure) => ['scores', 'requiredPasses'].includes(failure)),
  'incomplete rubric or pass provenance cannot approve a candidate',
);
const strictReview = createApprovedReview(approvedCard, approvedReview, '2026-08-15T00:00:00.000Z');
const strictBinding = createReviewBinding(
  approvedCard,
  strictReview,
  approvedCard.reviewPath,
  'c'.repeat(64),
);
check(
  strictReview.decision === 'approved' &&
    strictReview.approvalBinding.candidateChecksum === approvedCard.checksum &&
    strictBinding.reviewArtifactChecksum === 'c'.repeat(64) &&
    strictBinding.reviewPath === approvedCard.reviewPath,
  'approval binds the exact persisted review artifact to one candidate',
);

const canonicalIds = identityManifest.records.map((record) => record.cardId);
const validReleaseRecords = canonicalIds.map((cardId) => ({
  artworkVersion: 'premium-tarot-art-v1',
  assetPath: `../cards/premium-rws-remastered/${cardId}.jpg`,
  cardId,
  checksum: 'a'.repeat(64),
}));
check(
  validatePremiumReleaseRecords(validReleaseRecords, canonicalIds).length === 0 &&
    validatePremiumReleaseRecords(validReleaseRecords.slice(0, 77), canonicalIds).some((failure) =>
      failure.includes('78 records'),
    ) &&
    validatePremiumReleaseRecords(
      [...validReleaseRecords.slice(0, 77), validReleaseRecords[0]],
      canonicalIds,
    ).some((failure) => failure.includes('duplicate')),
  'runtime release requires 78 unique canonical IDs',
);

const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'premium-integrity-'));
try {
  const productionPath = resolve(temporaryRoot, 'production.json');
  const runtimePath = resolve(temporaryRoot, 'runtime.json');
  const journalPath = resolve(temporaryRoot, 'journal.json');
  const stagingRoot = resolve(temporaryRoot, 'staging');
  const finalRoot = resolve(temporaryRoot, 'final');
  const originalProduction = { releaseMode: 'classic' };
  const originalRuntime = { mode: 'classic', records: [] };
  const targetProduction = { releaseMode: 'premium-complete' };
  const targetRuntime = { mode: 'premium-complete', records: validReleaseRecords };
  await Promise.all([
    writeJsonAtomic(productionPath, originalProduction),
    writeJsonAtomic(runtimePath, originalRuntime),
  ]);
  let interrupted = false;
  try {
    await executeReleaseTransaction({
      finalRoot,
      journalPath,
      originalProductionManifest: originalProduction,
      originalRuntimeManifest: originalRuntime,
      productionManifestPath: productionPath,
      runtimeManifestPath: runtimePath,
      stagingRoot,
      targetProductionManifest: targetProduction,
      targetRuntimeManifest: targetRuntime,
      async stageArtwork(path) {
        await writeFile(resolve(path, 'card.jpg'), 'candidate');
      },
      async validateStaged() {},
      async failpoint(point) {
        if (point === 'after-production-published') throw new Error('simulated interruption');
      },
    });
  } catch {
    interrupted = true;
  }
  check(
    interrupted &&
      JSON.stringify(await readJson(productionPath)) === JSON.stringify(originalProduction) &&
      JSON.stringify(await readJson(runtimePath)) === JSON.stringify(originalRuntime) &&
      !existsSync(finalRoot) &&
      !existsSync(journalPath),
    'release failure before activation rolls back to classic',
  );
  await executeReleaseTransaction({
    finalRoot,
    journalPath,
    originalProductionManifest: originalProduction,
    originalRuntimeManifest: originalRuntime,
    productionManifestPath: productionPath,
    runtimeManifestPath: runtimePath,
    stagingRoot,
    targetProductionManifest: targetProduction,
    targetRuntimeManifest: targetRuntime,
    async stageArtwork(path) {
      await writeFile(resolve(path, 'card.jpg'), 'candidate');
    },
    async validateStaged() {},
  });
  check(
    JSON.stringify(await readJson(productionPath)) === JSON.stringify(targetProduction) &&
      JSON.stringify(await readJson(runtimePath)) === JSON.stringify(targetRuntime) &&
      existsSync(finalRoot) &&
      !existsSync(journalPath),
    'interrupted release retries deterministically',
  );

  await rm(finalRoot, { force: true, recursive: true });
  await writeJsonAtomic(productionPath, targetProduction);
  await writeJsonAtomic(runtimePath, originalRuntime);
  await mkdir(finalRoot);
  await writeJsonAtomic(journalPath, {
    schemaVersion: RELEASE_TRANSACTION_SCHEMA,
    state: 'production-published',
    originalProductionManifest: originalProduction,
    originalRuntimeManifest: originalRuntime,
    targetProductionManifest: targetProduction,
    targetRuntimeManifest: targetRuntime,
  });
  const recovered = await recoverReleaseTransaction({
    finalRoot,
    journalPath,
    productionManifestPath: productionPath,
    runtimeManifestPath: runtimePath,
    stagingRoot,
  });
  check(
    recovered.result === 'rolled-back' &&
      JSON.stringify(await readJson(productionPath)) === JSON.stringify(originalProduction) &&
      !existsSync(finalRoot),
    'hard-interruption journal recovers without partial activation',
  );

  const lockPath = resolve(temporaryRoot, 'lock');
  const firstLock = await acquireProductionLock('fixture writer one', { lockPath });
  let secondRejected = false;
  try {
    await acquireProductionLock('fixture writer two', { lockPath });
  } catch (error) {
    secondRejected = error.message.includes('locked by fixture writer one');
  }
  await firstLock.release();
  const retryLock = await acquireProductionLock('fixture retry', { lockPath });
  await retryLock.release();
  check(secondRejected, 'concurrent writer is rejected and retry succeeds after release');

  await mkdir(lockPath);
  await writeFile(
    resolve(lockPath, 'owner.json'),
    `${JSON.stringify({
      schemaVersion: 'premium-tarot-production-lock-v1',
      token: 'abandoned-fixture',
      operation: 'abandoned writer',
      pid: 999_999_999,
      hostname: hostname(),
      createdAt: new Date().toISOString(),
    })}\n`,
  );
  const recoveredLock = await acquireProductionLock('fixture stale recovery', { lockPath });
  await recoveredLock.release();
  check(!existsSync(lockPath), 'abandoned local lock is recovered safely');
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}

const ci = await readFile(
  resolve(import.meta.dirname, '..', '..', '..', '.github/workflows/ci.yml'),
  'utf8',
);
const releaseCheck = await readFile(
  resolve(import.meta.dirname, '..', '..', '..', '.github/workflows/release-check.yml'),
  'utf8',
);
check(
  ci.includes('npm run tarot:premium:validate') &&
    releaseCheck.includes('npm run tarot:premium:validate'),
  'CI and Release Check invoke complete premium validation',
);

const summary = { assertions: passed.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${passed.length} production integrity regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
