#!/usr/bin/env node

import { existsSync } from 'node:fs';
import process from 'node:process';

import {
  findProductionCard,
  manifestPath,
  parseNamedArguments,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  rubricPath,
  sha256,
  toFrontendPath,
  validateProductionManifest,
  writeJsonAtomic,
} from './lib.mjs';
import {
  CANONICAL_IDENTITY_SCHEMA,
  canonicalIdentityForCard,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import {
  readReferenceSet,
  readSourceNumberMap,
  setSequenceApprovalState,
  stageReferenceApproval,
  writeReferenceSet,
  writeSourceNumberMap,
} from './mass-production.mjs';
import {
  approvalReviewCandidateFailures,
  createApprovedReview,
  validateActiveApprovalProvenance,
} from './approval-provenance.mjs';
import { acquireProductionLock } from './production-lock.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const [cardId, decision] = positional;
if (!cardId || !['approve', 'reject'].includes(decision)) {
  throw new Error(
    'Usage: npm run tarot:premium:review -- <card-id> approve [--review <review.json>] OR reject --category <category> --notes <notes>',
  );
}
const productionLock = await acquireProductionLock(`review ${decision} ${cardId}`);
try {
  const manifest = await readProductionManifest();
  const manifestBefore = JSON.parse(JSON.stringify(manifest));
  const failures = await validateProductionManifest(manifest);
  if (failures.length) throw new Error(failures.join('\n'));
  const card = findProductionCard(manifest, cardId);
  if (card.isGoldenMaster) {
    throw new Error(
      'Use the dedicated Golden Master approval or rejection command for major-fool.',
    );
  }
  if (card.productionStatus !== 'review') {
    throw new Error(`${cardId} must be in review before an approval decision.`);
  }
  if (!card.outputPath || !card.checksum || !existsSync(resolveFrontendPath(card.outputPath))) {
    throw new Error(`${cardId} has no valid processed candidate.`);
  }
  if ((await sha256(resolveFrontendPath(card.outputPath))) !== card.checksum) {
    throw new Error(`${cardId} candidate checksum does not match the production manifest.`);
  }

  const rubric = await readJson(rubricPath);
  let referenceSet;
  let referenceSetBefore;
  let referencePromotion;
  const sourceMap = await readSourceNumberMap();
  const canonicalIdentityManifest = await readCanonicalIdentityManifest();
  const identityFailures = validateCanonicalIdentityManifest(
    canonicalIdentityManifest,
    manifest,
    sourceMap,
  );
  if (identityFailures.length) throw new Error(identityFailures.join('\n'));
  const approvalProvenanceFailures = await validateActiveApprovalProvenance(
    manifest,
    canonicalIdentityManifest,
  );
  if (approvalProvenanceFailures.length) {
    throw new Error(approvalProvenanceFailures.join('\n'));
  }
  const canonicalIdentity = canonicalIdentityForCard(canonicalIdentityManifest, cardId);
  const sourceMapBefore = JSON.parse(JSON.stringify(sourceMap));
  if (decision === 'approve') {
    const reviewArgument = options.get('review') ?? card.reviewPath;
    const reviewPath = resolveFrontendPath(reviewArgument);
    const review = await readJson(reviewPath);
    const approvalFailures = approvalReviewCandidateFailures(
      card,
      review,
      rubric,
      canonicalIdentity,
      toFrontendPath(reviewPath),
    );
    if (approvalFailures.length) {
      throw new Error(
        `Review cannot approve this exact candidate: ${approvalFailures.join(', ')}.`,
      );
    }
    const approvedAt = review.approvedAt ?? new Date().toISOString();
    const approvedReview = createApprovedReview(card, review, approvedAt);
    await writeJsonAtomic(reviewPath, approvedReview);
    Object.assign(card, {
      approvalNotes: approvedReview.notes?.trim() || `Approved by ${approvedReview.reviewer}.`,
      approvedAt,
      approvedBy: approvedReview.reviewer.trim(),
      canonicalIdentityContractVersion: CANONICAL_IDENTITY_SCHEMA,
      canonicalIdentityReviewed: true,
      productionStatus: 'approved',
      rejectionReason: undefined,
      reviewStatus: 'approved',
    });
    referenceSet = await readReferenceSet();
    referenceSetBefore = JSON.parse(JSON.stringify(referenceSet));
    referencePromotion = await stageReferenceApproval(card, approvedReview, referenceSet);
    setSequenceApprovalState(sourceMap, cardId, true);
  } else {
    const category = options.get('category');
    const notes = options.get('notes');
    const regenerationReason = options.get('regeneration-reason') ?? notes;
    if (!rubric.rejectionCategories.includes(category) || !notes?.trim()) {
      throw new Error(
        `Rejection requires --category (${rubric.rejectionCategories.join(', ')}) and non-empty --notes.`,
      );
    }
    Object.assign(card, {
      approvalBinding: undefined,
      approvalNotes: undefined,
      approvedAt: undefined,
      approvedBy: undefined,
      canonicalIdentityContractVersion: undefined,
      canonicalIdentityReviewed: undefined,
      productionStatus: 'rejected',
      reviewArtifactChecksum: undefined,
      rejectionReason: {
        category,
        notes: notes.trim(),
        promptVersion: manifest.promptVersion,
        regenerationReason: regenerationReason.trim(),
      },
      reviewStatus: 'rejected',
    });
    setSequenceApprovalState(sourceMap, cardId, false);
  }

  try {
    if (referencePromotion) await writeReferenceSet(referenceSet);
    await writeSourceNumberMap(sourceMap);
    await writeJsonAtomic(manifestPath, manifest);
  } catch (error) {
    await writeSourceNumberMap(sourceMapBefore);
    await writeJsonAtomic(manifestPath, manifestBefore);
    if (referencePromotion) {
      await referencePromotion.rollback();
      await writeReferenceSet(referenceSetBefore);
    }
    throw error;
  }
  if (referencePromotion) {
    try {
      await referencePromotion.finalize();
    } catch (error) {
      process.stderr.write(
        `Approved reference is canonical; temporary draft cleanup needs attention: ${error.message}\n`,
      );
    }
  }
  process.stdout.write(
    `${cardId} marked ${card.productionStatus}; runtime edition remains unchanged.\n`,
  );
} finally {
  await productionLock.release();
}
