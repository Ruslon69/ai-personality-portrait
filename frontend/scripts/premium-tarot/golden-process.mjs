#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import process from 'node:process';

import { formatPreparationSummary, prepareArtwork } from './prepare-lib.mjs';
import { generatedRoot } from './lib.mjs';

const [sourcePath, ...extras] = process.argv.slice(2);
if (!sourcePath || extras.length || !isAbsolute(sourcePath)) {
  process.stderr.write('Usage: npm run tarot:premium:golden-process -- /absolute/path/to/image\n');
  process.exitCode = 1;
} else {
  try {
    const prepared = await prepareArtwork(sourcePath, { cardId: 'major-fool' });
    process.stdout.write(`${formatPreparationSummary(prepared)}\n`);
    execFileSync(
      process.execPath,
      [
        resolve(import.meta.dirname, 'golden-import.mjs'),
        prepared.report.preparedPath,
        '--preparation-report',
        prepared.reportPath,
      ],
      { stdio: 'inherit' },
    );
    execFileSync(process.execPath, [resolve(import.meta.dirname, 'golden-review.mjs')], {
      stdio: 'inherit',
    });
    process.stdout.write(
      `Review studio: ${resolve(generatedRoot, 'the-fool-golden-review.html')}\nCandidate remains in human review; no approval was performed.\n`,
    );
  } catch (error) {
    process.stderr.write(`Golden Master process failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
