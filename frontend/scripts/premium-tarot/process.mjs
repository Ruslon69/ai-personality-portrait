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
    const reviewScript = cardId === 'major-fool' ? 'golden-review.mjs' : 'contact-sheet.mjs';
    execFileSync(process.execPath, [resolve(import.meta.dirname, reviewScript)], {
      stdio: 'inherit',
    });
  } catch (error) {
    process.stderr.write(`Premium artwork process failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
