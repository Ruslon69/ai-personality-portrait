#!/usr/bin/env node
import { log } from 'node:console';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(
  readFileSync(resolve(root, 'src/assets/zodiac/source-manifest.json'), 'utf8'),
);
const signs = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
];
const hashes = new Set();
const productionHashes = new Set();
const paths = new Set();
const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
function webpDimensions(image) {
  for (let offset = 12; offset + 8 <= image.length;) {
    const kind = image.toString('ascii', offset, offset + 4);
    const size = image.readUInt32LE(offset + 4);
    const start = offset + 8;
    assert(start + size <= image.length, 'Truncated WebP chunk');
    if (kind === 'VP8X')
      return [image.readUIntLE(start + 4, 3) + 1, image.readUIntLE(start + 7, 3) + 1];
    if (kind === 'VP8 ')
      return [image.readUInt16LE(start + 6) & 0x3fff, image.readUInt16LE(start + 8) & 0x3fff];
    offset = start + size + (size % 2);
  }
  throw new Error('Missing WebP image dimensions');
}
assert(manifest.entries.length === 24, 'Exactly 24 entries required');
for (const [index, entry] of manifest.entries.entries()) {
  assert(
    entry.sourceNumber === (index === 23 ? 25 : index + 1) &&
      entry.sign === signs[index] &&
      entry.system === (index < 12 ? 'western' : 'chinese') &&
      entry.visualReview === 'verified',
    `Incorrect mapping ${index + 1}`,
  );
  const source = readFileSync(resolve(root, entry.sourcePath));
  assert(
    source.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
    `Not PNG: ${entry.sourcePath}`,
  );
  assert(
    sha256(source) === entry.sha256 && source.length === entry.bytes,
    `Original modified: ${entry.sourcePath}`,
  );
  assert(
    source.readUInt32BE(16) === entry.width && source.readUInt32BE(20) === entry.height,
    'Source dimensions changed',
  );
  assert(!hashes.has(entry.sha256), 'Duplicate original');
  hashes.add(entry.sha256);
  assert(entry.variants.map((v) => v.width).join(',') === '480,800,1254', 'Wrong variants');
  for (const variant of entry.variants) {
    assert(
      variant.path === `/zodiac/${entry.system}/${entry.sign}-${variant.width}.webp`,
      'Incorrect semantic path',
    );
    assert(!paths.has(variant.path), 'Duplicate production path');
    paths.add(variant.path);
    const image = readFileSync(resolve(root, 'public', variant.path.slice(1)));
    assert(
      image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP',
      'Invalid WebP header',
    );
    assert(
      sha256(image) === variant.sha256 && image.length === variant.bytes,
      `Derivative changed: ${variant.path}`,
    );
    assert(!productionHashes.has(variant.sha256), 'Duplicate production image');
    productionHashes.add(variant.sha256);
    const [width, height] = webpDimensions(image);
    assert(width === variant.width && height === variant.height, 'Encoded dimensions mismatch');
    assert(
      variant.width === variant.height && variant.width <= entry.width,
      'Crop or upscale detected',
    );
  }
}
const pig = manifest.entries.find((entry) => entry.system === 'chinese' && entry.sign === 'pig');
const dragon = manifest.entries.find(
  (entry) => entry.system === 'chinese' && entry.sign === 'dragon',
);
assert(
  pig?.sourcePath === 'zodiak/25.png' && dragon?.sourcePath === 'zodiak/17.png',
  'Pig/Dragon source identity changed',
);
assert(
  new Set(manifest.entries.map((entry) => entry.sourcePath)).size === 24,
  'Duplicate active source mapping',
);
assert(
  !manifest.entries.some(
    (entry) => entry.sourceNumber === 24 || entry.sourcePath === 'zodiak/24.png',
  ),
  'Obsolete artwork is active',
);
assert(manifest.retiredSources?.length === 1, 'Missing retired source provenance');
const retired = manifest.retiredSources[0];
assert(
  retired.sourceNumber === 24 &&
    retired.sourcePath === 'zodiak/24.png' &&
    retired.replacedBySourceNumber === 25 &&
    retired.status === 'obsolete',
  'Incorrect retired source',
);
const retiredOriginal = readFileSync(resolve(root, retired.sourcePath));
assert(
  sha256(retiredOriginal) === retired.sha256 && retiredOriginal.length === retired.bytes,
  'Retired owner original modified',
);
assert(
  readdirSync(resolve(root, 'public/zodiac/western')).length === 36 &&
    readdirSync(resolve(root, 'public/zodiac/chinese')).length === 36,
  'Unexpected asset files',
);
log('PASS: 24 verified sign mappings, immutable SHA-256 sources, 72 WebP variants, no duplicates.');
log(
  'PASS: Dragon → 17.png; Pig → 25.png; obsolete 24.png preserved and excluded from active mappings.',
);
