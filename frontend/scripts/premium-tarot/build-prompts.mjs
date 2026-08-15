#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

import {
  PILOT_CARD_IDS,
  buildGoldenGenerationHandoff,
  buildPilotGenerationHandoff,
  buildPilotPromptHandoff,
  buildPromptHandoff,
  findProductionCard,
  goldenHandoffPath,
  goldenReferencePath,
  pilotDirectionPath,
  pilotGenerationRoot,
  promptFileName,
  promptsRoot,
  readJson,
  readProductionManifest,
  readStyleLock,
  rubricPath,
} from './lib.mjs';
import {
  canonicalIdentityForCard,
  assertCanonicalPromptMetadata,
  canonicalPromptMetadata,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { readSourceNumberMap } from './mass-production.mjs';

const [manifest, rubric, goldenReference, pilotMatrix, sourceMap, canonicalIdentityManifest] =
  await Promise.all([
    readProductionManifest(),
    readJson(rubricPath),
    readJson(goldenReferencePath),
    readJson(pilotDirectionPath),
    readSourceNumberMap(),
    readCanonicalIdentityManifest(),
  ]);
const identityFailures = validateCanonicalIdentityManifest(
  canonicalIdentityManifest,
  manifest,
  sourceMap,
);
if (identityFailures.length) throw new Error(identityFailures.join('\n'));
await Promise.all([
  mkdir(promptsRoot, { recursive: true }),
  mkdir(pilotGenerationRoot, { recursive: true }),
]);

const golden = findProductionCard(manifest, 'major-fool');
if (
  golden.productionStatus !== 'approved' ||
  golden.reviewStatus !== 'approved' ||
  golden.checksum !== goldenReference.checksum
) {
  throw new Error('Pilot prompts require the approved Fool Golden Master reference.');
}
const lineage = {
  goldenMasterCard: golden.cardId,
  goldenMasterReferenceVersion: golden.goldenMasterVersion,
  goldenMasterArtworkVersion: goldenReference.artworkVersion,
  goldenMasterChecksum: goldenReference.checksum,
};

const expectedFiles = PILOT_CARD_IDS.map(promptFileName).sort();
for (const cardId of PILOT_CARD_IDS) {
  const card = findProductionCard(manifest, cardId);
  const identity = canonicalIdentityForCard(canonicalIdentityManifest, cardId);
  const promptMetadata = assertCanonicalPromptMetadata(canonicalPromptMetadata(identity), identity);
  if (
    promptMetadata.cardId !== card.cardId ||
    promptMetadata.canonicalDisplayTitle !== card.canonicalName.toUpperCase()
  ) {
    throw new Error(`${cardId}: prompt metadata differs from canonical Tarot identity.`);
  }
  const style = await readStyleLock(card.styleVersion);
  if (card.isGoldenMaster) {
    const expectedPrompt = buildPromptHandoff(card, style, rubric);
    const expectedHandoff = buildGoldenGenerationHandoff(card, style);
    if (
      !existsSync(`${promptsRoot}/${promptFileName(cardId)}`) ||
      (await readFile(`${promptsRoot}/${promptFileName(cardId)}`, 'utf8')) !== expectedPrompt ||
      !existsSync(goldenHandoffPath) ||
      (await readFile(goldenHandoffPath, 'utf8')) !== expectedHandoff
    ) {
      throw new Error('Approved Fool prompt or generation handoff changed unexpectedly.');
    }
    continue;
  }
  const direction = pilotMatrix.cards.find((candidate) => candidate.cardId === cardId);
  if (!direction) throw new Error(`${cardId}: missing pilot art direction.`);
  await Promise.all([
    writeFile(
      `${promptsRoot}/${promptFileName(cardId)}`,
      buildPilotPromptHandoff(card, style, direction, lineage, rubric),
    ),
    writeFile(
      `${pilotGenerationRoot}/${cardId}.txt`,
      buildPilotGenerationHandoff(card, style, direction),
    ),
  ]);
}

const actualFiles = (await readdir(promptsRoot)).filter((name) => name.endsWith('.md')).sort();
if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
  throw new Error(`Pilot prompt directory must contain exactly: ${expectedFiles.join(', ')}`);
}

process.stdout.write(
  'Verified the approved Fool prompt and generated seven deterministic Golden-Master-aware pilot handoffs.\n',
);
