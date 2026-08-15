#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';

import { generatedRoot, readJson, rubricPath } from './lib.mjs';
import { canonicalIdentityPassIds, createCanonicalIdentityReview } from './canonical-identity.mjs';
import {
  candidateReviewCompletionFailures,
  findCandidateReviewAttempt,
  saveCandidateReview,
} from './review-workflow.mjs';

const results = [];
function check(condition, name) {
  if (!condition) throw new Error(`Review workflow regression failed: ${name}`);
  results.push(name);
}

const rubric = await readJson(rubricPath);
const fixtureIdentity = {
  cardId: 'fixture-card',
  canonicalName: 'The Fixture',
  productionSequenceNumber: 18,
  externalSourceFilename: '18.png',
  arcana: 'major',
  canonicalMajorNumber: 5,
  canonicalRomanNumeral: 'V',
  suit: null,
  rank: null,
  canonicalDisplayRank: null,
  canonicalDisplayTitle: 'THE FIXTURE',
};
function emptyReview(version, checksum) {
  return {
    reviewVersion: rubric.version,
    cardId: 'fixture-card',
    artworkVersion: version,
    candidateChecksum: checksum,
    styleVersion: 'premium-tarot-style-v2',
    reviewer: '',
    notes: '',
    canonicalIdentity: createCanonicalIdentityReview(fixtureIdentity),
    scores: Object.fromEntries(rubric.scoreCategories.map((category) => [category, null])),
    requiredPasses: Object.fromEntries(rubric.requiredPasses.map((pass) => [pass, false])),
  };
}

const directory = await mkdtemp(resolve(tmpdir(), 'tarot-review-workflow-'));
try {
  const reviewV1Path = resolve(directory, 'fixture-v1.json');
  const reviewV2Path = resolve(directory, 'fixture-v2.json');
  const v1 = emptyReview(1, 'checksum-v1');
  const v2 = emptyReview(2, 'checksum-v2');
  await Promise.all([
    writeFile(reviewV1Path, `${JSON.stringify(v1, null, 2)}\n`),
    writeFile(reviewV2Path, `${JSON.stringify(v2, null, 2)}\n`),
  ]);
  const card = {
    cardId: 'fixture-card',
    isGoldenMaster: false,
    version: 2,
    productionStatus: 'review',
    reviewStatus: 'needs-review',
    styleVersion: 'premium-tarot-style-v2',
    checksum: 'checksum-v2',
    reviewPath: 'v2',
    candidateHistory: [
      {
        version: 1,
        productionStatus: 'review',
        reviewStatus: 'needs-review',
        styleVersion: 'premium-tarot-style-v2',
        checksum: 'checksum-v1',
        reviewPath: 'v1',
      },
    ],
  };
  const pathResolver = (path) => ({ v1: reviewV1Path, v2: reviewV2Path })[path];
  const attemptV1 = findCandidateReviewAttempt(card, 1);
  const attemptV2 = findCandidateReviewAttempt(card, 2);
  check(attemptV1.reviewPath === 'v1' && attemptV2.reviewPath === 'v2', 'version routes are exact');

  const completedV1 = {
    ...v1,
    reviewer: 'Reviewer One',
    notes: 'Candidate v1 assessment.',
    scores: Object.fromEntries(rubric.scoreCategories.map((category) => [category, 4])),
    requiredPasses: Object.fromEntries(rubric.requiredPasses.map((pass) => [pass, true])),
    canonicalIdentity: {
      ...v1.canonicalIdentity,
      checks: Object.fromEntries(canonicalIdentityPassIds.map((pass) => [pass, true])),
    },
  };
  await saveCandidateReview(card, attemptV1, completedV1, rubric, {
    identity: fixtureIdentity,
    pathResolver,
  });
  const [savedV1, untouchedV2] = await Promise.all([
    readJson(reviewV1Path),
    readJson(reviewV2Path),
  ]);
  check(
    savedV1.reviewer === 'Reviewer One' &&
      savedV1.notes === 'Candidate v1 assessment.' &&
      Object.values(savedV1.scores).every((score) => score === 4) &&
      Object.values(savedV1.requiredPasses).every(Boolean) &&
      Object.values(savedV1.canonicalIdentity.checks).every(Boolean),
    'page fields persist to the selected review JSON',
  );
  check(JSON.stringify(untouchedV2) === JSON.stringify(v2), 'saving v1 leaves v2 unchanged');

  const completedV2 = {
    ...v2,
    reviewer: 'Reviewer Two',
    notes: 'Candidate v2 assessment.',
    scores: Object.fromEntries(rubric.scoreCategories.map((category) => [category, 5])),
    requiredPasses: Object.fromEntries(rubric.requiredPasses.map((pass) => [pass, true])),
    canonicalIdentity: {
      ...v2.canonicalIdentity,
      checks: Object.fromEntries(canonicalIdentityPassIds.map((pass) => [pass, true])),
    },
  };
  await saveCandidateReview(card, attemptV2, completedV2, rubric, {
    identity: fixtureIdentity,
    pathResolver,
  });
  check((await readJson(reviewV2Path)).reviewer === 'Reviewer Two', 'v2 saves to its own review');

  const completion = candidateReviewCompletionFailures(await readJson(reviewV2Path), rubric, {
    identity: fixtureIdentity,
    requireCanonicalIdentity: true,
  });
  check(
    !completion.invalidScores.length &&
      !completion.failedPasses.length &&
      !completion.canonicalIdentityFailures.length &&
      !completion.reviewerMissing,
    'studio-completed review is immediately approval-ready',
  );

  let identityRejected = false;
  try {
    await saveCandidateReview(card, attemptV2, { ...completedV2, artworkVersion: 1 }, rubric, {
      identity: fixtureIdentity,
      pathResolver,
    });
  } catch (error) {
    identityRejected = error.message.includes('exact candidate attempt');
  }
  check(identityRejected, 'cross-version review writes are rejected');
} finally {
  await rm(directory, { force: true, recursive: true });
}

const generation = JSON.parse(
  execFileSync(
    process.execPath,
    [resolve(import.meta.dirname, 'candidate-review.mjs'), 'major-magician', '--json'],
    { encoding: 'utf8' },
  ).trim(),
);
const generatedPage = resolve(generatedRoot, 'candidate-reviews', 'major-magician-v1.html');
check(
  generation.pages.includes(generatedPage) && existsSync(generatedPage),
  'candidate import workflow generates a versioned HTML page',
);
const page = await readFile(generatedPage, 'utf8');
check(
  page.includes('/api/review/major-magician/v1') &&
    page.includes('attemptSelect') &&
    page.includes("method: 'POST'") &&
    page.includes('Canonical identity') &&
    page.includes('canonicalTitleCorrect'),
  'generated page loads, switches, and saves its exact attempt',
);

const summary = { assertions: results.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${results.length} review workflow regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
