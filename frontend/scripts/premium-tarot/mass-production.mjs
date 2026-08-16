import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { basename, isAbsolute, resolve } from 'node:path';

import {
  frontendRoot,
  productionRoot,
  readJson,
  resolveFrontendPath,
  sha256,
  toFrontendPath,
  writeJsonAtomic,
} from './lib.mjs';
import { BOUND_REVIEW_SCHEMA, createReviewBinding } from './approval-provenance.mjs';

export const referenceSetRoot = resolve(productionRoot, 'reference-set');
export const referenceSetPath = resolve(referenceSetRoot, 'manifest.json');
export const referenceCoveragePath = resolve(referenceSetRoot, 'coverage-matrix.json');
export const referenceStylePath = resolve(referenceSetRoot, 'style-consistency.json');
export const referenceApprovedRoot = resolve(referenceSetRoot, 'approved');
export const productionApprovedRoot = resolve(productionRoot, 'approved');
export const sourceNumberMapPath = resolve(productionRoot, 'source-number-map.json');
export const LOCKED_SEQUENCE_SCHEMA = 'premium-tarot-locked-production-sequence-v1';
export const DECLARED_REFERENCE_CARD_IDS = [
  'major-fool',
  'major-magician',
  'major-high-priestess',
  'major-death',
  'major-tower',
  'major-star',
  'swords-three',
  'cups-ace',
  'major-sun',
  'major-moon',
  'major-world',
  'major-lovers',
  'major-strength',
  'major-hermit',
  'major-wheel',
];
export const LOCKED_PRODUCTION_CARD_IDS = [
  ...DECLARED_REFERENCE_CARD_IDS,
  'major-empress',
  'major-emperor',
  'major-hierophant',
  'major-chariot',
  'major-justice',
  'major-hanged-man',
  'major-temperance',
  'major-devil',
  'major-judgement',
  'wands-ace',
  'wands-two',
  'wands-three',
  'wands-four',
  'wands-five',
  'wands-six',
  'wands-seven',
  'wands-eight',
  'wands-nine',
  'wands-ten',
  'wands-page',
  'wands-knight',
  'wands-queen',
  'wands-king',
  'cups-two',
  'cups-three',
  'cups-four',
  'cups-five',
  'cups-six',
  'cups-seven',
  'cups-eight',
  'cups-nine',
  'cups-ten',
  'cups-page',
  'cups-knight',
  'cups-queen',
  'cups-king',
  'swords-ace',
  'swords-two',
  'swords-four',
  'swords-five',
  'swords-six',
  'swords-seven',
  'swords-eight',
  'swords-nine',
  'swords-ten',
  'swords-page',
  'swords-knight',
  'swords-queen',
  'swords-king',
  'pentacles-ace',
  'pentacles-two',
  'pentacles-three',
  'pentacles-four',
  'pentacles-five',
  'pentacles-six',
  'pentacles-seven',
  'pentacles-eight',
  'pentacles-nine',
  'pentacles-ten',
  'pentacles-page',
  'pentacles-knight',
  'pentacles-queen',
  'pentacles-king',
];

export async function readReferenceSet() {
  return readJson(referenceSetPath);
}

export async function readReferenceCoverage() {
  return readJson(referenceCoveragePath);
}

export async function readSourceNumberMap() {
  return readJson(sourceNumberMapPath);
}

export async function markSourceProcessed(sourceMap, sourceNumber) {
  if (setSourceProcessed(sourceMap, sourceNumber)) {
    await writeJsonAtomic(sourceNumberMapPath, sourceMap);
  }
}

export function lockedSequenceRecord(sourceMap, sourceNumber) {
  if (!Number.isInteger(sourceNumber) || sourceNumber < 1 || sourceNumber > 78) {
    throw new Error(`Production number ${sourceNumber} is outside the locked 1–78 sequence.`);
  }
  const record = sourceMap.records.find((item) => item.sequenceNumber === sourceNumber);
  if (!record) throw new Error(`Locked production sequence is missing number ${sourceNumber}.`);
  return record;
}

