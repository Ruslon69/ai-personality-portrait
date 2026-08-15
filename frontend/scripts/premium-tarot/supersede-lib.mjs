import { snapshotCandidateAttempt } from './lib.mjs';

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

export function planApprovedSupersede(
  card,
  {
    approvalTimestamp,
    category,
    notes,
    reviewArtifactChecksum,
    sourceArtifactFormat = 'raw-chunks-v1',
    sourceArtifacts,
    sourceArtifactChecksum,
    supersededAt,
  },
) {
  if (card.isGoldenMaster) {
    throw new Error(
      'The Golden Master cannot use the generic supersede workflow; use its dedicated workflow.',
    );
  }
  if (card.productionStatus !== 'approved' || card.reviewStatus !== 'approved') {
    throw new Error(`${card.cardId} must be actively approved before it can be superseded.`);
  }
  const normalizedCategory = requiredText(category, 'Supersede category');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedCategory)) {
    throw new Error('Supersede category must be a lowercase kebab-case identifier.');
  }
  const normalizedNotes = requiredText(notes, 'Supersede notes');
  const normalizedApprovalTimestamp = requiredText(
    approvalTimestamp,
    'Historical approval timestamp',
  );
  const normalizedSupersededAt = requiredText(supersededAt, 'Supersede timestamp');
  const normalizedSourceChecksum = requiredText(sourceArtifactChecksum, 'Tracked source checksum');
  const normalizedReviewChecksum = requiredText(reviewArtifactChecksum, 'Tracked review checksum');
  if (
    !Array.isArray(sourceArtifacts) ||
    sourceArtifacts.length === 0 ||
    sourceArtifacts.some(
      (artifact, index) =>
        artifact.index !== index + 1 ||
        typeof artifact.path !== 'string' ||
        !artifact.path.trim() ||
        typeof artifact.checksum !== 'string' ||
        !artifact.checksum.trim() ||
        !Number.isInteger(artifact.sizeBytes) ||
        artifact.sizeBytes < 1,
    )
  ) {
    throw new Error('Tracked source artifacts must be a complete ordered chunk set.');
  }
  const current = snapshotCandidateAttempt(card);
  if (
    !current?.checksum ||
    !current.sourcePath ||
    !current.outputPath ||
    !current.reviewPath ||
    !current.approvedBy ||
    !current.approvalNotes
  ) {
    throw new Error(`${card.cardId} approved provenance is incomplete and cannot be superseded.`);
  }
  const history = clone(card.candidateHistory ?? []);
  if (history.some((attempt) => attempt.version === current.version)) {
    throw new Error(`${card.cardId} v${current.version} already exists in candidate history.`);
  }
  history.push({
    ...clone(current),
    approvalTimestamp: normalizedApprovalTimestamp,
    previewPath: undefined,
    productionStatus: 'superseded',
    reviewArtifactChecksum: normalizedReviewChecksum,
    sourceArtifactFormat,
    sourceArtifacts: clone(sourceArtifacts),
    sourcePath:
      sourceArtifactFormat === 'approved-artwork-equivalent-v1' ? current.outputPath : undefined,
    sourceArtifactChecksum: normalizedSourceChecksum,
    supersededAt: normalizedSupersededAt,
    supersedeReason: {
      category: normalizedCategory,
      notes: normalizedNotes,
    },
  });
  history.sort((left, right) => left.version - right.version);
  const nextVersion =
    Math.max(current.version, ...history.map((attempt) => attempt.version), 0) + 1;
  return {
    ...clone(card),
    approvalNotes: undefined,
    approvedAt: undefined,
    approvedBy: undefined,
    canonicalIdentityContractVersion: undefined,
    canonicalIdentityReviewed: undefined,
    candidateHistory: history,
    candidateMetadata: undefined,
    checksum: undefined,
    finalPath: undefined,
    outputPath: `premium-production/candidates/${card.cardId}-v${nextVersion}.jpg`,
    previewPath: undefined,
    productionStatus: 'replacement-required',
    rejectionReason: undefined,
    replacementReason: {
      category: normalizedCategory,
      notes: normalizedNotes,
      supersedesVersion: current.version,
    },
    replacementRequiredAt: normalizedSupersededAt,
    reviewPath: undefined,
    reviewStatus: 'not-reviewed',
    sourcePath: undefined,
    version: nextVersion,
  };
}
