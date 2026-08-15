#!/usr/bin/env node

import process from 'node:process';

import { readSourceNumberMap } from './mass-production.mjs';

const [command = 'list', numberArgument, cardId, extension = 'png', ...extras] =
  process.argv.slice(2);
const sourceMap = await readSourceNumberMap();

if (command === 'list') {
  for (const assignment of sourceMap.records) {
    process.stdout.write(
      `${assignment.sourceFilename} → ${assignment.cardId} (${assignment.sourceState})\n`,
    );
  }
} else if (command === 'assign') {
  const sourceNumber = Number(numberArgument);
  if (
    !Number.isInteger(sourceNumber) ||
    sourceNumber < 1 ||
    sourceNumber > 78 ||
    !cardId ||
    extras.length ||
    extension !== 'png'
  ) {
    throw new Error(
      'Usage: npm run tarot:premium:source-map -- assign <number 1–78> <locked-card-id> png',
    );
  }
  const expected = sourceMap.records.find((item) => item.sequenceNumber === sourceNumber);
  if (expected.cardId !== cardId) {
    throw new Error(
      `Locked mapping conflict: ${sourceNumber}.png must map to ${expected.cardId}, not ${cardId}.`,
    );
  }
  process.stdout.write(`${expected.sourceFilename} is permanently mapped to ${expected.cardId}.\n`);
} else {
  throw new Error('Use `list`; `assign` may only verify an existing locked mapping.');
}
