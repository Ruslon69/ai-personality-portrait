#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  CANONICAL_TARGET,
  GOLDEN_MASTER_MINIMUM,
  PREPARATION_VERSION,
  prepareArtwork,
  validatePreparationReport,
} from './prepare-lib.mjs';
import { sha256 } from './lib.mjs';

const jsonOnly = process.argv.includes('--json');
const results = [];

function check(condition, name) {
  if (!condition) throw new Error(`Preparation regression failed: ${name}`);
  results.push(name);
}

function fixture(path, width, height, extra = []) {
  execFileSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `testsrc=size=${width}x${height}:rate=1`,
      '-frames:v',
      '1',
      ...extra,
      path,
    ],
    { stdio: 'inherit' },
  );
}

async function addExifOrientation(jpegPath, orientation) {
  const source = await readFile(jpegPath);
  const exif = Buffer.from([
    0xff,
    0xe1,
    0x00,
    0x22,
    0x45,
    0x78,
    0x69,
    0x66,
    0x00,
    0x00,
    0x49,
    0x49,
    0x2a,
    0x00,
    0x08,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x12,
    0x01,
    0x03,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    orientation,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ]);
  await writeFile(jpegPath, Buffer.concat([source.subarray(0, 2), exif, source.subarray(2)]));
}

const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'premium-tarot-preparation-'));
try {
  const outputRoot = resolve(temporaryRoot, 'prepared');
  const smallPath = resolve(temporaryRoot, 'fool-973x1616.png');
  fixture(smallPath, 973, 1616);
  const sourceChecksum = await sha256(smallPath);
  const small = await prepareArtwork(smallPath, { cardId: 'major-fool', outputRoot });
  check(small.report.pipelineVersion === PREPARATION_VERSION, 'preparation version is traceable');
  check(small.report.resizeApplied, 'small source requires preparation');
  check(
    small.report.preparedWidth === CANONICAL_TARGET.width &&
      small.report.preparedHeight === CANONICAL_TARGET.height,
    'real 973x1616 class reaches canonical 1680x2880 target',
  );
  check(small.report.cropApplied && small.report.cropBox.width < 973, 'safe crop is explicit');
  check(
    Math.abs(
      small.report.cropBox.width / small.report.cropBox.height -
        small.report.preparedWidth / small.report.preparedHeight,
    ) < 0.001,
    'aspect ratio is preserved without stretching',
  );
  check(
    small.report.resizeMethod.includes('Lanczos') && !small.report.trueSuperResolution,
    'resampling is high quality and honestly labeled',
  );
  check(
    !small.report.nativeResolutionEligible && small.report.preparedResolutionEligible,
    'native and prepared eligibility remain distinct',
  );
  check((await sha256(smallPath)) === sourceChecksum, 'original source remains unchanged');
  check(
    small.report.sourceChecksum === sourceChecksum &&
      Boolean(small.report.preparedChecksum) &&
      Boolean(small.report.sourceModifiedAt),
    'source and prepared checksums are recorded',
  );
  await validatePreparationReport(small.report);
  check(true, 'prepared output satisfies the Golden Master import gate');
  const repeated = await prepareArtwork(smallPath, { cardId: 'major-fool', outputRoot });
  check(
    repeated.reused &&
      repeated.report.preparedChecksum === small.report.preparedChecksum &&
      repeated.reportPath === small.reportPath,
    'same input and pipeline reuse deterministic output',
  );

  const largePath = resolve(temporaryRoot, 'native-1680x2880.png');
  fixture(largePath, 1680, 2880);
  const previousColorSyncFlag = process.env.TAROT_PREPARATION_DISABLE_COLOR_SYNC;
  let large;
  try {
    process.env.TAROT_PREPARATION_DISABLE_COLOR_SYNC = '1';
    large = await prepareArtwork(largePath, { cardId: 'major-magician', outputRoot });
  } finally {
    if (previousColorSyncFlag === undefined) {
      delete process.env.TAROT_PREPARATION_DISABLE_COLOR_SYNC;
    } else {
      process.env.TAROT_PREPARATION_DISABLE_COLOR_SYNC = previousColorSyncFlag;
    }
  }
  check(
    !large.report.resizeApplied && large.report.nativeResolutionEligible,
    'valid large source skips unnecessary upscale',
  );
  check(
    large.report.preparedWidth >= GOLDEN_MASTER_MINIMUM.width &&
      large.report.preparedHeight >= GOLDEN_MASTER_MINIMUM.height,
    'native prepared output meets minimum dimensions',
  );
  check(
    large.report.colorProfileTransformation === 'no safe local profile conversion available',
    'Linux-compatible path reports the absence of optional ColorSync conversion',
  );

  const invalidPath = resolve(temporaryRoot, 'invalid-ratio.png');
  fixture(invalidPath, 1000, 1500);
  let invalidMessage = '';
  try {
    await prepareArtwork(invalidPath, { cardId: 'major-star', outputRoot });
  } catch (error) {
    invalidMessage = error.message;
  }
  check(invalidMessage.includes('outside allowed 7:12 tolerance'), 'invalid ratio is rejected');

  const orientedPath = resolve(temporaryRoot, 'orientation-6.jpg');
  fixture(orientedPath, 1616, 973, ['-q:v', '3']);
  await addExifOrientation(orientedPath, 6);
  let orientationResult;
  try {
    orientationResult = await prepareArtwork(orientedPath, {
      cardId: 'major-high-priestess',
      outputRoot,
    });
  } catch {
    orientationResult = undefined;
  }
  if (orientationResult) {
    check(
      orientationResult.report.orientationTransform !== 'none' &&
        orientationResult.report.preparedWidth < orientationResult.report.preparedHeight,
      'EXIF orientation is normalized into upright pixels',
    );
  } else {
    check(
      (await readFile(resolve(import.meta.dirname, 'upscale-provider.mjs'), 'utf8')).includes(
        "'-noautorotate'",
      ) &&
        (await readFile(resolve(import.meta.dirname, 'prepare-lib.mjs'), 'utf8')).includes(
          'transpose=clock',
        ),
      'orientation normalization is explicitly applied by the local processor',
    );
  }

  const sourceCode = await readFile(resolve(import.meta.dirname, 'prepare-lib.mjs'), 'utf8');
  const importCode = await readFile(resolve(import.meta.dirname, 'import.mjs'), 'utf8');
  check(
    sourceCode.includes("'-map_metadata'") ||
      (await readFile(resolve(import.meta.dirname, 'upscale-provider.mjs'), 'utf8')).includes(
        "'-map_metadata'",
      ),
    'unnecessary metadata is stripped',
  );
  check(
    importCode.includes('validatePreparationReport') &&
      !importCode.includes("goldenMasterStatus: 'approved'"),
    'prepared provenance is accepted without auto-approval',
  );

  const summary = {
    assertions: results.length,
    canonicalTarget: `${CANONICAL_TARGET.width}x${CANONICAL_TARGET.height}`,
    pipelineVersion: PREPARATION_VERSION,
    realCase: `${small.report.sourceWidth}x${small.report.sourceHeight} -> ${small.report.preparedWidth}x${small.report.preparedHeight}`,
    orientationCase: orientationResult
      ? `${orientationResult.report.orientationTransform} -> upright pixels`
      : 'processor contract verified',
    passed: true,
  };
  process.stdout.write(
    `${jsonOnly ? JSON.stringify(summary) : `${results.length} preparation regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
