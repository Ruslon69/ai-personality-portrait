#!/usr/bin/env node

/* global fetch */

import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { URL } from 'node:url';

const root = resolve(import.meta.dirname, '..', 'src', 'assets', 'tarot');
const manifestPath = join(root, 'metadata', 'rws-public-domain-manifest.ts');
const sourceRecordPath = join(root, 'metadata', 'rws-source-record.json');
const orientationManifestPath = join(root, 'metadata', 'rws-orientation-manifest.json');
const processingDate = process.argv.find((argument) => argument.startsWith('--date='))?.slice(7);
const manifestOnly = process.argv.includes('--manifest-only');
if (!processingDate || !/^\d{4}-\d{2}-\d{2}$/u.test(processingDate)) {
  throw new Error('Pass an explicit processing date as --date=YYYY-MM-DD.');
}

const majorNames = [
  'Fool',
  'Magician',
  'High Priestess',
  'Empress',
  'Emperor',
  'Hierophant',
  'Lovers',
  'Chariot',
  'Strength',
  'Hermit',
  'Wheel of Fortune',
  'Justice',
  'Hanged Man',
  'Death',
  'Temperance',
  'Devil',
  'Tower',
  'Star',
  'Moon',
  'Sun',
  'Judgement',
  'World',
];
const majorIds = [
  'fool',
  'magician',
  'high-priestess',
  'empress',
  'emperor',
  'hierophant',
  'lovers',
  'chariot',
  'strength',
  'hermit',
  'wheel',
  'justice',
  'hanged-man',
  'death',
  'temperance',
  'devil',
  'tower',
  'star',
  'moon',
  'sun',
  'judgement',
  'world',
];
const ranks = [
  ['ace', 'Ace'],
  ['two', 'Two'],
  ['three', 'Three'],
  ['four', 'Four'],
  ['five', 'Five'],
  ['six', 'Six'],
  ['seven', 'Seven'],
  ['eight', 'Eight'],
  ['nine', 'Nine'],
  ['ten', 'Ten'],
  ['page', 'Page'],
  ['knight', 'Knight'],
  ['queen', 'Queen'],
  ['king', 'King'],
];
const suits = [
  ['wands', 'Wands', 'Wands'],
  ['cups', 'Cups', 'Cups'],
  ['swords', 'Swords', 'Swords'],
  ['pentacles', 'Pentacles', 'Pents'],
];

const expected = [
  ...majorIds.map((id, index) => ({
    arcana: 'major',
    canonicalName: majorNames[index],
    cardId: `major-${id}`,
    commonsFileName: `RWS Tarot ${String(index).padStart(2, '0')} ${majorNames[index]}.jpg`,
    localAssetPath: `cards/rws/major/${String(index).padStart(2, '0')}-${id}.jpg`,
  })),
  ...suits.flatMap(([suit, suitName, sourcePrefix]) =>
    ranks.map(([rank, rankName], index) => ({
      arcana: 'minor',
      canonicalName: `${rankName} of ${suitName}`,
      cardId: `${suit}-${rank}`,
      commonsFileName: `${sourcePrefix}${String(index + 1).padStart(2, '0')}.jpg`,
      localAssetPath: `cards/rws/${suit}/${rank}-${suit}.jpg`,
      rank,
      suit,
    })),
  ),
];
const orientationManifest = JSON.parse(await readFile(orientationManifestPath, 'utf8'));
const orientationByCardId = new Map(
  orientationManifest.reviewRecords.map((record) => [record.cardId, record]),
);
if (orientationByCardId.size !== 78) throw new Error('Orientation coverage must equal 78.');

function sourceTransformFilter(sourceTransform) {
  if (sourceTransform === 'rotate-180') return 'hflip,vflip';
  if (sourceTransform === 'rotate-90-cw') return 'transpose=clock';
  if (sourceTransform === 'rotate-90-ccw') return 'transpose=cclock';
  if (sourceTransform === 'none') return null;
  throw new Error(`Unsupported source transform: ${sourceTransform}`);
}

const apiUrl = new URL('https://commons.wikimedia.org/w/api.php');
Object.entries({
  action: 'query',
  format: 'json',
  formatversion: '2',
  gcmlimit: 'max',
  gcmtitle: 'Category:Rider-Waite-Smith tarot deck (TaionWC)',
  gcmtype: 'file',
  generator: 'categorymembers',
  iiprop: 'url|size|sha1|extmetadata',
  prop: 'imageinfo',
}).forEach(([key, value]) => apiUrl.searchParams.set(key, value));

const response = await fetch(apiUrl, { headers: { 'User-Agent': 'KEY2-RWS-asset-audit/1.0' } });
if (!response.ok) throw new Error(`Commons API failed: ${response.status}`);
const payload = await response.json();
const pages = new Map(
  payload.query.pages.map((page) => [page.title.replace(/^File:/u, ''), page.imageinfo[0]]),
);
if (pages.size !== 78 || expected.length !== 78) throw new Error('RWS coverage must equal 78.');

