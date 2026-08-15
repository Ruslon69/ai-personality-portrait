#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import process from 'node:process';

import { formatPreparationSummary, prepareArtwork } from './prepare-lib.mjs';

const [cardId, sourcePath, ...extras] = process.argv.slice(2);
if (!cardId || !sourcePath || extras.length || !isAbsolute(sourcePath)) {
  process.stderr.write(
    'Usage: npm run tarot:premium:process -- <card-id> /absolute/path/to/image\n',
  );
  process.exitCode = 1;
} else {
  try {
    const prepared = await prepareArtwork(sourcePath, { cardId });
    process.stdout.write(`${formatPreparationSummary(prepared)}\n`);
    execFileSync(
      process.execPath,
      [
        resolve(import.meta.dirname, 'import.mjs'),
        cardId,
        prepared.report.preparedPath,
        '--preparation-report',
        prepared.reportPath,
      ],
      { stdio: 'inherit' },
    );
    if (cardId === 'major-fool') {
      execFileSync(process.execPath, [resolve(import.meta.dirname, 'golden-review.mjs')], {
        stdio: 'inherit',
      });
    } else {
      execFileSync(process.execPath, [resolve(import.meta.dirname, 'contact-sheet.mjs')], {
        stdio: 'inherit',
      });
      execFileSync(
        process.execPath,
        [resolve(import.meta.dirname, 'candidate-review.mjs'), cardId],
        { stdio: 'inherit' },
      );
    }
  } catch (error) {
    process.stderr.write(`Premium artwork process failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