export function setSourceProcessed(sourceMap, sourceNumber) {
  const assignment = lockedSequenceRecord(sourceMap, sourceNumber);
  if (assignment.sourceState === 'processed') return false;
  assignment.sourceState = 'processed';
  return true;
}

export function setSequenceApprovalState(sourceMap, cardId, approved) {
  const record = sourceMap.records.find((item) => item.cardId === cardId);
  if (!record) throw new Error(`Locked production sequence is missing ${cardId}.`);
  record.approvedState = approved ? 'approved' : 'not-approved';
  record.promptReadiness = approved
    ? record.referenceRole === 'production-card'
      ? 'approved-candidate'
      : 'approved-reference'
    : 'style-contract-ready';
}

export function applyLockedProductionStyle(card, sourceMap) {
  const record = sourceMap.records.find((item) => item.cardId === card.cardId);
  if (!record || record.sequenceNumber < 16) return;
  if (['approved', 'integrated'].includes(card.productionStatus)) return;
  card.styleVersion = 'premium-tarot-style-v2';
  card.promptId = `premium-tarot-full-production-v2:${card.cardId}`;
  card.productionStyleLineage = {
    styleVersion: sourceMap.styleContract.styleVersion,
    goldenMasterCardId: sourceMap.styleContract.goldenMasterCardId,
    approvedReferenceCount: sourceMap.styleContract.approvedReferenceCount,
    referenceSetStatus: sourceMap.styleContract.referenceSetStatus,
    visualLanguageBible: sourceMap.styleContract.visualLanguageBible,
  };
}

export async function writeSourceNumberMap(sourceMap) {
  await writeJsonAtomic(sourceNumberMapPath, sourceMap);
}

export function referenceEntry(referenceSet, cardId) {
  return referenceSet.cards.find((card) => card.cardId === cardId);
}

export function nextRequiredAction(card, reference) {
  if (card.productionStatus === 'integrated') return 'release-verified';
  if (card.productionStatus === 'approved')
    return reference ? 'reference-complete' : 'await-full-deck-release';
  if (card.productionStatus === 'replacement-required') return 'provide-replacement-source';
  if (card.productionStatus === 'review') return 'complete-human-review';
  if (card.productionStatus === 'rejected') return 'regenerate-from-review-notes';
  if (['generated', 'processing'].includes(card.productionStatus)) return 'finish-processing';
  if (reference?.role === 'reference-target') return 'generate-reference-candidate';
  if (card.productionStatus.startsWith('prompt-ready')) return 'generate-candidate';
  return 'prepare-card-specific-prompt';
}

export function buildProductionQueue(manifest, referenceSet, sourceMap) {
  const references = new Map(referenceSet.cards.map((card) => [card.cardId, card]));
  const production = new Map(manifest.cards.map((card) => [card.cardId, card]));
  return sourceMap.records.map((record) => {
    const card = production.get(record.cardId);
    const reference = references.get(card.cardId);
    return {
      sequenceNumber: record.sequenceNumber,
      cardId: card.cardId,
      canonicalName: card.canonicalName,
      arcana: card.arcana,
      suit: card.suit ?? null,
      productionState: card.productionStatus,
      reviewState: card.reviewStatus,
      artworkVersion: card.version,
      role: reference?.role ?? 'production-card',
      sourceFilename: record.sourceFilename,
      sourceState: record.sourceState,
      nextRequiredAction: nextRequiredAction(card, reference),
    };
  });
}

export function nextProductionCard(queue) {
  return queue.find(
    (item) =>
      item.sequenceNumber >= 16 && !['approved', 'integrated'].includes(item.productionState),
  );
}

export function isActiveApprovedCard(card) {
  return (
    Boolean(card) &&
    ['approved', 'integrated'].includes(card.productionStatus) &&
    card.reviewStatus === 'approved'
  );
}

export function referenceReadiness(manifest, referenceSet) {
  const production = new Map(manifest.cards.map((card) => [card.cardId, card]));
  const approved = referenceSet.cards.filter((entry) => {
    const card = production.get(entry.cardId);
    return Boolean(approvedReferenceAttempt(card, entry));
  }).length;
  return {
    approved,
    total: referenceSet.targetCount,
    complete: approved === referenceSet.targetCount,
  };
}

