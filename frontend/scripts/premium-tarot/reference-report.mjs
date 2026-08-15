#!/usr/bin/env node

import process from 'node:process';

import { readProductionManifest } from './lib.mjs';
import { readReferenceCoverage, readReferenceSet, referenceReadiness } from './mass-production.mjs';

const [manifest, referenceSet, coverage] = await Promise.all([
  readProductionManifest(),
  readReferenceSet(),
  readReferenceCoverage(),
]);
const readiness = referenceReadiness(manifest, referenceSet);
const counts = Object.fromEntries(
  coverage.dimensions.map((dimension) => [
    dimension,
    coverage.cards.filter((card) => card.covers.includes(dimension)).length,
  ]),
);
if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify({ readiness, coverage: counts }, null, 2)}\n`);
} else {
  process.stdout.write(
    `Reference set readiness: ${readiness.approved} / ${readiness.total} approved\n`,
  );
  if (readiness.complete) process.stdout.write('REFERENCE STYLE SET COMPLETE\n');
  process.stdout.write('\nVisual coverage\n');
  for (const [dimension, count] of Object.entries(counts)) {
    process.stdout.write(
      `${String(count).padStart(2)}  ${dimension}${count === 0 ? '  ← GAP' : ''}\n`,
    );
  }
}
