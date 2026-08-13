#!/usr/bin/env node

import { existsSync } from 'node:fs';
import process from 'node:process';

import {
  findProductionCard,
  manifestPath,
  parseNamedArguments,
  readJson,
  readProductionManifest,
  resolveFrontendPath,
  rubricPath,
  sha256,
  validateProductionManifest,
  writeJsonAtomic,
} from './lib.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const [cardId, decision] = positional;
if (!cardId || !['approve', 'reject'].includes(decision)) {
  throw new Error(
    'Usage: npm run tarot:premium:review -- <card-id> approve --review <review.json> OR reject --category <category> --notes <notes>',
  );
}
const manifest = await readProductionManifest();
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
const card = findProductionCard(manifest, cardId);
if (card.isGoldenMaster) {
  throw new Error('Use the dedicated Golden Master approval or rejection command for major-fool.');
}
if (card.productionStatus !== 'review') {
  throw new Error(`${cardId} must be in review before an approval decision.`);
}
if (!card.outputPath || !card.checksum || !existsSync(resolveFrontendPath(card.outputPath))) {
  throw new Error(`${cardId} has no valid processed candidate.`);
}
if ((await sha256(resolveFrontendPath(card.outputPath))) !== card.checksum) {
  throw new Error(`${cardId} candidate checksum does not match the production manifest.`);
}

const rubric = await readJson(rubricPath);
if (decision === 'approve') {
  const reviewArgument = options.get('review');
  if (!reviewArgument) throw new Error('Approval requires --review <completed-review.json>.');
  const review = await readJson(resolveFrontendPath(reviewArgument));
  if (
    review.cardId !== cardId ||
    review.artworkVersion !== card.version ||
    review.reviewVersion !== rubric.version
  ) {
    throw new Error('Review metadata does not match the candidate.');
  }
  const invalidScores = rubric.scoreCategories.filter(
    (category) =>
      !Number.isInteger(review.scores?.[category]) ||
      review.scores[category] < rubric.scale.approvalMinimumPerCategory ||
      review.scores[category] > rubric.scale.maximum,
  );
  const failedPasses = rubric.requiredPasses.filter(
    (requirement) => review.requiredPasses?.[requirement] !== true,
  );
  if (invalidScores.length || failedPasses.length || !review.reviewer?.trim()) {
    throw new Error(
      `Human approval incomplete. Scores: ${invalidScores.join(', ') || 'ok'}; required passes: ${failedPasses.join(', ') || 'ok'}; reviewer: ${review.reviewer || 'missing'}.`,
    );
  }
  Object.assign(card, {
    approvalNotes: review.notes?.trim() || `Approved by ${review.reviewer}.`,
    approvedBy: review.reviewer.trim(),
    productionStatus: 'approved',
    rejectionReason: undefined,
    reviewStatus: 'approved',
  });
} else {
  const category = options.get('category');
  const notes = options.get('notes');
  const regenerationReason = options.get('regeneration-reason') ?? notes;
  if (!rubric.rejectionCategories.includes(category) || !notes?.trim()) {
    throw new Error(
      `Rejection requires --category (${rubric.rejectionCategories.join(', ')}) and non-empty --notes.`,
    );
  }
  Object.assign(card, {
    approvalNotes: undefined,
    approvedBy: undefined,
    productionStatus: 'rejected',
    rejectionReason: {
      category,
      notes: notes.trim(),
      promptVersion: manifest.promptVersion,
      regenerationReason: regenerationReason.trim(),
    },
    reviewStatus: 'rejected',
  });
}

await writeJsonAtomic(manifestPath, manifest);
process.stdout.write(
  `${cardId} marked ${card.productionStatus}; runtime edition remains unchanged.\n`,
);
