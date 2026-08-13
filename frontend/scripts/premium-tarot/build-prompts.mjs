#!/usr/bin/env node

import { mkdir, readdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

import {
  PILOT_CARD_IDS,
  buildGoldenGenerationHandoff,
  buildPromptHandoff,
  findProductionCard,
  goldenHandoffPath,
  promptFileName,
  promptsRoot,
  readJson,
  readProductionManifest,
  readStyleLock,
  rubricPath,
} from './lib.mjs';

const [manifest, rubric] = await Promise.all([readProductionManifest(), readJson(rubricPath)]);
await mkdir(promptsRoot, { recursive: true });

const expectedFiles = PILOT_CARD_IDS.map(promptFileName).sort();
for (const cardId of PILOT_CARD_IDS) {
  const card = findProductionCard(manifest, cardId);
  const style = await readStyleLock(card.styleVersion);
  await writeFile(
    `${promptsRoot}/${promptFileName(cardId)}`,
    buildPromptHandoff(card, style, rubric),
  );
  if (card.isGoldenMaster) {
    await writeFile(goldenHandoffPath, buildGoldenGenerationHandoff(card, style));
  }
}

const actualFiles = (await readdir(promptsRoot)).filter((name) => name.endsWith('.md')).sort();
if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
  throw new Error(`Pilot prompt directory must contain exactly: ${expectedFiles.join(', ')}`);
}

process.stdout.write(`Generated ${actualFiles.length} deterministic pilot prompt handoffs.\n`);
