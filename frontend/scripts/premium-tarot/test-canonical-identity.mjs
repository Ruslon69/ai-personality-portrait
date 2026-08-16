#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';

import {
  assertCanonicalPromptMetadata,
  canonicalDisplayValue,
  canonicalIdentityForCard,
  canonicalIdentityPassIds,
  canonicalPromptMetadata,
  createCanonicalIdentityReview,
  formatCanonicalOperatorIdentity,
  majorArcanaLock,
  minorRankLock,
  readCanonicalIdentityManifest,
  validateCanonicalIdentityManifest,
} from './canonical-identity.mjs';
import { frontendRoot, readJson, readProductionManifest, rubricPath } from './lib.mjs';
import {
  buildProductionQueue,
  nextProductionCard,
  readReferenceSet,
  readSourceNumberMap,
} from './mass-production.mjs';
import { candidateReviewCompletionFailures } from './review-workflow.mjs';

const results = [];
function check(condition, name) {
  if (!condition) throw new Error(`Canonical identity regression failed: ${name}`);
  results.push(name);
}

const [identityManifest, productionManifest, sourceMap, rubric, referenceSet] = await Promise.all([
  readCanonicalIdentityManifest(),
  readProductionManifest(),
  readSourceNumberMap(),
  readJson(rubricPath),
  readReferenceSet(),
]);
const records = identityManifest.records;
check(
  validateCanonicalIdentityManifest(identityManifest, productionManifest, sourceMap).length === 0 &&
    records.length === 78 &&
    new Set(records.map((record) => record.cardId)).size === 78,
  'all 78 unique canonical identity records validate',
);

const majorRecords = records.filter((record) => record.arcana === 'major');
check(
  majorRecords.length === 22 &&
    majorArcanaLock.every(([cardId, number, numeral]) => {
      const record = canonicalIdentityForCard(identityManifest, cardId);
      return record.canonicalMajorNumber === number && record.canonicalRomanNumeral === numeral;
    }),
  'all 22 Rider–Waite–Smith Major Arcana identities are locked',
);

const identity = (cardId) => canonicalIdentityForCard(identityManifest, cardId);
check(
  identity('major-fool').canonicalMajorNumber === 0 &&
    identity('major-fool').canonicalRomanNumeral === '0',
  'The Fool is canonical 0',
);
check(
  identity('major-empress').productionSequenceNumber === 16 &&
    identity('major-empress').canonicalRomanNumeral === 'III',
  'production 16 is The Empress III',
);
check(
  identity('major-emperor').productionSequenceNumber === 17 &&
    identity('major-emperor').canonicalRomanNumeral === 'IV',
  'production 17 is The Emperor IV',
);
check(
  identity('major-hierophant').productionSequenceNumber === 18 &&
    identity('major-hierophant').canonicalRomanNumeral === 'V',
  'production 18 is The Hierophant V',
);
check(
  identity('major-chariot').productionSequenceNumber === 19 &&
    identity('major-chariot').canonicalRomanNumeral === 'VII',
  'production 19 is The Chariot VII',
);
check(
  identity('major-strength').canonicalRomanNumeral === 'VIII' &&
    identity('major-justice').canonicalRomanNumeral === 'XI',
  'RWS Strength VIII and Justice XI ordering is immutable',
);
check(
  identity('major-wheel').canonicalRomanNumeral === 'X' &&
    identity('major-world').canonicalRomanNumeral === 'XXI',
  'Wheel X and World XXI remain canonical',
);

const minorRecords = records.filter((record) => record.arcana === 'minor');
check(
  minorRecords.length === 56 &&
    minorRecords.every(
      (record) =>
        ['wands', 'cups', 'swords', 'pentacles'].includes(record.suit) &&
        record.canonicalDisplayRank === minorRankLock.get(record.rank),
    ),
  'all 56 Minor Arcana identities use locked suit and rank display values',
);
check(
  identity('swords-three').productionSequenceNumber === 7 &&
    identity('swords-three').canonicalDisplayRank === 'III' &&
    identity('swords-three').canonicalDisplayTitle === 'THREE OF SWORDS',
  'production 7 is Three of Swords III',
);
check(
  identity('cups-ace').productionSequenceNumber === 8 &&
    identity('cups-ace').canonicalDisplayRank === 'I' &&
    identity('cups-ace').canonicalDisplayTitle === 'ACE OF CUPS',
  'production 8 is Ace of Cups I',
);
check(
  minorRecords
    .filter((record) => ['page', 'knight', 'queen', 'king'].includes(record.rank))
    .every(
      (record) =>
        record.canonicalDisplayRank === record.rank.toUpperCase() &&
        !record.canonicalDisplayRank.includes(String(record.productionSequenceNumber)),
    ),
  'court cards retain named ranks and never inherit production numerals',
);
check(
  records.every(
    (record, index) =>
      record.productionSequenceNumber === index + 1 &&
      record.externalSourceFilename === `${index + 1}.png` &&
      sourceMap.records[index].cardId === record.cardId,
  ),
  'locked production sequence remains unchanged alongside canonical identity',
);

