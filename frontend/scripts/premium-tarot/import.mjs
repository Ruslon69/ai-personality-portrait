#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { constants } from 'node:fs';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import process from 'node:process';

import {
  assertRegularFile,
  findProductionCard,
  frontendRoot,
  generatedRoot,
  goldenRubricPath,
  goldenRuntimePreviewPath,
  parseNamedArguments,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  rubricPath,
  sha256,
  toFrontendPath,
  validateProductionManifest,
  writeJsonAtomic,
  manifestPath,
} from './lib.mjs';
import { validatePreparationReport } from './prepare-lib.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const [cardId, inputArgument] = positional;
if (!cardId || !inputArgument) {
  throw new Error('Usage: npm run tarot:premium:import -- <card-id> <file>');
}

const manifest = await readProductionManifest();
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
const card = findProductionCard(manifest, cardId);
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

const probe = JSON.parse(
  execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height,pix_fmt,color_space,color_transfer,color_primaries:stream_tags=rotate:stream_side_data=rotation',
      '-of',
      'json',
      inputPath,
    ],
    { encoding: 'utf8' },
  ),
);
const stream = probe.streams?.[0];
if (!stream?.width || !stream?.height || stream.height <= stream.width) {
  throw new Error('Source must contain a valid portrait image stream.');
}
if (stream.width < 1400 || stream.height < 2400) {
  throw new Error(`Source must be at least 1400x2400; received ${stream.width}x${stream.height}.`);
}
const ratioDifference = Math.abs(stream.width / stream.height - 7 / 12);
if (ratioDifference > 0.02) {
  throw new Error('Source aspect ratio must be compatible with the canonical 7:12 viewport.');
}
const embeddedRotation = Number(stream.tags?.rotate ?? stream.side_data_list?.[0]?.rotation ?? 0);
if (embeddedRotation !== 0) {
  throw new Error(
    'Source must contain physically upright pixels and no orientation rotation metadata.',
  );
}

const version = card.productionStatus === 'rejected' ? card.version + 1 : card.version;
const sourceDirectory = resolve(frontendRoot, 'premium-production/source', cardId);
const sourcePath = resolve(sourceDirectory, `${cardId}-v${version}${extension}`);
const candidatePath = resolve(
  frontendRoot,
  'premium-production/candidates',
  `${cardId}-v${version}.jpg`,
);
const previewPath = resolve(
  frontendRoot,
  'premium-production/previews',
  `${cardId}-v${version}.jpg`,
);
const reviewPath = resolve(
  frontendRoot,
  'premium-production/reviews',
  `${cardId}-v${version}.json`,
);
await Promise.all([
  mkdir(sourceDirectory, { recursive: true }),
  mkdir(resolveFrontendPath('premium-production/candidates'), { recursive: true }),
  mkdir(resolveFrontendPath('premium-production/previews'), { recursive: true }),
  mkdir(resolveFrontendPath('premium-production/reviews'), { recursive: true }),
  ...(card.isGoldenMaster ? [mkdir(generatedRoot, { recursive: true })] : []),
]);

await copyFile(inputPath, sourcePath, constants.COPYFILE_EXCL);
Object.assign(card, {
  approvalNotes: undefined,
  approvedBy: undefined,
  checksum: undefined,
  finalPath: undefined,
  outputPath: toFrontendPath(candidatePath),
  previewPath: undefined,
  productionStatus: 'generated',
  rejectionReason: undefined,
  reviewPath: undefined,
  reviewStatus: 'not-reviewed',
  sourcePath: toFrontendPath(sourcePath),
  version,
  ...(card.isGoldenMaster
    ? {
        goldenMasterApprovalNotes: undefined,
        goldenMasterApprovedBy: undefined,
        goldenMasterReferenceChecksum: undefined,
        goldenMasterReviewStatus: 'not-reviewed',
        goldenMasterStatus: 'candidate',
        goldenMasterCandidateVersion: version,
      }
    : {}),
});
await writeJsonAtomic(manifestPath, manifest);

card.productionStatus = 'processing';
await writeJsonAtomic(manifestPath, manifest);
execFileSync(
  'ffmpeg',
  [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    sourcePath,
    '-vf',
    'scale=1400:-2',
    '-map_metadata',
    '-1',
    '-frames:v',
    '1',
    '-q:v',
    '3',
    candidatePath,
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
    candidatePath,
    '-vf',
    'scale=350:-2',
    '-map_metadata',
    '-1',
    '-frames:v',
    '1',
    '-q:v',
    '5',
    previewPath,
  ],
  { stdio: 'inherit' },
);

const checksum = await sha256(candidatePath);
const candidateDetails = await assertRegularFile(candidatePath);
const candidateProbe = JSON.parse(
  execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height,pix_fmt,color_space,color_transfer,color_primaries',
      '-of',
      'json',
      candidatePath,
    ],
    { encoding: 'utf8' },
  ),
).streams?.[0];
const candidateMetadata = {
  width: candidateProbe?.width,
  height: candidateProbe?.height,
  aspectRatio: `${candidateProbe?.width}:${candidateProbe?.height}`,
  aspectRatioDecimal: Number((candidateProbe?.width / candidateProbe?.height).toFixed(6)),
  colorProfile:
    [candidateProbe?.color_primaries, candidateProbe?.color_transfer, candidateProbe?.color_space]
      .filter(Boolean)
      .join(' / ') || 'not embedded',
  pixelFormat: candidateProbe?.pix_fmt ?? 'unknown',
  fileSizeBytes: candidateDetails.size,
  generationDate: preparationReport?.sourceModifiedAt ?? details.mtime.toISOString(),
  importedAt: new Date().toISOString(),
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
  reviewPath,
  `${JSON.stringify(
    {
      reviewVersion: rubric.version,
      cardId,
      artworkVersion: version,
      styleVersion: card.styleVersion,
      reviewer: '',
      notes: '',
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
    },
    null,
    2,
  )}\n`,
  { flag: 'wx' },
);

if (card.isGoldenMaster) {
  await copyFile(candidatePath, goldenRuntimePreviewPath);
}
Object.assign(card, {
  checksum,
  candidateMetadata,
  outputPath: toFrontendPath(candidatePath),
  previewPath: toFrontendPath(previewPath),
  productionStatus: 'review',
  reviewPath: toFrontendPath(reviewPath),
  reviewStatus: 'needs-review',
  ...(card.isGoldenMaster
    ? {
        goldenMasterReferenceChecksum: checksum,
        goldenMasterReviewStatus: 'needs-review',
        goldenMasterStatus: 'review',
      }
    : {}),
});
await writeJsonAtomic(manifestPath, manifest);

process.stdout.write(
  `Imported ${cardId} v${version}. Candidate is in review and has not been approved.\nReview file: ${toFrontendPath(reviewPath)}\n`,
);