const tempDirectory = manifestOnly ? null : await mkdtemp(join(tmpdir(), 'key2-rws-'));
const entries = [];
const wait = (duration) => delay(duration);
async function downloadImage(url, fileName) {
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const imageResponse = await fetch(url, {
      headers: { 'User-Agent': 'KEY2-RWS-asset-audit/1.0' },
    });
    if (imageResponse.ok) return Buffer.from(await imageResponse.arrayBuffer());
    if (attempt === 8) {
      throw new Error(`Image download failed (${imageResponse.status}): ${fileName}`);
    }
    await wait(Math.min(30_000, attempt * 5_000));
  }
  throw new Error(`Image download failed: ${fileName}`);
}
try {
  for (const mapping of expected) {
    const orientation = orientationByCardId.get(mapping.cardId);
    if (!orientation || orientation.canonicalOrientation !== 'upright') {
      throw new Error(`Missing canonical orientation record: ${mapping.cardId}`);
    }
    const source = pages.get(mapping.commonsFileName);
    if (!source) throw new Error(`Missing Commons file: ${mapping.commonsFileName}`);
    const metadata = source.extmetadata;
    if (
      metadata.LicenseShortName?.value !== 'Public domain' ||
      metadata.UsageTerms?.value !== 'Public domain' ||
      metadata.AttributionRequired?.value !== 'false' ||
      metadata.Copyrighted?.value !== 'False'
    ) {
      throw new Error(`Rights verification failed: ${mapping.commonsFileName}`);
    }

    let processedWidth = Math.round((source.width / source.height) * 1200);
    let processedHeight = 1200;
    let checksum = source.sha1;
    if (!manifestOnly && tempDirectory) {
      const sourcePath = join(tempDirectory, mapping.commonsFileName);
      const destination = join(root, mapping.localAssetPath);
      await mkdir(dirname(destination), { recursive: true });
      let exists = true;
      try {
        await access(destination);
      } catch {
        exists = false;
      }
      if (!exists) {
        await writeFile(
          sourcePath,
          await downloadImage(
            `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(mapping.commonsFileName)}?width=715`,
            mapping.commonsFileName,
          ),
        );
        const resizedPath = join(tempDirectory, `${mapping.cardId}-resized.jpg`);
        execFileSync('sips', [
          '-Z',
          '1200',
          '-s',
          'format',
          'jpeg',
          '-s',
          'formatOptions',
          '62',
          sourcePath,
          '--out',
          resizedPath,
        ]);
        const filter = sourceTransformFilter(orientation.sourceTransform);
        execFileSync('ffmpeg', [
          '-hide_banner',
          '-loglevel',
          'error',
          '-i',
          resizedPath,
          ...(filter ? ['-vf', filter] : []),
          '-map_metadata',
          '-1',
          '-q:v',
          '5',
          '-frames:v',
          '1',
          destination,
          '-y',
        ]);
      }
      const dimensions = execFileSync('sips', [
        '-g',
        'pixelWidth',
        '-g',
        'pixelHeight',
        destination,
      ]).toString();
      processedWidth = Number(dimensions.match(/pixelWidth: (\d+)/u)?.[1]);
      processedHeight = Number(dimensions.match(/pixelHeight: (\d+)/u)?.[1]);
      checksum = createHash('sha256')
        .update(await readFile(destination))
        .digest('hex');
      await wait(1_500);
    }
    entries.push({
      ...mapping,
      artworkVersion: 'rws-classic-public-domain-v1',
      canonicalOrientation: 'upright',
      checksum,
      commonsPageReference: source.descriptionurl,
      originalAuthor: 'Pamela Colman Smith',
      originalYear: 1910,
      processedFormat: 'jpeg',
      processedHeight,
      processedWidth,
      rightsNote:
        'Commons file metadata: Public domain; attribution not required; copyrighted=False.',
      rightsStatus: 'verified-public-domain',
      sourceTransform: orientation.sourceTransform,
      sourceChecksum: source.sha1,
      sourceImageHeight: source.height,
      sourceImageWidth: source.width,
      sourceSizeBytes: source.size,
    });
  }
} finally {
  if (tempDirectory) await rm(tempDirectory, { force: true, recursive: true });
}

const manifest =
  `// Generated by frontend/scripts/process-rws-artwork.mjs.\n` +
  `// Source metadata is verified before rightsStatus is assigned.\n\n` +
  `export { RWS_CLASSIC_DECK_ID } from './deck';\n\n` +
  `export const rwsPublicDomainManifest = ${JSON.stringify(entries, null, 2)} as const;\n`;
await writeFile(manifestPath, manifest);
await writeFile(
  sourceRecordPath,
  `${JSON.stringify(
    {
      author: 'Pamela Colman Smith',
      collection: 'Rider-Waite-Smith tarot deck (TaionWC)',
      commonsCategory:
        'https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)',
      originalPublicationYear: 1910,
      processingDate,
      publicDomainStatus:
        'All 78 individual Commons file records verified Public domain with attribution not required.',
      sourceCount: entries.length,
      transformationNotes:
        'Source transform recorded per card and applied once before output; maximum 1200px dimension, JPEG normalized at ffmpeg q:v 5, EXIF stripped, ICC retained, no crop or recoloring.',
    },
    null,
    2,
  )}\n`,
);

const totalSourceBytes = entries.reduce((total, entry) => total + entry.sourceSizeBytes, 0);
process.stdout.write(
  `${manifestOnly ? 'Manifested' : 'Processed'} ${entries.length} verified files (${totalSourceBytes} source bytes).\n`,
);
