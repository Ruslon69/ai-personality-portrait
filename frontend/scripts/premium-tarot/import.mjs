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

const { positional } = parseNamedArguments(process.argv.slice(2));
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

const inputPath = resolve(inputArgument);
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
      'stream=width,height:stream_tags=rotate:stream_side_data=rotation',
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
]);

await copyFile(inputPath, sourcePath, constants.COPYFILE_EXCL);
Object.assign(card, {
  approvalNotes: undefined,
  approvedBy: undefined,
  checksum: undefined,
  finalPath: undefined,
  outputPath: `premium-production/candidates/${cardId}.jpg`,
  previewPath: undefined,
  productionStatus: 'generated',
  rejectionReason: undefined,
  reviewPath: undefined,
  reviewStatus: 'not-reviewed',
  sourcePath: toFrontendPath(sourcePath),
  version,
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

Object.assign(card, {
  checksum: await sha256(candidatePath),
  outputPath: toFrontendPath(candidatePath),
  previewPath: toFrontendPath(previewPath),
  productionStatus: 'review',
  reviewPath: toFrontendPath(reviewPath),
  reviewStatus: 'needs-review',
});
await writeJsonAtomic(manifestPath, manifest);

const rubric = await readJson(rubricPath);
await writeFile(
  reviewPath,
  `${JSON.stringify(
    {
      reviewVersion: rubric.version,
      cardId,
      artworkVersion: version,
      reviewer: '',
      notes: '',
      scores: Object.fromEntries(rubric.scoreCategories.map((category) => [category, null])),
      requiredPasses: Object.fromEntries(
        rubric.requiredPasses.map((requirement) => [requirement, false]),
      ),
    },
    null,
    2,
  )}\n`,
  { flag: 'wx' },
);

process.stdout.write(
  `Imported ${cardId} v${version}. Candidate is in review and has not been approved.\nReview file: ${toFrontendPath(reviewPath)}\n`,
);
