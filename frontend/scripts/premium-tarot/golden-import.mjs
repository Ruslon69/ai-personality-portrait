#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import process from 'node:process';

const argumentsList = process.argv.slice(2);
const inputPath = argumentsList.shift();
const reportIndex = argumentsList.indexOf('--preparation-report');
const preparationReport = reportIndex === -1 ? undefined : argumentsList[reportIndex + 1];
if (reportIndex !== -1) argumentsList.splice(reportIndex, 2);
if (
  !inputPath ||
  argumentsList.length ||
  !isAbsolute(inputPath) ||
  (preparationReport && !isAbsolute(preparationReport))
) {
  throw new Error(
    'Usage: npm run tarot:premium:golden-import -- <absolute-image-path> [--preparation-report <absolute-report-path>]',
  );
}

execFileSync(
  process.execPath,
  [
    resolve(import.meta.dirname, 'import.mjs'),
    'major-fool',
    inputPath,
    ...(preparationReport ? ['--preparation-report', preparationReport] : []),
  ],
  { stdio: 'inherit' },
);