export function approvedReferenceAttempt(card, entry) {
  if (!card || !entry || entry.approvedArtworkVersion === null || !entry.checksum) return undefined;
  const active = isActiveApprovedCard(card) ? card : undefined;
  const historical = (card.candidateHistory ?? []).filter(
    (attempt) => attempt.productionStatus === 'superseded' && attempt.reviewStatus === 'approved',
  );
  return [active, ...historical].find(
    (attempt) =>
      attempt?.version === entry.approvedArtworkVersion &&
      attempt.checksum === entry.checksum &&
      attempt.styleVersion === entry.styleVersion &&
      attempt.outputPath === entry.approvedArtworkPath &&
      attempt.reviewPath === entry.approvedReviewPath,
  );
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export async function validateReferenceProduction(
  manifest,
  referenceSet,
  coverage,
  sourceMap,
  { checkFiles = true } = {},
) {
  const failures = [];
  const canonicalIds = new Set(manifest.cards.map((card) => card.cardId));
  const referenceIds = referenceSet.cards.map((card) => card.cardId);
  if (
    referenceSet.schemaVersion !== 'premium-tarot-reference-set-v1' ||
    referenceSet.targetCount !== 15 ||
    referenceSet.cards.length !== 15 ||
    duplicates(referenceIds).length ||
    referenceIds.some((cardId) => !canonicalIds.has(cardId))
  ) {
    failures.push('Reference set must contain 15 unique canonical Tarot IDs.');
  }
  if (JSON.stringify(referenceIds) !== JSON.stringify(DECLARED_REFERENCE_CARD_IDS)) {
    failures.push('Reference set membership or order differs from the declared 15-card set.');
  }
  const golden = referenceSet.cards.filter((card) => card.role === 'golden-master');
  if (
    golden.length !== 1 ||
    golden[0]?.cardId !== 'major-fool' ||
    referenceSet.goldenMasterCardId !== 'major-fool'
  ) {
    failures.push('The Fool must remain the sole Golden Master in the reference set.');
  }
  if (
    referenceSet.cards.some(
      (card) => !['golden-master', 'approved-reference', 'reference-target'].includes(card.role),
    )
  ) {
    failures.push('Reference set contains an unknown production role.');
  }
  for (const entry of referenceSet.cards) {
    const card = manifest.cards.find((candidate) => candidate.cardId === entry.cardId);
    const requiredProfile = [
      entry.category,
      entry.dominantPalette,
      entry.lightingProfile,
      entry.compositionType,
      entry.environmentType,
      entry.symbolismComplexity,
    ];
    if (
      !['premium-tarot-style-v1', 'premium-tarot-style-v2'].includes(entry.styleVersion) ||
      requiredProfile.some((value) => typeof value !== 'string' || !value.trim()) ||
      !Array.isArray(entry.visualCharacteristics) ||
      !entry.visualCharacteristics.length ||
      !Number.isInteger(entry.humanFigures?.count) ||
      !Array.isArray(entry.humanFigures?.types)
    ) {
      failures.push(`${entry.cardId}: reference visual profile is incomplete.`);
    }
    if (entry.role === 'reference-target') {
      const allowedTargetStates = new Map([
        ['prompt-ready-v2', 'not-reviewed'],
        ['generated', 'not-reviewed'],
        ['processing', 'not-reviewed'],
        ['review', 'needs-review'],
        ['rejected', 'rejected'],
      ]);
      if (
        entry.approvedArtworkVersion !== null ||
        entry.checksum !== null ||
        entry.approvedArtworkPath !== null ||
        entry.approvedReviewPath !== null ||
        allowedTargetStates.get(card.productionStatus) !== card.reviewStatus ||
        card.styleVersion !== entry.styleVersion
      ) {
        failures.push(`${entry.cardId}: planned reference target fakes production approval.`);
      }
      continue;
    }
    if (!approvedReferenceAttempt(card, entry)) {
      failures.push(`${entry.cardId}: approved reference metadata differs from production state.`);
      continue;
    }
    if (checkFiles) {
      const artworkPath = resolveFrontendPath(entry.approvedArtworkPath);
      const reviewPath = resolveFrontendPath(entry.approvedReviewPath);
      if (!existsSync(artworkPath) || !existsSync(reviewPath)) {
        failures.push(`${entry.cardId}: immutable approved reference artifact is missing.`);
      } else if ((await sha256(artworkPath)) !== entry.checksum) {
        failures.push(`${entry.cardId}: immutable reference checksum differs from artwork.`);
      } else {
        const review = await readJson(reviewPath);
        const scores =
          review.scores ??
          Object.fromEntries(
            Object.entries(review.sections ?? {}).map(([section, value]) => [section, value.score]),
          );
        const sectionPasses = Object.values(review.sections ?? {}).map(
          (section) => section.requiredPass,
        );
        if (
          review.cardId !== entry.cardId ||
          review.artworkVersion !== entry.approvedArtworkVersion ||
          review.candidateChecksum !== entry.checksum ||
          !review.reviewer?.trim() ||
          Object.keys(scores).length !== 11 ||
          Object.values(scores).some(
            (score) => !Number.isInteger(score) || score < 4 || score > 5,
          ) ||
          sectionPasses.some((passed) => passed !== true) ||
          Object.keys(review.requiredPasses ?? {}).length !== 9 ||
          Object.values(review.requiredPasses ?? {}).some((passed) => passed !== true)
        ) {
          failures.push(`${entry.cardId}: immutable human review provenance is incomplete.`);
        }
      }
    }
  }

  const coverageIds = coverage.cards.map((card) => card.cardId);
  if (
    coverage.schemaVersion !== 'premium-tarot-reference-coverage-v1' ||
    JSON.stringify([...coverageIds].sort()) !== JSON.stringify([...referenceIds].sort()) ||
    coverage.cards.some((card) => duplicates(card.covers).length) ||
    coverage.cards.some((card) => card.covers.some((item) => !coverage.dimensions.includes(item)))
  ) {
    failures.push('Reference coverage matrix is incomplete or contains unknown dimensions.');
  }

  const assignments = sourceMap.records ?? [];
  const sourceNumbers = assignments.map((item) => item.sequenceNumber);
  const assignedIds = assignments.map((item) => item.cardId);
  const filenames = assignments.map((item) => item.sourceFilename);
  if (
    sourceMap.schemaVersion !== LOCKED_SEQUENCE_SCHEMA ||
    sourceMap.locked !== true ||
    sourceMap.sequenceCount !== 78 ||
    assignments.length !== 78 ||
    duplicates(sourceNumbers).length ||
    duplicates(assignedIds).length ||
    duplicates(filenames).length ||
    assignments.some((item, index) => {
      const card = manifest.cards.find((candidate) => candidate.cardId === item.cardId);
      const reference = referenceSet.cards.find((candidate) => candidate.cardId === item.cardId);
      return (
        item.sequenceNumber !== index + 1 ||
        item.sourceFilename !== `${index + 1}.png` ||
        !canonicalIds.has(item.cardId) ||
        item.canonicalName !== card?.canonicalName ||
        item.arcana !== card?.arcana ||
        (item.suit ?? null) !== (card?.suit ?? null) ||
        (item.rank ?? null) !== (card?.rank ?? null) ||
        item.referenceRole !== (reference?.role ?? 'production-card') ||
        item.approvedState !== (isActiveApprovedCard(card) ? 'approved' : 'not-approved') ||
        !['reserved', 'processed'].includes(item.sourceState) ||
        item.promptReadiness !==
          (item.approvedState === 'approved'
            ? item.referenceRole === 'production-card'
              ? 'approved-candidate'
              : 'approved-reference'
            : 'style-contract-ready') ||
        (index < 15 && item.sourceState !== 'processed')
      );
    })
  ) {
    failures.push('Locked production sequence metadata is invalid or stale.');
  }
  if (JSON.stringify(assignedIds) !== JSON.stringify(LOCKED_PRODUCTION_CARD_IDS)) {
    failures.push('Number-to-card mapping differs from the locked 78-card production sequence.');
  }
  if (
    sourceMap.styleContract?.styleVersion !== 'premium-tarot-style-v2' ||
    sourceMap.styleContract?.goldenMasterCardId !== 'major-fool' ||
    sourceMap.styleContract?.approvedReferenceCount !== 15 ||
    sourceMap.styleContract?.referenceSetStatus !== 'complete' ||
    sourceMap.styleContract?.visualLanguageBible !==
      'premium-production/GOLDEN_MASTER_VISUAL_LANGUAGE.md' ||
    sourceMap.styleContract?.referenceStyleContract !==
      'premium-production/reference-set/style-consistency.json'
  ) {
    failures.push('Locked production sequence is missing the completed reference style contract.');
  }
  return failures;
}

export async function resolveNumberedSource(sourceDirectory, assignment) {
  if (!isAbsolute(sourceDirectory)) throw new Error('Numeric source directory must be absolute.');
  const path = resolve(sourceDirectory, assignment.sourceFilename);
  if (!path.startsWith(`${resolve(sourceDirectory)}/`))
    throw new Error('Unsafe numeric source path.');
  const details = await stat(path);
  if (!details.isFile()) throw new Error(`Numeric source is not a regular file: ${path}`);
  return path;
}

export async function resolveNumberedSourceInput(inputPath, assignment) {
  if (!isAbsolute(inputPath)) throw new Error('Numeric source path must be absolute.');
  const details = await stat(inputPath);
  if (details.isDirectory()) return resolveNumberedSource(inputPath, assignment);
  if (!details.isFile()) throw new Error(`Numeric source is not a regular file: ${inputPath}`);
  if (basename(inputPath) !== assignment.sourceFilename) {
    throw new Error(
      `Production number ${assignment.sequenceNumber} is locked to ${assignment.cardId} and expects ${assignment.sourceFilename}; received ${basename(inputPath)}.`,
    );
  }
  return inputPath;
}

export function validateBatchManifest(batch, productionManifest, sourceMap) {
  const failures = [];
  const cards = new Set(productionManifest.cards.map((card) => card.cardId));
  const assignments = new Map(sourceMap.records.map((item) => [item.sequenceNumber, item.cardId]));
  if (batch.schemaVersion !== 'premium-tarot-batch-v1') failures.push('Invalid batch schema.');
  if (!isAbsolute(batch.sourceDirectory ?? ''))
    failures.push('Batch sourceDirectory must be absolute.');
  if (!Array.isArray(batch.entries) || !batch.entries.length)
    failures.push('Batch entries are empty.');
  const numbers = batch.entries?.map((entry) => entry.sourceNumber) ?? [];
  const ids = batch.entries?.map((entry) => entry.cardId) ?? [];
  if (duplicates(numbers).length || duplicates(ids).length)
    failures.push('Batch entries are duplicated.');
  for (const entry of batch.entries ?? []) {
    if (!cards.has(entry.cardId)) failures.push(`Unknown batch card ID: ${entry.cardId}.`);
    if (assignments.get(entry.sourceNumber) !== entry.cardId) {
      failures.push(`Source ${entry.sourceNumber} is not mapped to ${entry.cardId}.`);
    }
  }
  return failures;
}

export async function runBatchEntries(entries, processEntry) {
  const results = [];
  for (const entry of entries) {
    try {
      const detail = await processEntry(entry);
      results.push({ ...entry, status: 'succeeded', detail });
    } catch (error) {
      results.push({ ...entry, status: 'failed', error: error.message });
    }
  }
  return results;
}

export function referenceApprovedPaths(cardId, version) {
  return {
    artwork: resolve(referenceApprovedRoot, `${cardId}-v${version}.jpg`),
    review: resolve(referenceApprovedRoot, `${cardId}-v${version}.review.json`),
  };
}

export function productionApprovedPaths(cardId, version) {
  return {
    artwork: resolve(productionApprovedRoot, `${cardId}-v${version}.jpg`),
    review: resolve(productionApprovedRoot, `${cardId}-v${version}.review.json`),
  };
}

export async function stageReferenceApproval(card, review, referenceSet) {
  const entry = referenceEntry(referenceSet, card.cardId);
  if (entry?.role === 'golden-master') return undefined;
  const originalArtwork = resolveFrontendPath(card.outputPath);
  const originalReview = resolveFrontendPath(card.reviewPath);
  const destinations = entry
    ? referenceApprovedPaths(card.cardId, card.version)
    : productionApprovedPaths(card.cardId, card.version);
  await mkdir(entry ? referenceApprovedRoot : productionApprovedRoot, { recursive: true });
  const created = [];
  try {
    for (const [source, destination] of [
      [originalArtwork, destinations.artwork],
      [originalReview, destinations.review],
    ]) {
      try {
        await copyFile(source, destination, constants.COPYFILE_EXCL);
        created.push(destination);
      } catch (error) {
        if (error.code !== 'EEXIST' || (await sha256(source)) !== (await sha256(destination))) {
          throw error;
        }
      }
    }
    if ((await sha256(destinations.artwork)) !== card.checksum) {
      throw new Error(`${card.cardId}: staged reference artwork checksum mismatch.`);
    }
    const stagedReview = JSON.parse(await readFile(destinations.review, 'utf8'));
    const reviewArtifactChecksum = await sha256(destinations.review);
    if (
      JSON.stringify(stagedReview) !== JSON.stringify(review) ||
      stagedReview.cardId !== card.cardId ||
      stagedReview.artworkVersion !== card.version ||
      stagedReview.candidateChecksum !== card.checksum ||
      stagedReview.styleVersion !== card.styleVersion ||
      stagedReview.reviewer !== review.reviewer ||
      stagedReview.decision !== 'approved' ||
      stagedReview.approvalBinding?.contractVersion !== BOUND_REVIEW_SCHEMA
    ) {
      throw new Error(`${card.cardId}: staged reference review provenance mismatch.`);
    }
    const previousPaths = {
      approvalBinding: card.approvalBinding,
      outputPath: card.outputPath,
      reviewArtifactChecksum: card.reviewArtifactChecksum,
      reviewPath: card.reviewPath,
      sourcePath: card.sourcePath,
      sourceProvenance: card.sourceProvenance,
    };
    const originalInputChecksum =
      card.candidateMetadata?.inputChecksum ??
      card.candidateMetadata?.preparation?.preparedChecksum ??
      card.checksum;
    const generatedSourceChecksum =
      card.candidateMetadata?.preparation?.sourceChecksum ?? originalInputChecksum;
    card.outputPath = toFrontendPath(destinations.artwork);
    card.reviewPath = toFrontendPath(destinations.review);
    card.reviewArtifactChecksum = reviewArtifactChecksum;
    card.approvalBinding = createReviewBinding(
      card,
      stagedReview,
      card.reviewPath,
      reviewArtifactChecksum,
    );
    card.sourcePath = card.outputPath;
    card.sourceProvenance = {
      kind: 'approved-artwork-equivalent-v1',
      originalInputChecksum,
      generatedSourceChecksum,
      durableEquivalentChecksum: card.checksum,
    };
    if (entry) {
      Object.assign(entry, {
        role: 'approved-reference',
        approvedArtworkVersion: card.version,
        checksum: card.checksum,
        styleVersion: card.styleVersion,
        approvedArtworkPath: card.outputPath,
        approvedReviewPath: card.reviewPath,
      });
    }
    return {
      async finalize() {
        if (previousPaths.outputPath !== card.outputPath)
          await rm(originalArtwork, { force: true });
        if (previousPaths.reviewPath !== card.reviewPath) await rm(originalReview, { force: true });
      },
      async rollback() {
        Object.assign(card, previousPaths);
        await Promise.all(created.map((path) => rm(path, { force: true })));
      },
    };
  } catch (error) {
    await Promise.all(created.map((path) => rm(path, { force: true })));
    throw error;
  }
}

export async function writeReferenceSet(referenceSet) {
  await writeJsonAtomic(referenceSetPath, referenceSet);
}

export function toWorkspaceRelative(path) {
  return toFrontendPath(resolve(frontendRoot, path));
}