const operatorText = formatCanonicalOperatorIdentity(identity('major-hierophant'));
check(
  operatorText.includes('Production #18') &&
    operatorText.includes('Expected canonical numeral: V') &&
    operatorText.includes('Expected title: THE HIEROPHANT') &&
    !operatorText.includes('Expected canonical numeral: XVIII'),
  'numeric processing exposes the correct independent canonical identity',
);

const nextOutput = execFileSync(process.execPath, [resolve(import.meta.dirname, 'next.mjs')], {
  encoding: 'utf8',
});
const progressOutput = execFileSync(
  process.execPath,
  [resolve(import.meta.dirname, 'progress.mjs')],
  { encoding: 'utf8' },
);
const nextCard = nextProductionCard(
  buildProductionQueue(productionManifest, referenceSet, sourceMap),
);
if (nextCard) {
  const nextIdentity = canonicalIdentityForCard(identityManifest, nextCard.cardId);
  const nextValue = canonicalDisplayValue(nextIdentity);
  check(
    nextOutput.includes(
      `canonical Tarot ${nextIdentity.arcana === 'major' ? 'numeral' : 'rank'}: ${nextValue}`,
    ) && nextOutput.includes(`canonical title: ${nextIdentity.canonicalDisplayTitle}`),
    'next command exposes canonical identity',
  );
  check(
    progressOutput.includes(
      `canonical Tarot ${nextIdentity.arcana === 'major' ? 'numeral' : 'rank'}: ${nextValue}`,
    ) && progressOutput.includes(`canonical title: ${nextIdentity.canonicalDisplayTitle}`),
    'progress command exposes canonical identity',
  );
} else {
  check(
    nextOutput.includes('All 78 premium Tarot cards are approved') &&
      progressOutput.includes('Approved: 78 / 78') &&
      progressOutput.includes('Remaining: 0'),
    'next and progress commands expose the completed production state',
  );
}

const hierophant = identity('major-hierophant');
const review = {
  reviewer: 'Fixture Reviewer',
  scores: Object.fromEntries(rubric.scoreCategories.map((category) => [category, 5])),
  requiredPasses: Object.fromEntries(rubric.requiredPasses.map((passId) => [passId, true])),
  canonicalIdentity: createCanonicalIdentityReview(hierophant),
};
const incompleteReview = candidateReviewCompletionFailures(review, rubric, {
  identity: hierophant,
  requireCanonicalIdentity: true,
});
check(
  JSON.stringify(rubric.canonicalIdentityPasses) === JSON.stringify(canonicalIdentityPassIds) &&
    incompleteReview.canonicalIdentityFailures.length === canonicalIdentityPassIds.length,
  'new candidate approval is blocked until every canonical identity pass is explicit',
);
review.canonicalIdentity.checks = Object.fromEntries(
  canonicalIdentityPassIds.map((passId) => [passId, true]),
);
const completeReview = candidateReviewCompletionFailures(review, rubric, {
  identity: hierophant,
  requireCanonicalIdentity: true,
});
check(
  completeReview.canonicalIdentityFailures.length === 0 &&
    completeReview.invalidScores.length === 0 &&
    completeReview.failedPasses.length === 0,
  'explicit human canonical identity passes make a completed review approval-eligible',
);

const chariotPromptMetadata = canonicalPromptMetadata(identity('major-chariot'));
check(
  chariotPromptMetadata.productionSequenceNumber === 19 &&
    chariotPromptMetadata.canonicalDisplayValue === 'VII' &&
    chariotPromptMetadata.canonicalDisplayTitle === 'THE CHARIOT' &&
    chariotPromptMetadata.canonicalDisplayValue !== 'XIX',
  'prompt metadata keeps production 19 separate from Chariot VII',
);
let productionNumberSubstitutionRejected = false;
try {
  assertCanonicalPromptMetadata(
    { ...chariotPromptMetadata, canonicalDisplayValue: 'XIX' },
    identity('major-chariot'),
  );
} catch (error) {
  productionNumberSubstitutionRejected = error.message.includes('locked canonical Tarot identity');
}
check(
  productionNumberSubstitutionRejected,
  'prompt guard rejects production XIX substituted for Chariot VII',
);

const runtimeRelease = await readJson(
  resolve(frontendRoot, 'src/assets/tarot/metadata/premium-release-manifest.json'),
);
check(
  productionManifest.releaseThreshold.approved === 78 &&
    ((productionManifest.releaseMode === 'classic' &&
      runtimeRelease.mode === 'classic' &&
      runtimeRelease.records.length === 0) ||
      (productionManifest.releaseMode === 'premium-complete' &&
        runtimeRelease.mode === 'premium-complete' &&
        runtimeRelease.records.length === 78 &&
        productionManifest.cards.every((card) => card.productionStatus === 'integrated'))),
  'runtime release remains atomically locked to 78 active approvals',
);

const summary = { assertions: results.length, passed: true };
process.stdout.write(
  `${process.argv.includes('--json') ? JSON.stringify(summary) : `${results.length} canonical identity regressions passed\n${JSON.stringify(summary, null, 2)}`}\n`,
);
