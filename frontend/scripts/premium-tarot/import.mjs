#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import process from 'node:process';

import {
  assertRegularFile,
  discoverCandidateFileAttempts,
  durableHistoryRoot,
  findProductionCard,
  frontendRoot,
  generatedRoot,
  goldenRubricPath,
  goldenRuntimePreviewPath,
  manifestPath,
  parseNamedArguments,
  planCandidateImport,
  planDurableCandidateHistory,
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
import { validatePreparationReport } from './prepare-lib.mjs';
import {
  applyLockedProductionStyle,
  readSourceNumberMap,
  setSourceProcessed,
  writeSourceNumberMap,
} from './mass-production.mjs';
import {
  canonicalIdentityForCard,
  createCanonicalIdentityReview,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { acquireProductionLock } from './production-lock.mjs';

function probe(path, entries) {
  return JSON.parse(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'json', path],
      { encoding: 'utf8' },
    ),
  ).streams?.[0];
}

function createReview(card, rubric, version, checksum, canonicalIdentity) {
  return {
    reviewVersion: rubric.version,
    cardId: card.cardId,
    artworkVersion: version,
    candidateChecksum: checksum,
    styleVersion: card.styleVersion,
    reviewer: '',
    notes: '',
    canonicalIdentity: createCanonicalIdentityReview(canonicalIdentity),
    ...(card.isGoldenMaster
      ? {
          decision: 'needs-revision',
          sections: Object.fromEntries(
            rubric.reviewSections.map((section) => [
              section,
              { score: null, notes: '', requiredPass: false },
            ]),
          ),
          symbols: card.symbolismChecklist.map((symbol) => ({
            symbol,
            status: 'unreviewed',
            comments: '',
          })),
          warnings: Object.fromEntries(
            rubric.reviewWarnings.map((warning) => [warning, { flagged: false, notes: '' }]),
          ),
        }
      : {
          scores: Object.fromEntries(rubric.scoreCategories.map((category) => [category, null])),
        }),
    requiredPasses: Object.fromEntries(
      rubric.requiredPasses.map((requirement) => [requirement, false]),
    ),
  };
}

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const [cardId, inputArgument] = positional;
if (!cardId || !inputArgument) {
  throw new Error('Usage: npm run tarot:premium:import -- <card-id> <file>');
}

