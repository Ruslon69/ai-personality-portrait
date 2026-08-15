#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, rename } from 'node:fs/promises';
import process from 'node:process';

import {
  findProductionCard,
  goldenApprovedArtworkPath,
  goldenApprovedReviewPath,
  goldenApprovedRoot,
  goldenReferencePath,
  goldenRubricPath,
  manifestPath,
  parseNamedArguments,
  readJson,
  readProductionManifest,
  readStyleLock,
  resolveFrontendPath,
  sha256,
  toFrontendPath,
  validateProductionManifest,
  writeJsonAtomic,
} from './lib.mjs';
import { acquireProductionLock } from './production-lock.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const reviewer = options.get('reviewer')?.trim();
const notes = options.get('notes')?.trim();
if (positional.length || !reviewer || !notes) {
  throw new Error(
    'Usage: npm run tarot:premium:golden-approve -- --reviewer <name> --notes <approval-notes>',
  );
}

const productionLock = await acquireProductionLock('Golden Master approval');
try {
  const manifest = await readProductionManifest();
  const failures = await validateProductionManifest(manifest);
  if (failures.length) throw new Error(failures.join('\n'));
  const card = findProductionCard(manifest, 'major-fool');
  if (
    !card.isGoldenMaster ||
    card.goldenMasterStatus !== 'review' ||
    card.productionStatus !== 'review'
  ) {
    throw new Error('The Fool Golden Master must be in review before approval.');
  }
  if (
    card.styleVersion !== 'premium-tarot-style-v2' ||
    card.goldenMasterStyleVersion !== 'premium-tarot-style-v2'
  ) {
    throw new Error('Golden Master approval requires premium-tarot-style-v2.');
  }
  if (
    !card.outputPath ||
    !card.reviewPath ||
    !card.checksum ||
    !existsSync(resolveFrontendPath(card.outputPath)) ||
    !existsSync(resolveFrontendPath(card.reviewPath))
  ) {
    throw new Error('Golden Master candidate or review record is missing.');
  }
  if ((await sha256(resolveFrontendPath(card.outputPath))) !== card.checksum) {
    throw new Error('Golden Master candidate checksum does not match the manifest.');
  }

  const [review, rubric, style] = await Promise.all([
    readJson(resolveFrontendPath(card.reviewPath)),
    readJson(goldenRubricPath),
    readStyleLock(card.goldenMasterStyleVersion),
  ]);
  if (
    review.cardId !== 'major-fool' ||
    review.artworkVersion !== card.version ||
    review.styleVersion !== 'premium-tarot-style-v2' ||
    review.reviewVersion !== rubric.version
  ) {
    throw new Error('Golden Master review metadata does not match the active candidate.');
  }
  if (review.candidateChecksum !== card.checksum) {
    throw new Error('Golden Master review checksum does not match the active candidate.');
  }
  const invalidSections = rubric.reviewSections.filter(
    (section) =>
      !Number.isInteger(review.sections?.[section]?.score) ||
      review.sections[section].score < rubric.scale.approvalMinimumPerCategory ||
      review.sections[section].score > rubric.scale.maximum ||
      !review.sections[section].notes?.trim() ||
      review.sections[section].requiredPass !== true,
  );
  const failedPasses = rubric.requiredPasses.filter(
    (requirement) => review.requiredPasses?.[requirement] !== true,
  );
  const missingSymbols = card.symbolismChecklist.filter(
    (symbol) => review.symbols?.find((item) => item.symbol === symbol)?.status !== 'present',
  );
  if (
    review.decision !== 'approved' ||
    review.reviewer?.trim() !== reviewer ||
    invalidSections.length ||
    failedPasses.length ||
    missingSymbols.length
  ) {
    throw new Error(
      `Golden Master review is incomplete. Decision/reviewer: ${review.decision}/${review.reviewer || 'missing'}; sections: ${invalidSections.join(', ') || 'ok'}; required passes: ${failedPasses.join(', ') || 'ok'}; symbols: ${missingSymbols.join(', ') || 'ok'}.`,
    );
  }

  Object.assign(review, {
    approvalNotes: notes,
    decision: 'approved',
    reviewer,
  });
  await writeJsonAtomic(resolveFrontendPath(card.reviewPath), review);
  const approvedArtworkPath = goldenApprovedArtworkPath(card.version);
  const approvedReviewPath = goldenApprovedReviewPath(card.version);
  if (existsSync(approvedArtworkPath) || existsSync(approvedReviewPath)) {
    throw new Error('Tracked Golden Master approval paths already exist for this version.');
  }
  await mkdir(goldenApprovedRoot, { recursive: true });
  await rename(resolveFrontendPath(card.outputPath), approvedArtworkPath);
  try {
    await rename(resolveFrontendPath(card.reviewPath), approvedReviewPath);
  } catch (error) {
    await rename(approvedArtworkPath, resolveFrontendPath(card.outputPath));
    throw error;
  }
  card.outputPath = toFrontendPath(approvedArtworkPath);
  card.reviewPath = toFrontendPath(approvedReviewPath);
  card.sourcePath = card.outputPath;
  card.sourceProvenance = {
    kind: 'approved-artwork-equivalent-v1',
    originalInputChecksum:
      card.candidateMetadata?.inputChecksum ??
      card.candidateMetadata?.preparation?.preparedChecksum ??
      card.checksum,
    generatedSourceChecksum:
      card.candidateMetadata?.preparation?.sourceChecksum ??
      card.candidateMetadata?.inputChecksum ??
      card.checksum,
    durableEquivalentChecksum: card.checksum,
  };
  await writeJsonAtomic(goldenReferencePath, {
    cardId: card.cardId,
    styleVersion: card.goldenMasterStyleVersion,
    artworkVersion: `premium-tarot-art-v${card.version}`,
    checksum: card.checksum,
    approvedArtworkPath: card.outputPath,
    approvedReviewPath: card.reviewPath,
    approvedBy: reviewer,
    approvalNotes: notes,
    visualCharacteristics: [
      'luminous mystical painted realism',
      'museum-quality semantic composition',
      'tactile natural materials',
      'restrained high-altitude cinematic light',
      'six-plane atmospheric depth',
      'mature collectible-card finish without a baked frame',
    ],
    paletteFamily: card.paletteFamily,
    lightingFamily: card.lightingFamily,
    materialLevel: style.materialRendering,
    realismLevel: style.realismLevel,
    depthProfile: style.depthFamilies[card.depthFamily],
    preparationProvenance: card.candidateMetadata?.preparation,
  });
  Object.assign(card, {
    approvalNotes: notes,
    approvedBy: reviewer,
    goldenMasterApprovalNotes: notes,
    goldenMasterApprovedBy: reviewer,
    goldenMasterReferenceChecksum: card.checksum,
    goldenMasterReviewStatus: 'approved',
    goldenMasterStatus: 'approved',
    productionStatus: 'approved',
    rejectionReason: undefined,
    reviewStatus: 'approved',
  });
  await writeJsonAtomic(manifestPath, manifest);
  process.stdout.write(
    'The Fool Golden Master is approved as a style reference. Full premium deck remains inactive.\n',
  );
} finally {
  await productionLock.release();
}
