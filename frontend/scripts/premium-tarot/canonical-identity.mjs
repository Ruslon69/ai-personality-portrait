import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { productionRoot, readJson, resolveFrontendPath } from './lib.mjs';

export const canonicalIdentityPath = resolve(productionRoot, 'canonical-identity.json');
export const CANONICAL_IDENTITY_SCHEMA = 'premium-tarot-canonical-identity-v1';
export const canonicalIdentityPassIds = [
  'canonicalTitleCorrect',
  'canonicalNumeralOrRankCorrect',
  'noProductionSequenceAsTarotNumber',
  'cardIdentityImmediatelyRecognizable',
];

const majorArcanaLock = [
  ['major-fool', 0, '0'],
  ['major-magician', 1, 'I'],
  ['major-high-priestess', 2, 'II'],
  ['major-empress', 3, 'III'],
  ['major-emperor', 4, 'IV'],
  ['major-hierophant', 5, 'V'],
  ['major-lovers', 6, 'VI'],
  ['major-chariot', 7, 'VII'],
  ['major-strength', 8, 'VIII'],
  ['major-hermit', 9, 'IX'],
  ['major-wheel', 10, 'X'],
  ['major-justice', 11, 'XI'],
  ['major-hanged-man', 12, 'XII'],
  ['major-death', 13, 'XIII'],
  ['major-temperance', 14, 'XIV'],
  ['major-devil', 15, 'XV'],
  ['major-tower', 16, 'XVI'],
  ['major-star', 17, 'XVII'],
  ['major-moon', 18, 'XVIII'],
  ['major-sun', 19, 'XIX'],
  ['major-judgement', 20, 'XX'],
  ['major-world', 21, 'XXI'],
];

const minorRankLock = new Map([
  ['ace', 'I'],
  ['two', 'II'],
  ['three', 'III'],
  ['four', 'IV'],
  ['five', 'V'],
  ['six', 'VI'],
  ['seven', 'VII'],
  ['eight', 'VIII'],
  ['nine', 'IX'],
  ['ten', 'X'],
  ['page', 'PAGE'],
  ['knight', 'KNIGHT'],
  ['queen', 'QUEEN'],
  ['king', 'KING'],
]);

export async function readCanonicalIdentityManifest() {
  return readJson(canonicalIdentityPath);
}

export function canonicalIdentityForCard(identityManifest, cardId) {
  const identity = identityManifest.records.find((record) => record.cardId === cardId);
  if (!identity) throw new Error(`Canonical Tarot identity is missing ${cardId}.`);
  return identity;
}

export function canonicalIdentityForSequence(identityManifest, sequenceNumber) {
  const identity = identityManifest.records.find(
    (record) => record.productionSequenceNumber === sequenceNumber,
  );
  if (!identity)
    throw new Error(`Canonical Tarot identity is missing production #${sequenceNumber}.`);
  return identity;
}

export function canonicalDisplayValue(identity) {
  return identity.arcana === 'major'
    ? identity.canonicalRomanNumeral
    : identity.canonicalDisplayRank;
}

export function expectedArcanaIdentity(identity) {
  return identity.arcana === 'major'
    ? `Major Arcana ${identity.canonicalRomanNumeral}`
    : `Minor Arcana · ${identity.suit} · ${identity.canonicalDisplayRank}`;
}

export function formatCanonicalOperatorIdentity(identity) {
  return [
    `Production #${identity.productionSequenceNumber}`,
    `Card: ${identity.canonicalName}`,
    `cardId: ${identity.cardId}`,
    `Expected canonical ${identity.arcana === 'major' ? 'numeral' : 'rank'}: ${canonicalDisplayValue(identity)}`,
    `Expected title: ${identity.canonicalDisplayTitle}`,
  ].join('\n');
}

export function canonicalPromptMetadata(identity) {
  return {
    cardId: identity.cardId,
    productionSequenceNumber: identity.productionSequenceNumber,
    externalSourceFilename: identity.externalSourceFilename,
    canonicalDisplayTitle: identity.canonicalDisplayTitle,
    canonicalDisplayValue: canonicalDisplayValue(identity),
    expectedArcanaIdentity: expectedArcanaIdentity(identity),
  };
}

export function assertCanonicalPromptMetadata(metadata, identity) {
  const expected = canonicalPromptMetadata(identity);
  if (
    Object.keys(expected).some((field) => metadata?.[field] !== expected[field]) ||
    Object.keys(metadata ?? {}).some((field) => !(field in expected))
  ) {
    throw new Error(
      `${identity.cardId}: prompt metadata substitutes or changes locked canonical Tarot identity.`,
    );
  }
  return expected;
}

export function createCanonicalIdentityReview(identity) {
  return {
    schemaVersion: CANONICAL_IDENTITY_SCHEMA,
    cardId: identity.cardId,
    productionSequenceNumber: identity.productionSequenceNumber,
    externalSourceFilename: identity.externalSourceFilename,
    arcana: identity.arcana,
    canonicalDisplayTitle: identity.canonicalDisplayTitle,
    canonicalDisplayValue: canonicalDisplayValue(identity),
    suit: identity.suit,
    rank: identity.rank,
    expectedArcanaIdentity: expectedArcanaIdentity(identity),
    checks: Object.fromEntries(canonicalIdentityPassIds.map((passId) => [passId, false])),
  };
}

function sameKeys(record, expectedKeys) {
  return (
    record &&
    typeof record === 'object' &&
    !Array.isArray(record) &&
    JSON.stringify(Object.keys(record).sort()) === JSON.stringify([...expectedKeys].sort())
  );
}

