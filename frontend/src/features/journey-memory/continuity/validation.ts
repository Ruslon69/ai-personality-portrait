import type { ReadingContinuityContext } from '../types';

export type ReadingContinuityValidationError = {
  code: 'broken-reference' | 'duplicate-id' | 'invalid-limit' | 'invalid-value';
  message: string;
  path: string;
};

export function validateReadingContinuityContext(context: ReadingContinuityContext) {
  const errors: ReadingContinuityValidationError[] = [];
  const limits = [
    ['previousRelevantEntries', context.previousRelevantEntries.length, 10],
    ['recurringThemes', context.recurringThemes.length, 5],
    ['recentTransitions', context.recentTransitions.length, 3],
    ['repeatedCards', context.repeatedCards.length, 3],
  ] as const;
  limits.forEach(([path, actual, limit]) => {
    if (actual > limit)
      errors.push({
        code: 'invalid-limit',
        message: `${path} exceeds the ${limit}-item continuity limit.`,
        path,
      });
  });
  const ids = context.previousRelevantEntries.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length)
    errors.push({
      code: 'duplicate-id',
      message: 'Relevant entries must be unique.',
      path: 'previousRelevantEntries',
    });
  if (
    context.continuityVersion !== 'reading-continuity-v1' ||
    !context.memoryFingerprint ||
    !context.journeySnapshotVersion ||
    context.previousRelevantEntries.some(
      (entry) =>
        !entry.id || !Number.isFinite(entry.relevance) || Number.isNaN(Date.parse(entry.createdAt)),
    )
  )
    errors.push({
      code: 'invalid-value',
      message: 'Continuity metadata contains an invalid required value.',
      path: '$',
    });
  if (
    context.lastRelatedReading &&
    !context.previousRelevantEntries.some((entry) => entry.id === context.lastRelatedReading?.id)
  )
    errors.push({
      code: 'broken-reference',
      message: 'The last related reading must be included in previousRelevantEntries.',
      path: 'lastRelatedReading',
    });
  return { errors, valid: errors.length === 0 };
}
