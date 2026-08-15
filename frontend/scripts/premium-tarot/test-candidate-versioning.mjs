#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  appendCurrentCandidateToHistory,
  planCandidateImport,
  publishCandidateArtifacts,
} from './lib.mjs';

const results = [];
function check(condition, name) {
  if (!condition) throw new Error(`Candidate versioning regression failed: ${name}`);
  results.push(name);
}

function candidateCard(overrides = {}) {
  return {
    cardId: 'fixture-card',
    version: 1,
    productionStatus: 'prompt-ready-v2',
    reviewStatus: 'not-reviewed',
    styleVersion: 'premium-tarot-style-v2',
    ...overrides,
  };
}

const first = planCandidateImport(candidateCard(), {
  inputChecksum: 'prepared-a',
  sourceChecksum: 'source-a',
});
check(first.mode === 'create' && first.version === 1, 'first candidate is v1');

const reviewV1 = candidateCard({
  version: 1,
  productionStatus: 'review',
  reviewStatus: 'needs-review',
  checksum: 'candidate-a',
  sourcePath: 'source-v1.png',
  outputPath: 'candidate-v1.jpg',
  reviewPath: 'review-v1.json',
  candidateMetadata: {
    inputChecksum: 'prepared-a',
    preparation: { sourceChecksum: 'source-a', preparedChecksum: 'prepared-a' },
  },
});
const second = planCandidateImport(reviewV1, {
  inputChecksum: 'prepared-b',
  sourceChecksum: 'source-b',
});
check(second.mode === 'create' && second.version === 2, 'review candidate increments to v2');

const rejectedV1 = candidateCard({
  ...reviewV1,
  productionStatus: 'rejected',
  reviewStatus: 'rejected',
});
const afterRejected = planCandidateImport(rejectedV1, {
  inputChecksum: 'prepared-b',
  sourceChecksum: 'source-b',
});
check(
  afterRejected.mode === 'create' && afterRejected.version === 2,
  'rejected candidate increments to v2',
);

const reviewV2 = candidateCard({
  ...reviewV1,
  version: 2,
  sourcePath: 'source-v2.png',
  outputPath: 'candidate-v2.jpg',
  reviewPath: 'review-v2.json',
  candidateHistory: [
    {
      version: 1,
      productionStatus: 'rejected',
      reviewStatus: 'rejected',
      checksum: 'candidate-a',
      sourcePath: 'source-v1.png',
      outputPath: 'candidate-v1.jpg',
      reviewPath: 'review-v1.json',
      candidateMetadata: { inputChecksum: 'prepared-a' },
    },
  ],
  candidateMetadata: { inputChecksum: 'prepared-b' },
});
const third = planCandidateImport(reviewV2, {
  inputChecksum: 'prepared-c',
  sourceChecksum: 'source-c',
});
check(third.mode === 'create' && third.version === 3, 'v1/v2 history increments to v3');

const duplicate = planCandidateImport(reviewV1, {
  inputChecksum: 'prepared-a',
  sourceChecksum: 'source-a',
});
check(
  duplicate.mode === 'reuse' && duplicate.version === 1,
  'same source checksum reuses its existing attempt',
);

const recovered = planCandidateImport(candidateCard(), {
  filesystemAttempts: [{ version: 2, inputChecksum: 'prepared-b' }],
  inputChecksum: 'prepared-b',
  sourceChecksum: 'source-b',
});
check(
  recovered.mode === 'recover' && recovered.version === 2,
  'filesystem recovery retains an interrupted attempt version',
);

const history = appendCurrentCandidateToHistory(reviewV1);
check(
  history.length === 1 &&
    history[0].version === 1 &&
    history[0].reviewPath === 'review-v1.json' &&
    history[0].outputPath === 'candidate-v1.jpg',
  'previous review and candidate paths are retained in history',
);

const directory = await mkdtemp(resolve(tmpdir(), 'tarot-candidate-versioning-'));
try {
  const previous = resolve(directory, 'previous-v1.json');
  const stagedCandidate = resolve(directory, 'staged-v2.jpg');
  const stagedReview = resolve(directory, 'staged-v2.json');
  const candidateDestination = resolve(directory, 'candidate-v2.jpg');
  const reviewDestination = resolve(directory, 'review-v2.json');
  await Promise.all([
    writeFile(previous, 'v1 retained\n'),
    writeFile(stagedCandidate, 'candidate v2\n'),
    writeFile(stagedReview, 'review v2\n'),
  ]);
  let failureMessage = '';
  try {
    await publishCandidateArtifacts(
      [
        { source: stagedCandidate, destination: candidateDestination },
        { source: stagedReview, destination: reviewDestination },
      ],
      async () => {
        throw new Error('simulated manifest failure');
      },
    );
  } catch (error) {
    failureMessage = error.message;
  }
  check(
    failureMessage === 'simulated manifest failure' &&
      !existsSync(candidateDestination) &&
      !existsSync(reviewDestination) &&
      (await readFile(previous, 'utf8')) === 'v1 retained\n',
    'atomic failure removes only new artifacts and preserves v1',
  );

  await writeFile(candidateDestination, 'existing different candidate\n');
  let collisionFailed = false;
  try {
    await publishCandidateArtifacts(
      [{ source: stagedCandidate, destination: candidateDestination }],
      async () => {},
    );
  } catch (error) {
    collisionFailed = error.code === 'EEXIST';
  }
  check(
    collisionFailed &&
      (await readFile(candidateDestination, 'utf8')) === 'existing different candidate\n',
    'existing artifacts are never overwritten',
  );
} finally {
  await rm(directory, { force: true, recursive: true });
}

const summary = { assertions: results.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${results.length} candidate versioning regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