export function canonicalIdentityReviewFailures(review, identity) {
  const expected = createCanonicalIdentityReview(identity);
  const actual = review?.canonicalIdentity;
  const metadataMatches = [
    'schemaVersion',
    'cardId',
    'productionSequenceNumber',
    'externalSourceFilename',
    'arcana',
    'canonicalDisplayTitle',
    'canonicalDisplayValue',
    'suit',
    'rank',
    'expectedArcanaIdentity',
  ].every((field) => actual?.[field] === expected[field]);
  const missingPasses = canonicalIdentityPassIds.filter(
    (passId) => actual?.checks?.[passId] !== true,
  );
  return {
    metadataMatches,
    missingPasses,
    validShape:
      actual?.schemaVersion === CANONICAL_IDENTITY_SCHEMA &&
      sameKeys(actual?.checks, canonicalIdentityPassIds) &&
      Object.values(actual.checks).every((value) => typeof value === 'boolean'),
  };
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateCanonicalIdentityManifest(identityManifest, productionManifest, sourceMap) {
  const failures = [];
  const records = identityManifest.records ?? [];
  const cardIds = records.map((record) => record.cardId);
  const sequenceNumbers = records.map((record) => record.productionSequenceNumber);
  const filenames = records.map((record) => record.externalSourceFilename);
  if (
    identityManifest.schemaVersion !== CANONICAL_IDENTITY_SCHEMA ||
    identityManifest.locked !== true ||
    identityManifest.recordCount !== 78 ||
    records.length !== 78 ||
    duplicates(cardIds).length ||
    duplicates(sequenceNumbers).length ||
    duplicates(filenames).length ||
    records.some(
      (record, index) =>
        record.productionSequenceNumber !== index + 1 ||
        record.externalSourceFilename !== `${index + 1}.png`,
    )
  ) {
    failures.push('Canonical identity manifest must contain 78 unique locked sequence records.');
  }

  const productionById = new Map(productionManifest.cards.map((card) => [card.cardId, card]));
  const sourceById = new Map(sourceMap.records.map((record) => [record.cardId, record]));
  for (const record of records) {
    const production = productionById.get(record.cardId);
    const source = sourceById.get(record.cardId);
    if (
      !production ||
      !source ||
      record.canonicalName !== production.canonicalName ||
      record.arcana !== production.arcana ||
      record.productionSequenceNumber !== source.sequenceNumber ||
      record.externalSourceFilename !== source.sourceFilename ||
      (record.suit ?? null) !== (production.suit ?? null) ||
      (record.rank ?? null) !== (production.rank ?? null) ||
      record.canonicalDisplayTitle !== production.canonicalName.toUpperCase()
    ) {
      failures.push(`${record.cardId}: canonical identity differs from production identity.`);
    }
  }

  const majorById = new Map(majorArcanaLock.map((identity) => [identity[0], identity]));
  const majorRecords = records.filter((record) => record.arcana === 'major');
  if (
    majorRecords.length !== 22 ||
    majorRecords.some((record) => {
      const expected = majorById.get(record.cardId);
      return (
        !expected ||
        record.canonicalMajorNumber !== expected[1] ||
        record.canonicalRomanNumeral !== expected[2] ||
        record.canonicalDisplayRank !== null ||
        record.suit !== null ||
        record.rank !== null
      );
    })
  ) {
    failures.push('Major Arcana identity differs from the locked Rider–Waite–Smith numbering.');
  }

  const minorRecords = records.filter((record) => record.arcana === 'minor');
  if (
    minorRecords.length !== 56 ||
    minorRecords.some(
      (record) =>
        !['wands', 'cups', 'swords', 'pentacles'].includes(record.suit) ||
        !minorRankLock.has(record.rank) ||
        record.canonicalDisplayRank !== minorRankLock.get(record.rank) ||
        record.canonicalMajorNumber !== null ||
        record.canonicalRomanNumeral !== null,
    )
  ) {
    failures.push('Minor Arcana suit or rank identity differs from the locked Tarot contract.');
  }

  return failures;
}

export async function validateCanonicalApprovalProvenance(productionManifest, identityManifest) {
  const failures = [];
  for (const card of productionManifest.cards) {
    const marked = card.canonicalIdentityReviewed === true;
    const activeApproval = ['approved', 'integrated'].includes(card.productionStatus);
    if (!activeApproval) {
      if (marked) {
        failures.push(`${card.cardId}: non-approved card claims canonical approval provenance.`);
      }
      continue;
    }
    if (!card.reviewPath || !existsSync(resolveFrontendPath(card.reviewPath))) {
      if (marked) failures.push(`${card.cardId}: canonical approval review file is missing.`);
      continue;
    }
    const review = await readJson(resolveFrontendPath(card.reviewPath));
    const hasCanonicalReview = Boolean(review.canonicalIdentity);
    if (!marked && !hasCanonicalReview) continue;
    const identity = canonicalIdentityForCard(identityManifest, card.cardId);
    const canonicalFailures = canonicalIdentityReviewFailures(review, identity);
    if (
      (marked && card.canonicalIdentityContractVersion !== CANONICAL_IDENTITY_SCHEMA) ||
      card.reviewStatus !== 'approved' ||
      review.cardId !== card.cardId ||
      review.artworkVersion !== card.version ||
      review.candidateChecksum !== card.checksum ||
      !review.reviewer?.trim() ||
      !canonicalFailures.metadataMatches ||
      !canonicalFailures.validShape ||
      canonicalFailures.missingPasses.length
    ) {
      failures.push(`${card.cardId}: canonical identity approval provenance is incomplete.`);
    }
  }
  return failures;
}

export { majorArcanaLock, minorRankLock };
