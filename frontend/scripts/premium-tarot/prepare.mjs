#!/usr/bin/env node

import process from 'node:process';

import { formatPreparationSummary, prepareArtwork } from './prepare-lib.mjs';

const argumentsList = process.argv.slice(2);
const sharpenIndex = argumentsList.indexOf('--sharpen');
const sharpen = sharpenIndex !== -1;
if (sharpen) argumentsList.splice(sharpenIndex, 1);
let cardId = 'major-fool';
const cardIndex = argumentsList.indexOf('--card-id');
if (cardIndex !== -1) {
  cardId = argumentsList[cardIndex + 1];
  argumentsList.splice(cardIndex, 2);
}
const [sourcePath, ...extras] = argumentsList;
if (!sourcePath || extras.length) {
  process.stderr.write(
    'Usage: npm run tarot:premium:prepare -- /absolute/path/to/image [--card-id <card-id>] [--sharpen]\n',
  );
  process.exitCode = 1;
} else {
  try {
    const result = await prepareArtwork(sourcePath, { cardId, sharpen });
    process.stdout.write(`${formatPreparationSummary(result)}\n`);
  } catch (error) {
    process.stderr.write(`Preparation failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
