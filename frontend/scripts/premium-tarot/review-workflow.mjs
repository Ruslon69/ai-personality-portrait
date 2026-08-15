import { readJson, resolveFrontendPath, writeJsonAtomic } from './lib.mjs';
import {
  canonicalIdentityReviewFailures,
  canonicalIdentityPassIds,
  createCanonicalIdentityReview,
} from './canonical-identity.mjs';

export function findCandidateReviewAttempt(card, version) {
  const current =
    card.version === version && card.reviewPath
      ? {
          version: card.version,
          productionStatus: card.productionStatus,
          reviewStatus: card.reviewStatus,
          styleVersion: card.styleVersion,
          checksum: card.checksum,
          sourcePath: card.sourcePath,
          outputPath: card.outputPath,
          previewPath: card.previewPath,
          reviewPath: card.reviewPath,
          candidateMetadata: card.candidateMetadata,
        }
      : undefined;
  return current ?? (card.candidateHistory ?? []).find((attempt) => attempt.version === version);
}

function hasExactKeys(record, keys) {
  return (
    record &&
    typeof record === 'object' &&
    !Array.isArray(record) &&
    JSON.stringify(Object.keys(record).sort()) === JSON.stringify([...keys].sort())
  );
}

export function sanitizeCandidateReviewUpdate(existing, update, rubric, attempt, identity) {
  if (
    update?.cardId !== existing.cardId ||
    update?.artworkVersion !== attempt.version ||
    update?.candidateChecksum !== attempt.checksum ||
    update?.reviewVersion !== rubric.version ||
    update?.styleVersion !== attempt.styleVersion
  ) {
    throw new Error('Review identity does not match this exact candidate attempt.');
  }
  if (
    typeof update.reviewer !== 'string' ||
    update.reviewer.length > 200 ||
    typeof update.notes !== 'string' ||
    update.notes.length > 20_000
  ) {
    throw new Error('Reviewer or notes are invalid.');
  }
  if (!hasExactKeys(update.scores, rubric.scoreCategories)) {
    throw new Error('Review scores must contain every rubric category exactly once.');
  }
  for (const score of Object.values(update.scores)) {
    if (
      score !== null &&
      (!Number.isInteger(score) || score < rubric.scale.minimum || score > rubric.scale.maximum)
    ) {
      throw new Error('Review scores must be null or within the rubric scale.');
    }
  }
  if (!hasExactKeys(update.requiredPasses, rubric.requiredPasses)) {
    throw new Error('Review passes must contain every required approval check exactly once.');
  }
  if (Object.values(update.requiredPasses).some((value) => typeof value !== 'boolean')) {
    throw new Error('Every required approval check must be boolean.');
  }
  let canonicalIdentity = existing.canonicalIdentity;
  if (identity) {
    const canonicalFailures = canonicalIdentityReviewFailures(update, identity);
    if (!canonicalFailures.metadataMatches || !canonicalFailures.validShape) {
      throw new Error(
        'Canonical identity review metadata does not match the locked card identity.',
      );
    }
    const expected = createCanonicalIdentityReview(identity);
    canonicalIdentity = {
      ...expected,
      checks: Object.fromEntries(
        canonicalIdentityPassIds.map((passId) => [passId, update.canonicalIdentity.checks[passId]]),
      ),
    };
  }
  return {
    ...existing,
    ...(canonicalIdentity ? { canonicalIdentity } : {}),
    reviewer: update.reviewer.trim(),
    notes: update.notes.trim(),
    scores: Object.fromEntries(rubric.scoreCategories.map((key) => [key, update.scores[key]])),
    requiredPasses: Object.fromEntries(
      rubric.requiredPasses.map((key) => [key, update.requiredPasses[key]]),
    ),
  };
}

export function candidateReviewCompletionFailures(
  review,
  rubric,
  { identity, requireCanonicalIdentity = false } = {},
) {
  const invalidScores = rubric.scoreCategories.filter(
    (category) =>
      !Number.isInteger(review.scores?.[category]) ||
      review.scores[category] < rubric.scale.approvalMinimumPerCategory ||
      review.scores[category] > rubric.scale.maximum,
  );
  const failedPasses = rubric.requiredPasses.filter(
    (requirement) => review.requiredPasses?.[requirement] !== true,
  );
  const canonicalFailures = identity
    ? canonicalIdentityReviewFailures(review, identity)
    : { metadataMatches: !requireCanonicalIdentity, missingPasses: [], validShape: true };
  return {
    canonicalIdentityFailures: !requireCanonicalIdentity
      ? []
      : !canonicalFailures.metadataMatches || !canonicalFailures.validShape
        ? [...canonicalIdentityPassIds]
        : canonicalFailures.missingPasses,
    invalidScores,
    failedPasses,
    reviewerMissing: !review.reviewer?.trim(),
  };
}

export async function saveCandidateReview(
  card,
  attempt,
  update,
  rubric,
  { identity, pathResolver = resolveFrontendPath } = {},
) {
  if (card.isGoldenMaster) throw new Error('The Golden Master review workflow is separate.');
  if (!attempt?.reviewPath) throw new Error('Candidate attempt has no review record.');
  if (['approved', 'integrated', 'superseded'].includes(attempt.productionStatus)) {
    throw new Error('Approved and superseded review provenance is immutable.');
  }
  const reviewPath = pathResolver(attempt.reviewPath);
  const existing = await readJson(reviewPath);
  const review = sanitizeCandidateReviewUpdate(existing, update, rubric, attempt, identity);
  await writeJsonAtomic(reviewPath, review);
  return review;
}
