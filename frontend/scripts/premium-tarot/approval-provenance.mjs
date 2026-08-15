import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { productionRoot, readJson, resolveFrontendPath, rubricPath, sha256 } from './lib.mjs';
import { candidateReviewCompletionFailures } from './review-workflow.mjs';
import { canonicalIdentityForCard } from './canonical-identity.mjs';

export const APPROVAL_PROVENANCE_SCHEMA = 'premium-tarot-approval-provenance-v1';
export const BOUND_REVIEW_SCHEMA = 'premium-tarot-bound-review-v1';
export const approvalProvenancePath = resolve(productionRoot, 'approval-provenance.json');

export async function readApprovalProvenance() {
  return readJson(approvalProvenancePath);
}

function legacyRecordFor(contract, card) {
  return contract.records.find(
    (record) => record.cardId === card.cardId && record.artworkVersion === card.version,
  );
}

export function createReviewBinding(card, review, reviewPath, reviewArtifactChecksum) {
  return {
    contractVersion: BOUND_REVIEW_SCHEMA,
    cardId: card.cardId,
    artworkVersion: card.version,
    candidateChecksum: card.checksum,
    styleVersion: card.styleVersion,
    reviewVersion: review.reviewVersion,
    reviewPath,
    reviewArtifactChecksum,
    reviewer: review.reviewer.trim(),
    decision: 'approved',
  };
}

export function createApprovedReview(card, review, approvedAt) {
  return {
    ...review,
    decision: 'approved',
    approvedAt,
    approvalBinding: {
      contractVersion: BOUND_REVIEW_SCHEMA,
      cardId: card.cardId,
      artworkVersion: card.version,
      candidateChecksum: card.checksum,
      styleVersion: card.styleVersion,
      reviewVersion: review.reviewVersion,
    },
  };
}

export function approvalReviewCandidateFailures(card, review, rubric, identity, reviewPath) {
  const completion = candidateReviewCompletionFailures(review, rubric, {
    identity,
    requireCanonicalIdentity: true,
  });
  const failures = [];
  if (reviewPath !== card.reviewPath) failures.push('reviewPath');
  if (review.cardId !== card.cardId) failures.push('cardId');
  if (review.artworkVersion !== card.version) failures.push('artworkVersion');
  if (review.candidateChecksum !== card.checksum) failures.push('candidateChecksum');
  if (review.styleVersion !== card.styleVersion) failures.push('styleVersion');
  if (review.reviewVersion !== rubric.version) failures.push('reviewVersion');
  if (completion.invalidScores.length) failures.push('scores');
  if (completion.failedPasses.length) failures.push('requiredPasses');
  if (completion.canonicalIdentityFailures.length) failures.push('canonicalIdentity');
  if (completion.reviewerMissing) failures.push('reviewer');
  return failures;
}

function contractShapeFailures(contract) {
  const failures = [];
  const records = Array.isArray(contract.records) ? contract.records : [];
  const identities = records.map((record) => `${record.cardId}:v${record.artworkVersion}`);
  if (
    contract.schemaVersion !== APPROVAL_PROVENANCE_SCHEMA ||
    new Set(identities).size !== identities.length
  ) {
    failures.push('Legacy approval provenance contract is invalid or duplicated.');
  }
  return failures;
}

