#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import process from 'node:process';

import {
  findProductionCard,
  manifestPath,
  parseNamedArguments,
  productionRoot,
  publishCandidateArtifacts,
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
  applyLockedProductionStyle,
  readReferenceCoverage,
  readReferenceSet,
  readSourceNumberMap,
  setSequenceApprovalState,
  validateReferenceProduction,
  writeSourceNumberMap,
} from './mass-production.mjs';
import { candidateReviewCompletionFailures } from './review-workflow.mjs';
import { planApprovedSupersede } from './supersede-lib.mjs';
import {
  readCanonicalIdentityManifest,
  validateCanonicalApprovalProvenance,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { acquireProductionLock } from './production-lock.mjs';
import { validateActiveApprovalProvenance } from './approval-provenance.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const [cardId] = positional;
if (!cardId || positional.length !== 1 || !options.get('category') || !options.get('notes')) {
  throw new Error(
    'Usage: npm run tarot:premium:supersede -- <card-id> --category <category> --notes <notes>',
  );
}
const unknownOptions = [...options.keys()].filter(
  (option) => !['category', 'notes'].includes(option),
);
if (unknownOptions.length) throw new Error(`Unknown supersede option: --${unknownOptions[0]}`);

const productionLock = await acquireProductionLock(`supersede ${cardId}`);
try {
  const sourceChunkBytes = 4 * 1024 * 1024;

  async function stageSourceArtifacts(sourcePath, historyRoot, cardId, version) {
    const bytes = await readFile(sourcePath);
    const stagingRoot = await mkdtemp(join(tmpdir(), `tarot-supersede-${cardId}-v${version}-`));
    const entries = [];
    const sourceArtifacts = [];
    for (let offset = 0, index = 1; offset < bytes.length; offset += sourceChunkBytes, index += 1) {
      const part = bytes.subarray(offset, Math.min(offset + sourceChunkBytes, bytes.length));
      const suffix = String(index).padStart(2, '0');
      const staged = resolve(stagingRoot, `source.part-${suffix}.bin`);
      const destination = resolve(historyRoot, `${cardId}-v${version}.source.part-${suffix}.bin`);
      await writeFile(staged, part, { flag: 'wx' });
      entries.push({ source: staged, destination });
      sourceArtifacts.push({
        index,
        path: toFrontendPath(destination),
        checksum: createHash('sha256').update(part).digest('hex'),
        sizeBytes: part.length,
      });
    }
    return {
      async cleanup() {
        await rm(stagingRoot, { recursive: true, force: true });
      },
      entries,
      sourceArtifacts,
      sourceArtifactChecksum: createHash('sha256').update(bytes).digest('hex'),
    };
  }

  const [manifest, referenceSet, coverage, sourceMap, rubric, canonicalIdentityManifest] =
    await Promise.all([
      readProductionManifest(),
      readReferenceSet(),
      readReferenceCoverage(),
      readSourceNumberMap(),
      readJson(rubricPath),
      readCanonicalIdentityManifest(),
    ]);
  const card = findProductionCard(manifest, cardId);
  if (card.isGoldenMaster) {
    throw new Error(
      'The Golden Master cannot use the generic supersede workflow; use its dedicated workflow.',
    );
  }
  const requestedReason = {
    category: options.get('category').trim(),
    notes: options.get('notes').trim(),
  };
  if (card.productionStatus === 'replacement-required') {
    const historical = [...(card.candidateHistory ?? [])]
      .reverse()
      .find((attempt) => attempt.productionStatus === 'superseded');
    if (
      !historical ||
      historical.supersedeReason?.category !== requestedReason.category ||
      historical.supersedeReason?.notes !== requestedReason.notes
    ) {
      throw new Error(`${cardId} is already awaiting a replacement for a different reason.`);
    }
    if (historical.sourceArtifacts?.length) {
      process.stdout.write(
        `${cardId} v${historical.version} is already superseded; replacement v${card.version} remains required.\n`,
      );
      await productionLock.release();
      process.exit(0);
    }
    const legacyTrackedSource = resolveFrontendPath(historical.sourcePath);
    const sourceExtension = extname(legacyTrackedSource).toLowerCase();
    const originalSourcePath = resolve(
      productionRoot,
      'source',
      cardId,
      `${cardId}-v${historical.version}${sourceExtension}`,
    );
    const sourcePath = existsSync(originalSourcePath) ? originalSourcePath : legacyTrackedSource;
    if (
      !existsSync(sourcePath) ||
      (await sha256(sourcePath)) !== historical.sourceArtifactChecksum
    ) {
      throw new Error(
        `${cardId} retained source cannot be normalized into tracked provenance chunks.`,
      );
    }
    const historyRoot = resolve(productionRoot, 'approved', 'history');
    await mkdir(historyRoot, { recursive: true });
    const staged = await stageSourceArtifacts(sourcePath, historyRoot, cardId, historical.version);
    const manifestBefore = JSON.parse(JSON.stringify(manifest));
    try {
      await publishCandidateArtifacts(staged.entries, async () => {
        historical.sourceArtifactFormat = 'raw-chunks-v1';
        historical.sourceArtifacts = staged.sourceArtifacts;
        historical.sourcePath = toFrontendPath(originalSourcePath);
        const failures = [
          ...(await validateProductionManifest(manifest)),
          ...(await validateReferenceProduction(manifest, referenceSet, coverage, sourceMap)),
          ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
          ...(await validateCanonicalApprovalProvenance(manifest, canonicalIdentityManifest)),
          ...(await validateActiveApprovalProvenance(manifest, canonicalIdentityManifest)),
        ];
        if (failures.length) throw new Error(failures.join('\n'));
        try {
          await writeJsonAtomic(manifestPath, manifest);
        } catch (error) {
          await writeJsonAtomic(manifestPath, manifestBefore);
          throw error;
        }
      });
    } finally {
      await staged.cleanup();
    }
    if (legacyTrackedSource !== originalSourcePath) await rm(legacyTrackedSource, { force: true });
    process.stdout.write(
      `${cardId} superseded source provenance normalized into ${staged.sourceArtifacts.length} immutable checksum parts; replacement v${card.version} remains required.\n`,
    );
    await productionLock.release();
    process.exit(0);
  }

  const initialFailures = [
    ...(await validateProductionManifest(manifest)),
    ...(await validateReferenceProduction(manifest, referenceSet, coverage, sourceMap)),
    ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
    ...(await validateCanonicalApprovalProvenance(manifest, canonicalIdentityManifest)),
  ];
  if (initialFailures.length) throw new Error(initialFailures.join('\n'));
  if (card.productionStatus !== 'approved' || card.reviewStatus !== 'approved') {
    throw new Error(`${cardId} must be actively approved before it can be superseded.`);
  }
  const sourcePath = resolveFrontendPath(card.sourcePath);
  const artworkPath = resolveFrontendPath(card.outputPath);
  const reviewPath = resolveFrontendPath(card.reviewPath);
  if (![sourcePath, artworkPath, reviewPath].every(existsSync)) {
    throw new Error(
      `${cardId} approved source, artwork, and review must all exist before supersede.`,
    );
  }
  if ((await sha256(artworkPath)) !== card.checksum) {
    throw new Error(`${cardId} approved artwork checksum differs from the production manifest.`);
  }
  const review = await readJson(reviewPath);
  const { invalidScores, failedPasses, reviewerMissing } = candidateReviewCompletionFailures(
    review,
    rubric,
  );
  if (
    review.cardId !== cardId ||
    review.artworkVersion !== card.version ||
    review.candidateChecksum !== card.checksum ||
    review.reviewer !== card.approvedBy ||
    invalidScores.length ||
    failedPasses.length ||
    reviewerMissing
  ) {
    throw new Error(`${cardId} approved human review provenance is incomplete or mismatched.`);
  }

  const manifestBefore = JSON.parse(JSON.stringify(manifest));
  const sourceMapBefore = JSON.parse(JSON.stringify(sourceMap));
  const historyRoot = resolve(productionRoot, 'approved', 'history');
  const [reviewArtifactChecksum, reviewDetails] = await Promise.all([
    sha256(reviewPath),
    stat(reviewPath),
  ]);
  const sourceUsesApprovedEquivalent = sourcePath === artworkPath;
  if (!sourceUsesApprovedEquivalent) await mkdir(historyRoot, { recursive: true });
  const staged = sourceUsesApprovedEquivalent
    ? {
        async cleanup() {},
        entries: [],
        sourceArtifacts: [
          {
            index: 1,
            path: card.outputPath,
            checksum: card.checksum,
            sizeBytes: (await stat(artworkPath)).size,
          },
        ],
        sourceArtifactChecksum: card.checksum,
        sourceArtifactFormat: 'approved-artwork-equivalent-v1',
      }
    : {
        ...(await stageSourceArtifacts(sourcePath, historyRoot, cardId, card.version)),
        sourceArtifactFormat: 'raw-chunks-v1',
      };
  const supersededAt = new Date().toISOString();
  const nextState = planApprovedSupersede(card, {
    approvalTimestamp: card.approvedAt ?? reviewDetails.mtime.toISOString(),
    category: options.get('category'),
    notes: options.get('notes'),
    reviewArtifactChecksum,
    sourceArtifactFormat: staged.sourceArtifactFormat,
    sourceArtifactChecksum: staged.sourceArtifactChecksum,
    sourceArtifacts: staged.sourceArtifacts,
    supersededAt,
  });
  applyLockedProductionStyle(nextState, sourceMap);
  setSequenceApprovalState(sourceMap, cardId, false);

  try {
    await publishCandidateArtifacts(staged.entries, async () => {
      Object.assign(card, nextState);
      const nextFailures = [
        ...(await validateProductionManifest(manifest)),
        ...(await validateReferenceProduction(manifest, referenceSet, coverage, sourceMap)),
        ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
        ...(await validateCanonicalApprovalProvenance(manifest, canonicalIdentityManifest)),
      ];
      if (nextFailures.length) throw new Error(nextFailures.join('\n'));
      try {
        await writeSourceNumberMap(sourceMap);
        await writeJsonAtomic(manifestPath, manifest);
      } catch (error) {
        await writeSourceNumberMap(sourceMapBefore);
        await writeJsonAtomic(manifestPath, manifestBefore);
        throw error;
      }
    });
  } finally {
    await staged.cleanup();
  }

  process.stdout.write(
    `${cardId} v${nextState.replacementReason.supersedesVersion} retained as superseded history. ` +
      `Replacement v${nextState.version} is required and may now be imported; no replacement was created or approved.\n`,
  );
} finally {
  await productionLock.release();
}
