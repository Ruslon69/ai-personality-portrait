#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import process from 'node:process';

import {
  markSourceProcessed,
  lockedSequenceRecord,
  readSourceNumberMap,
  resolveNumberedSourceInput,
} from './mass-production.mjs';
import { readProductionManifest } from './lib.mjs';
import {
  canonicalIdentityForSequence,
  formatCanonicalOperatorIdentity,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';

const [numberArgument, sourcePathArgument, ...extras] = process.argv.slice(2);
const sourceNumber = Number(numberArgument);
if (!Number.isInteger(sourceNumber) || sourceNumber < 1 || sourceNumber > 78) {
  throw new Error(`Production number ${numberArgument} is outside the locked 1–78 sequence.`);
}
if (!sourcePathArgument || !isAbsolute(sourcePathArgument) || extras.length) {
  throw new Error(
    'Usage: npm run tarot:premium:number-process -- <production-number 1–78> /absolute/path/to/N.png',
  );
}
const [sourceMap, productionManifest, canonicalIdentityManifest] = await Promise.all([
  readSourceNumberMap(),
  readProductionManifest(),
  readCanonicalIdentityManifest(),
]);
const identityFailures = validateCanonicalIdentityManifest(
  canonicalIdentityManifest,
  productionManifest,
  sourceMap,
);
if (identityFailures.length) throw new Error(identityFailures.join('\n'));
const assignment = lockedSequenceRecord(sourceMap, sourceNumber);
const identity = canonicalIdentityForSequence(canonicalIdentityManifest, sourceNumber);
const sourcePath = await resolveNumberedSourceInput(sourcePathArgument, assignment);
process.stdout.write(`${formatCanonicalOperatorIdentity(identity)}\n\n`);
execFileSync(
  process.execPath,
  [resolve(import.meta.dirname, 'process.mjs'), assignment.cardId, sourcePath],
  { stdio: 'inherit' },
);
await markSourceProcessed(sourceMap, sourceNumber);
process.stdout.write(
  `Processed ${assignment.sourceFilename} as ${assignment.cardId}; original file unchanged.\n`,
);