async function validateOrdinaryApprovedCard(card, review, rubric, identityManifest, contract) {
  const failures = [];
  const identity = canonicalIdentityForCard(identityManifest, card.cardId);
  const binding = card.approvalBinding;
  const legacy = binding ? undefined : legacyRecordFor(contract, card);
  const reviewChecksum = await sha256(resolveFrontendPath(card.reviewPath));
  const requireCanonicalIdentity = binding
    ? true
    : legacy?.canonicalIdentityGrandfathered !== true || Boolean(review.canonicalIdentity);
  const completion = candidateReviewCompletionFailures(review, rubric, {
    identity,
    requireCanonicalIdentity,
  });
  if (
    review.cardId !== card.cardId ||
    review.artworkVersion !== card.version ||
    review.candidateChecksum !== card.checksum ||
    review.styleVersion !== card.styleVersion ||
    review.reviewVersion !== rubric.version ||
    review.reviewer?.trim() !== card.approvedBy?.trim() ||
    completion.invalidScores.length ||
    completion.failedPasses.length ||
    completion.canonicalIdentityFailures.length ||
    completion.reviewerMissing
  ) {
    failures.push(`${card.cardId}: active approved human review is incomplete or mismatched.`);
  }

  if (binding) {
    const expected = createReviewBinding(card, review, card.reviewPath, reviewChecksum);
    if (
      JSON.stringify(binding) !== JSON.stringify(expected) ||
      review.decision !== 'approved' ||
      review.approvalBinding?.contractVersion !== BOUND_REVIEW_SCHEMA ||
      review.approvalBinding?.cardId !== card.cardId ||
      review.approvalBinding?.artworkVersion !== card.version ||
      review.approvalBinding?.candidateChecksum !== card.checksum ||
      review.approvalBinding?.styleVersion !== card.styleVersion ||
      review.approvalBinding?.reviewVersion !== review.reviewVersion
    ) {
      failures.push(`${card.cardId}: exact bound approved review provenance is invalid.`);
    }
  } else if (
    !legacy ||
    legacy.candidateChecksum !== card.checksum ||
    legacy.styleVersion !== card.styleVersion ||
    legacy.reviewPath !== card.reviewPath ||
    legacy.reviewArtifactChecksum !== reviewChecksum ||
    legacy.reviewVersion !== review.reviewVersion ||
    legacy.reviewer !== review.reviewer
  ) {
    failures.push(
      `${card.cardId}: approval is neither strictly bound nor explicitly grandfathered.`,
    );
  }
  return failures;
}

export async function validateActiveApprovalProvenance(
  manifest,
  identityManifest,
  { requireAllApproved = false } = {},
) {
  const failures = [];
  const [contract, rubric] = await Promise.all([readApprovalProvenance(), readJson(rubricPath)]);
  failures.push(...contractShapeFailures(contract));
  const activeApproved = manifest.cards.filter(
    (card) => card.productionStatus === 'approved' || card.productionStatus === 'integrated',
  );
  if (requireAllApproved && activeApproved.length !== 78) {
    failures.push(`Premium release requires 78 active approvals; found ${activeApproved.length}.`);
  }
  for (const card of activeApproved) {
    if (card.isGoldenMaster) continue;
    if (!card.reviewPath || !existsSync(resolveFrontendPath(card.reviewPath))) {
      failures.push(`${card.cardId}: bound approved review artifact is missing.`);
      continue;
    }
    try {
      const review = await readJson(resolveFrontendPath(card.reviewPath));
      failures.push(
        ...(await validateOrdinaryApprovedCard(card, review, rubric, identityManifest, contract)),
      );
    } catch (error) {
      failures.push(`${card.cardId}: approved review provenance is unreadable: ${error.message}`);
    }
  }
  const activeKeys = new Set(
    activeApproved
      .filter((card) => !card.isGoldenMaster)
      .map((card) => `${card.cardId}:v${card.version}`),
  );
  for (const record of contract.records ?? []) {
    const key = `${record.cardId}:v${record.artworkVersion}`;
    const card = manifest.cards.find((candidate) => candidate.cardId === record.cardId);
    const historical = card?.candidateHistory?.find(
      (attempt) =>
        attempt.version === record.artworkVersion &&
        attempt.productionStatus === 'superseded' &&
        attempt.checksum === record.candidateChecksum &&
        attempt.reviewPath === record.reviewPath,
    );
    if (!activeKeys.has(key) && !historical) {
      failures.push(
        `${record.cardId}: legacy approval provenance no longer matches an active approval.`,
      );
    }
  }
  return failures;
}
