#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import process from 'node:process';

import { readJson, readProductionManifest } from './lib.mjs';
import {
  markSourceProcessed,
  readSourceNumberMap,
  resolveNumberedSource,
  runBatchEntries,
  validateBatchManifest,
} from './mass-production.mjs';

const [batchPath, ...extras] = process.argv.slice(2);
if (!batchPath || extras.length) {
  throw new Error('Usage: npm run tarot:premium:batch-process -- /absolute/path/to/batch.json');
}
const resolvedBatchPath = isAbsolute(batchPath) ? batchPath : resolve(process.cwd(), batchPath);
const [batch, manifest, sourceMap] = await Promise.all([
  readJson(resolvedBatchPath),
  readProductionManifest(),
  readSourceNumberMap(),
]);
const failures = validateBatchManifest(batch, manifest, sourceMap);
if (failures.length) throw new Error(failures.join('\n'));
const assignments = new Map(sourceMap.records.map((item) => [item.sequenceNumber, item]));
const results = await runBatchEntries(batch.entries, async (entry) => {
  const sourcePath = await resolveNumberedSource(
    batch.sourceDirectory,
    assignments.get(entry.sourceNumber),
  );
  execFileSync(
    process.execPath,
    [resolve(import.meta.dirname, 'process.mjs'), entry.cardId, sourcePath],
    {
      stdio: 'inherit',
    },
  );
  await markSourceProcessed(sourceMap, entry.sourceNumber);
  return sourcePath;
});
process.stdout.write('\nPremium Tarot batch summary\n');
for (const result of results) {
  process.stdout.write(
    `${result.sourceNumber} → ${result.cardId}: ${result.status}${result.error ? ` — ${result.error}` : ''}\n`,
  );
}
if (results.some((result) => result.status === 'failed')) process.exitCode = 1;
