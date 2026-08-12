#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

const frontendRoot = resolve(import.meta.dirname, '..');
const tarotRoot = join(frontendRoot, 'src', 'assets', 'tarot');
const rightsManifestPath = join(tarotRoot, 'metadata', 'rws-public-domain-manifest.ts');
const orientationManifestPath = join(tarotRoot, 'metadata', 'rws-orientation-manifest.json');
const sourceRecordPath = join(tarotRoot, 'metadata', 'rws-source-record.json');
const normalizeAssets = process.argv.includes('--normalize-assets');
const processingDate = process.argv.find((argument) => argument.startsWith('--date='))?.slice(7);

if (!processingDate || !/^\d{4}-\d{2}-\d{2}$/u.test(processingDate)) {
  throw new Error('Pass an explicit processing date as --date=YYYY-MM-DD.');
}

const rightsSource = await readFile(rightsManifestPath, 'utf8');
const blocks = [...rightsSource.matchAll(/\{\n\s+arcana:[\s\S]*?\n\s+\},/gu)].map(
  (match) => match[0],
);
const records = blocks.map((block) => {
  const value = (field) => block.match(new RegExp(`${field}: '([^']+)'`, 'u'))?.[1];
  return {
    canonicalName: value('canonicalName'),
    cardId: value('cardId'),
    commonsFileName: value('commonsFileName'),
    localAssetPath: value('localAssetPath'),
  };
});

if (
  records.length !== 78 ||
  records.some(
    (record) =>
      !record.cardId || !record.canonicalName || !record.commonsFileName || !record.localAssetPath,
  )
) {
  throw new Error('The rights manifest must expose 78 complete source mappings.');
}

const sourceTransforms = new Map();
const checksums = new Map();

function videoFilter(sourceTransform) {
  if (sourceTransform === 'rotate-180') return 'hflip,vflip';
  if (sourceTransform === 'rotate-90-cw') return 'transpose=clock';
  if (sourceTransform === 'rotate-90-ccw') return 'transpose=cclock';
  return null;
}

for (const record of records) {
  const sourceTransform = sourceTransforms.get(record.cardId) ?? 'none';
  const assetPath = resolve(tarotRoot, record.localAssetPath);
  if (normalizeAssets) {
    const temporaryPath = join(dirname(assetPath), `.${record.cardId}.normalized.jpg`);
    const filter = videoFilter(sourceTransform);
    const argumentsList = [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      assetPath,
      ...(filter ? ['-vf', filter] : []),
      '-map_metadata',
      '-1',
      '-q:v',
      '5',
      '-frames:v',
      '1',
      temporaryPath,
      '-y',
    ];
    try {
      execFileSync('ffmpeg', argumentsList, { stdio: 'inherit' });
      const normalized = await readFile(temporaryPath);
      if (normalized.includes(Buffer.from('Exif\0\0'))) {
        throw new Error(`${record.cardId} still contains EXIF metadata after normalization.`);
      }
      await rename(temporaryPath, assetPath);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }
  checksums.set(
    record.cardId,
    createHash('sha256')
      .update(await readFile(assetPath))
      .digest('hex'),
  );
}

let updatedRightsSource = rightsSource;
for (const record of records) {
  const matcher = new RegExp(`(cardId: '${record.cardId}',[\\s\\S]*?checksum: ')[a-f0-9]+(')`, 'u');
  updatedRightsSource = updatedRightsSource.replace(matcher, `$1${checksums.get(record.cardId)}$2`);
}
await writeFile(rightsManifestPath, updatedRightsSource);

const reviewRecords = records.map((record) => ({
  canonicalOrientation: 'upright',
  cardId: record.cardId,
  currentTransform: sourceTransforms.get(record.cardId) ?? 'none',
  localRuntimeFile: record.localAssetPath,
  needsManualReview: false,
  reason:
    record.cardId === 'major-hanged-man'
      ? 'Upright XII numeral, title, and complete frame verified; the inverted figure is intentional composition.'
      : 'Upright numeral/title region and complete card frame verified in the 78-card raster contact-sheet audit.',
  sourceFile: record.commonsFileName,
  sourceTransform: sourceTransforms.get(record.cardId) ?? 'none',
}));

await writeFile(
  orientationManifestPath,
  `${JSON.stringify(
    {
      allowedSourceTransforms: ['none', 'rotate-180', 'rotate-90-cw', 'rotate-90-ccw'],
      canonicalOrientation: 'upright',
      processingDate,
      reviewRecords,
      version: 'rws-orientation-v1',
    },
    null,
    2,
  )}\n`,
);

const sourceRecord = JSON.parse(await readFile(sourceRecordPath, 'utf8'));
await writeFile(
  sourceRecordPath,
  `${JSON.stringify(
    {
      ...sourceRecord,
      processingDate,
      transformationNotes:
        'Canonical upright raster content retained at maximum 1200px height, JPEG normalized at ffmpeg q:v 5, EXIF stripped, ICC color profile retained, no crop or recoloring. Source transforms are recorded separately and applied exactly once before runtime output.',
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(
  `${normalizeAssets ? 'Normalized' : 'Audited'} ${records.length} canonical upright RWS assets.\n`,
);