const productionLock = await acquireProductionLock(`import ${cardId}`);
try {
  const manifest = await readProductionManifest();
  const sourceMap = await readSourceNumberMap();
  const canonicalIdentityManifest = await readCanonicalIdentityManifest();
  const sourceMapBefore = JSON.parse(JSON.stringify(sourceMap));
  const styleTarget = manifest.cards.find((card) => card.cardId === cardId);
  if (styleTarget) applyLockedProductionStyle(styleTarget, sourceMap);
  const failures = await validateProductionManifest(manifest);
  failures.push(
    ...validateCanonicalIdentityManifest(canonicalIdentityManifest, manifest, sourceMap),
  );
  if (failures.length) throw new Error(failures.join('\n'));
  const card = findProductionCard(manifest, cardId);
  const canonicalIdentity = canonicalIdentityForCard(canonicalIdentityManifest, cardId);
  if (card.productionStatus === 'approved' || card.productionStatus === 'integrated') {
    throw new Error(`${cardId} is approved. Reject it explicitly before importing a replacement.`);
  }
  if (card.isGoldenMaster && card.goldenMasterStyleVersion !== 'premium-tarot-style-v2') {
    throw new Error('The Golden Master import requires premium-tarot-style-v2.');
  }

  const inputPath = resolve(inputArgument);
  const preparationReportArgument = options.get('preparation-report');
  const preparationReport = preparationReportArgument
    ? await validatePreparationReport(await readJson(resolve(preparationReportArgument)), {
        preparedPath: inputPath,
      })
    : undefined;
  const details = await assertRegularFile(inputPath);
  if (details.size <= 0 || details.size > 100 * 1024 * 1024) {
    throw new Error('Source must be non-empty and no larger than 100 MB.');
  }
  const extension = extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(extension)) {
    throw new Error(`Unsupported source extension: ${extension}`);
  }

  const stream = probe(
    inputPath,
    'stream=width,height,pix_fmt,color_space,color_transfer,color_primaries:stream_tags=rotate:stream_side_data=rotation',
  );
  if (!stream?.width || !stream?.height || stream.height <= stream.width) {
    throw new Error('Source must contain a valid portrait image stream.');
  }
  if (stream.width < 1400 || stream.height < 2400) {
    throw new Error(
      `Source must be at least 1400x2400; received ${stream.width}x${stream.height}.`,
    );
  }
  if (Math.abs(stream.width / stream.height - 7 / 12) > 0.02) {
    throw new Error('Source aspect ratio must be compatible with the canonical 7:12 viewport.');
  }
  const embeddedRotation = Number(stream.tags?.rotate ?? stream.side_data_list?.[0]?.rotation ?? 0);
  if (embeddedRotation !== 0) {
    throw new Error(
      'Source must contain physically upright pixels and no orientation rotation metadata.',
    );
  }

  const inputChecksum = await sha256(inputPath);
  const importPlan = planCandidateImport(card, {
    filesystemAttempts: await discoverCandidateFileAttempts(cardId),
    inputChecksum,
    sourceChecksum: preparationReport?.sourceChecksum ?? inputChecksum,
  });
  if (importPlan.mode === 'reuse') {
    process.stdout.write(
      `Reused ${cardId} v${importPlan.version}; this exact artwork attempt already exists and no files or production state were changed.\n`,
    );
    await productionLock.release();
    process.exit(0);
  }

  const version = importPlan.version;
  const sourceDirectory = resolve(frontendRoot, 'premium-production/source', cardId);
  const candidatesDirectory = resolveFrontendPath('premium-production/candidates');
  const previewsDirectory = resolveFrontendPath('premium-production/previews');
  const reviewsDirectory = resolveFrontendPath('premium-production/reviews');
  const sourcePath = resolve(sourceDirectory, `${cardId}-v${version}${extension}`);
  const candidatePath = resolve(candidatesDirectory, `${cardId}-v${version}.jpg`);
  const previewPath = resolve(previewsDirectory, `${cardId}-v${version}.jpg`);
  const reviewPath = resolve(reviewsDirectory, `${cardId}-v${version}.json`);
  await Promise.all([
    mkdir(sourceDirectory, { recursive: true }),
    mkdir(candidatesDirectory, { recursive: true }),
    mkdir(previewsDirectory, { recursive: true }),
    mkdir(reviewsDirectory, { recursive: true }),
    ...(card.isGoldenMaster ? [mkdir(generatedRoot, { recursive: true })] : []),
  ]);

  const stagingDirectory = await mkdtemp(join(tmpdir(), `premium-tarot-${cardId}-v${version}-`));
  const stagedSourcePath = resolve(stagingDirectory, `source${extension}`);
  const stagedCandidatePath = resolve(stagingDirectory, 'candidate.jpg');
  const stagedPreviewPath = resolve(stagingDirectory, 'preview.jpg');
  const stagedReviewPath = resolve(stagingDirectory, 'review.json');
  try {
    await copyFile(inputPath, stagedSourcePath);
    execFileSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        stagedSourcePath,
        '-vf',
        'scale=1400:-2',
        '-map_metadata',
        '-1',
        '-frames:v',
        '1',
        '-q:v',
        '3',
        stagedCandidatePath,
      ],
      { stdio: 'inherit' },
    );
    execFileSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        stagedCandidatePath,
        '-vf',
        'scale=350:-2',
        '-map_metadata',
        '-1',
        '-frames:v',
        '1',
        '-q:v',
        '5',
        stagedPreviewPath,
      ],
      { stdio: 'inherit' },
    );

    const checksum = await sha256(stagedCandidatePath);
    const candidateDetails = await assertRegularFile(stagedCandidatePath);
    const candidateProbe = probe(
      stagedCandidatePath,
      'stream=width,height,pix_fmt,color_space,color_transfer,color_primaries',
    );
    const candidateMetadata = {
      width: candidateProbe?.width,
      height: candidateProbe?.height,
      aspectRatio: `${candidateProbe?.width}:${candidateProbe?.height}`,
      aspectRatioDecimal: Number((candidateProbe?.width / candidateProbe?.height).toFixed(6)),
      colorProfile:
        [
          candidateProbe?.color_primaries,
          candidateProbe?.color_transfer,
          candidateProbe?.color_space,
        ]
          .filter(Boolean)
          .join(' / ') || 'not embedded',
      pixelFormat: candidateProbe?.pix_fmt ?? 'unknown',
      fileSizeBytes: candidateDetails.size,
      generationDate: preparationReport?.sourceModifiedAt ?? details.mtime.toISOString(),
      importedAt: new Date().toISOString(),
      inputChecksum,
      ...(preparationReport
        ? {
            preparation: {
              pipelineVersion: preparationReport.pipelineVersion,
              sourceWidth: preparationReport.sourceWidth,
              sourceHeight: preparationReport.sourceHeight,
              preparedWidth: preparationReport.preparedWidth,
              preparedHeight: preparationReport.preparedHeight,
              resizeApplied: preparationReport.resizeApplied,
              resizeMethod: preparationReport.resizeMethod,
              resizeProviderKind: preparationReport.resizeProviderKind,
              trueSuperResolution: preparationReport.trueSuperResolution,
              resizeScale: preparationReport.resizeScale,
              cropApplied: preparationReport.cropApplied,
              cropBox: preparationReport.cropBox,
              sharpenApplied: preparationReport.sharpenApplied,
              colorProfileBefore: preparationReport.colorProfileBefore,
              colorProfileAfter: preparationReport.colorProfileAfter,
              colorProfileTransformation: preparationReport.colorProfileTransformation,
              orientationTransform: preparationReport.orientationTransform,
              sourceChecksum: preparationReport.sourceChecksum,
              sourceModifiedAt: preparationReport.sourceModifiedAt,
              preparedChecksum: preparationReport.preparedChecksum,
              nativeResolutionEligible: preparationReport.nativeResolutionEligible,
              preparedResolutionEligible: preparationReport.preparedResolutionEligible,
            },
          }
        : {}),
    };
    const rubric = await readJson(card.isGoldenMaster ? goldenRubricPath : rubricPath);
    await writeFile(
      stagedReviewPath,
      `${JSON.stringify(createReview(card, rubric, version, checksum, canonicalIdentity), null, 2)}\n`,
      'utf8',
    );

    const retained = await planDurableCandidateHistory(card);
    if (retained.entries.length) await mkdir(durableHistoryRoot, { recursive: true });
    const nextState = {
      approvalNotes: undefined,
      approvedAt: undefined,
      approvedBy: undefined,
      canonicalIdentityContractVersion: undefined,
      canonicalIdentityReviewed: undefined,
      candidateHistory: retained.history,
      candidateMetadata,
      checksum,
      finalPath: undefined,
      outputPath: toFrontendPath(candidatePath),
      previewPath: toFrontendPath(previewPath),
      productionStatus: 'review',
      rejectionReason: undefined,
      replacementReason: undefined,
      replacementRequiredAt: undefined,
      reviewPath: toFrontendPath(reviewPath),
      reviewStatus: 'needs-review',
      sourcePath: toFrontendPath(sourcePath),
      version,
      ...(card.isGoldenMaster
        ? {
            goldenMasterApprovalNotes: undefined,
            goldenMasterApprovedBy: undefined,
            goldenMasterReferenceChecksum: checksum,
            goldenMasterReviewStatus: 'needs-review',
            goldenMasterStatus: 'review',
            goldenMasterCandidateVersion: version,
          }
        : {}),
    };
    const artifacts = [
      ...retained.entries,
      { source: stagedSourcePath, destination: sourcePath },
      { source: stagedCandidatePath, destination: candidatePath },
      { source: stagedPreviewPath, destination: previewPath },
      { source: stagedReviewPath, destination: reviewPath },
      ...(card.isGoldenMaster
        ? [{ source: stagedCandidatePath, destination: goldenRuntimePreviewPath }]
        : []),
    ];
    const sequenceRecord = sourceMap.records.find((record) => record.cardId === cardId);
    const sourceStateChanged =
      preparationReport?.sourceFileName === sequenceRecord?.sourceFilename
        ? setSourceProcessed(sourceMap, sequenceRecord.sequenceNumber)
        : false;
    await publishCandidateArtifacts(artifacts, async () => {
      Object.assign(card, nextState);
      try {
        if (sourceStateChanged) await writeSourceNumberMap(sourceMap);
        await writeJsonAtomic(manifestPath, manifest);
      } catch (error) {
        if (sourceStateChanged) await writeSourceNumberMap(sourceMapBefore);
        throw error;
      }
    });

    process.stdout.write(
      `${importPlan.mode === 'recover' ? 'Recovered' : 'Imported'} ${cardId} v${version}. Candidate is in review and has not been approved.\nReview file: ${toFrontendPath(reviewPath)}\n`,
    );
  } finally {
    await rm(stagingDirectory, { force: true, recursive: true });
  }
} finally {
  await productionLock.release();
}
