#!/usr/bin/env node

import process from 'node:process';

import { buildProductionQueue, readReferenceSet, readSourceNumberMap } from './mass-production.mjs';
import { readProductionManifest } from './lib.mjs';

const [manifest, referenceSet, sourceMap] = await Promise.all([
  readProductionManifest(),
  readReferenceSet(),
  readSourceNumberMap(),
]);
const queue = buildProductionQueue(manifest, referenceSet, sourceMap);
if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(queue, null, 2)}\n`);
} else {
  for (const item of queue) {
    process.stdout.write(
      `${String(item.sequenceNumber).padStart(2)}  ${item.sourceFilename.padEnd(6)} ${item.cardId.padEnd(24)} ${item.productionState.padEnd(16)} v${item.artworkVersion} ${item.role} → ${item.nextRequiredAction}\n`,
    );
  }
}
