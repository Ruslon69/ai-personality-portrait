import { existsSync } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';

import { readJson, writeJsonAtomic } from './lib.mjs';

export const RELEASE_TRANSACTION_SCHEMA = 'premium-tarot-release-transaction-v1';

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function recoverReleaseTransaction({
  finalRoot,
  journalPath,
  productionManifestPath,
  runtimeManifestPath,
  stagingRoot,
}) {
  if (!existsSync(journalPath)) return { recovered: false };
  const journal = await readJson(journalPath);
  if (journal.schemaVersion !== RELEASE_TRANSACTION_SCHEMA) {
    throw new Error('Release transaction journal is unreadable; refusing automatic recovery.');
  }
  const runtime = await readJson(runtimeManifestPath);
  if (sameJson(runtime, journal.targetRuntimeManifest)) {
    if (!existsSync(finalRoot)) {
      throw new Error('Activated runtime release is missing its published artwork directory.');
    }
    await writeJsonAtomic(productionManifestPath, journal.targetProductionManifest);
    await rm(stagingRoot, { force: true, recursive: true });
    await rm(journalPath, { force: true });
    return { recovered: true, result: 'completed' };
  }
  if (!sameJson(runtime, journal.originalRuntimeManifest)) {
    throw new Error(
      'Runtime release manifest differs from both sides of the interrupted transaction; manual recovery is required.',
    );
  }
  await writeJsonAtomic(productionManifestPath, journal.originalProductionManifest);
  await rm(finalRoot, { force: true, recursive: true });
  await rm(stagingRoot, { force: true, recursive: true });
  await rm(journalPath, { force: true });
  return { recovered: true, result: 'rolled-back' };
}

export async function executeReleaseTransaction({
  failpoint,
  finalRoot,
  journalPath,
  originalProductionManifest,
  originalRuntimeManifest,
  productionManifestPath,
  runtimeManifestPath,
  stageArtwork,
  stagingRoot,
  targetProductionManifest,
  targetRuntimeManifest,
  validateStaged,
}) {
  await recoverReleaseTransaction({
    finalRoot,
    journalPath,
    productionManifestPath,
    runtimeManifestPath,
    stagingRoot,
  });
  if (existsSync(finalRoot)) {
    throw new Error('Premium final artwork directory already exists without a release journal.');
  }
  await rm(stagingRoot, { force: true, recursive: true });
  await mkdir(stagingRoot, { recursive: false });
  try {
    await stageArtwork(stagingRoot);
    await validateStaged(stagingRoot);
  } catch (error) {
    await rm(stagingRoot, { force: true, recursive: true });
    throw error;
  }
  const journal = {
    schemaVersion: RELEASE_TRANSACTION_SCHEMA,
    state: 'staged',
    originalProductionManifest,
    originalRuntimeManifest,
    targetProductionManifest,
    targetRuntimeManifest,
  };
  await writeJsonAtomic(journalPath, journal);
  try {
    await rename(stagingRoot, finalRoot);
    journal.state = 'artwork-published';
    await writeJsonAtomic(journalPath, journal);
    await failpoint?.('after-artwork-published');

    await writeJsonAtomic(productionManifestPath, targetProductionManifest);
    journal.state = 'production-published';
    await writeJsonAtomic(journalPath, journal);
    await failpoint?.('after-production-published');

    await writeJsonAtomic(runtimeManifestPath, targetRuntimeManifest);
    journal.state = 'runtime-activated';
    await writeJsonAtomic(journalPath, journal);
    await failpoint?.('after-runtime-activated');
    await rm(journalPath, { force: true });
  } catch (error) {
    const runtime = await readJson(runtimeManifestPath);
    if (sameJson(runtime, originalRuntimeManifest)) {
      await writeJsonAtomic(productionManifestPath, originalProductionManifest);
      await rm(finalRoot, { force: true, recursive: true });
      await rm(stagingRoot, { force: true, recursive: true });
      await rm(journalPath, { force: true });
    } else if (sameJson(runtime, targetRuntimeManifest)) {
      await writeJsonAtomic(productionManifestPath, targetProductionManifest);
      await rm(journalPath, { force: true });
      return;
    }
    throw error;
  }
}
