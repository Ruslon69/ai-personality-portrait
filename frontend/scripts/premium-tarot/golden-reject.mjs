#!/usr/bin/env node

import { rm } from 'node:fs/promises';
import process from 'node:process';

import {
  findProductionCard,
  goldenRubricPath,
  goldenRuntimePreviewPath,
  manifestPath,
  parseNamedArguments,
  readJson,
  readProductionManifest,
  validateProductionManifest,
  writeJsonAtomic,
} from './lib.mjs';

const { options, positional } = parseNamedArguments(process.argv.slice(2));
const reason = options.get('reason')?.trim();
const category = options.get('category') ?? 'style-drift';
if (positional.length || !reason) {
  throw new Error(
    'Usage: npm run tarot:premium:golden-reject -- --reason <reason> [--category <category>]',
  );
}

const manifest = await readProductionManifest();
const failures = await validateProductionManifest(manifest);
if (failures.length) throw new Error(failures.join('\n'));
const card = findProductionCard(manifest, 'major-fool');
const rubric = await readJson(goldenRubricPath);
if (!rubric.rejectionCategories.includes(category)) {
  throw new Error(`Invalid rejection category: ${category}`);
}
if (!['review', 'approved'].includes(card.goldenMasterStatus)) {
  throw new Error('The Fool Golden Master must be in review or approved before rejection.');
}

const historyEntry = {
  candidateVersion: card.goldenMasterCandidateVersion,
  checksum: card.checksum,
  candidateMetadata: card.candidateMetadata,
  outputPath: card.outputPath,
  previewPath: card.previewPath,
  reviewPath: card.reviewPath,
  status: 'rejected',
  category,
  reason,
  styleVersion: card.goldenMasterStyleVersion,
  reviewer: card.goldenMasterApprovedBy,
};
Object.assign(card, {
  approvalNotes: undefined,
  approvedBy: undefined,
  goldenMasterApprovalNotes: undefined,
  goldenMasterApprovedBy: undefined,
  goldenMasterHistory: [...(card.goldenMasterHistory ?? []), historyEntry],
  goldenMasterReviewStatus: 'rejected',
  goldenMasterStatus: 'rejected',
  productionStatus: 'rejected',
  rejectionReason: {
    category,
    notes: reason,
    promptVersion: manifest.promptVersion,
    regenerationReason: reason,
  },
  reviewStatus: 'rejected',
});
await rm(goldenRuntimePreviewPath, { force: true });
await writeJsonAtomic(manifestPath, manifest);
process.stdout.write(
  `The Fool Golden Master candidate v${card.goldenMasterCandidateVersion} was rejected; provenance was retained.\n`,
);
