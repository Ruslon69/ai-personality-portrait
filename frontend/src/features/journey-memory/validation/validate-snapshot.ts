import type {
  JourneyMemorySnapshot,
  JourneyMemoryValidationCode,
  JourneyMemoryValidationError,
} from '../types';
import { JOURNEY_MEMORY_VERSIONS } from '../model/versions';
import { classifyUnsafeClaims } from '@features/expert-interpretation';

function issue(
  errors: JourneyMemoryValidationError[],
  code: JourneyMemoryValidationCode,
  path: string,
  message: string,
) {
  errors.push({ code, message, path });
}

function scanSerializable(
  value: unknown,
  path: string,
  errors: JourneyMemoryValidationError[],
  seen: Set<unknown>,
) {
  if (value === undefined) {
    issue(errors, 'undefined-value', path, 'Undefined is not JSON serializable.');
    return;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    issue(errors, 'non-finite-number', path, 'Numbers must be finite.');
    return;
  }
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
    issue(errors, 'serialization-error', path, `Unsupported value type: ${typeof value}.`);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) {
    issue(errors, 'serialization-error', path, 'Circular references are not supported.');
    return;
  }
  seen.add(value);
  const prototype = Object.getPrototypeOf(value) as object | null;
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    issue(errors, 'serialization-error', path, 'Only plain JSON values are supported.');
    seen.delete(value);
    return;
  }
  Object.entries(value).forEach(([key, item]) =>
    scanSerializable(item, `${path}.${key}`, errors, seen),
  );
  seen.delete(value);
}

function uniqueIds(snapshot: JourneyMemorySnapshot, errors: JourneyMemoryValidationError[]) {
  const collections = [
    ['entries', snapshot.entries],
    ['cardPatterns', snapshot.cardPatterns],
    ['numberPatterns', snapshot.numberPatterns],
    ['recommendationPatterns', snapshot.recommendationPatterns],
    ['transitions', snapshot.transitions],
    ['chapters', snapshot.chapters],
    ['milestones', snapshot.milestones],
  ] as const;
  collections.forEach(([name, values]) => {
    const seen = new Set<string>();
    values.forEach((value, index) => {
      if (seen.has(value.id))
        issue(errors, 'duplicate-id', `snapshot.${name}.${index}.id`, `Duplicate ID: ${value.id}.`);
      seen.add(value.id);
    });
  });
}

export function validateJourneyMemorySnapshot(snapshot: JourneyMemorySnapshot) {
  const errors: JourneyMemoryValidationError[] = [];
  scanSerializable(snapshot, 'snapshot', errors, new Set());
  Object.entries(JOURNEY_MEMORY_VERSIONS).forEach(([key, expected]) => {
    if (snapshot.metadata.versions[key as keyof typeof JOURNEY_MEMORY_VERSIONS] !== expected)
      issue(
        errors,
        'invalid-version',
        `snapshot.metadata.versions.${key}`,
        `Expected ${expected}.`,
      );
  });
  uniqueIds(snapshot, errors);
  if (Number.isNaN(Date.parse(snapshot.metadata.generatedAt)))
    issue(
      errors,
      'invalid-chronology',
      'snapshot.metadata.generatedAt',
      'Generated timestamp must be a valid ISO date.',
    );
  const entryIds = new Set(snapshot.entries.map((entry) => entry.id));
  snapshot.entries.forEach((entry, index) => {
    if (Number.isNaN(Date.parse(entry.createdAt)))
      issue(
        errors,
        'invalid-chronology',
        `snapshot.entries.${index}.createdAt`,
        'Entry timestamp must be valid.',
      );
    if (index > 0 && (snapshot.entries[index - 1]?.createdAt ?? '') > entry.createdAt)
      issue(
        errors,
        'invalid-chronology',
        `snapshot.entries.${index}`,
        'Entries must be chronological.',
      );
  });
  const includedEntries = new Set<string>();
  snapshot.chapters.forEach((chapter, index) => {
    if (chapter.ordinal !== index + 1)
      issue(
        errors,
        'invalid-chronology',
        `snapshot.chapters.${index}.ordinal`,
        'Chapter ordinals must be sequential.',
      );
    if (chapter.dateRange.from > chapter.dateRange.to)
      issue(
        errors,
        'invalid-chronology',
        `snapshot.chapters.${index}.dateRange`,
        'Invalid chapter date range.',
      );
    const linkedEntries = chapter.linkedEntryIds
      .map((id) => snapshot.entries.find((entry) => entry.id === id))
      .filter((entry) => entry !== undefined);
    if (
      linkedEntries.length &&
      (chapter.dateRange.from !== linkedEntries[0]?.createdAt ||
        chapter.dateRange.to !== linkedEntries.at(-1)?.createdAt)
    )
      issue(
        errors,
        'invalid-chronology',
        `snapshot.chapters.${index}.dateRange`,
        'Chapter range must match linked entries.',
      );
    if (chapter.bookmarked !== linkedEntries.some((entry) => entry.bookmarked))
      issue(
        errors,
        'invalid-reference',
        `snapshot.chapters.${index}.bookmarked`,
        'Chapter bookmark state must match linked entries.',
      );
    if (chapter.quoteCandidate && classifyUnsafeClaims(chapter.quoteCandidate.text).length)
      issue(
        errors,
        'invalid-reference',
        `snapshot.chapters.${index}.quoteCandidate`,
        'Chapter quote contains an unsafe claim.',
      );
    if (
      index > 0 &&
      chapter.quoteCandidate?.text === snapshot.chapters[index - 1]?.quoteCandidate?.text
    )
      issue(
        errors,
        'invalid-reference',
        `snapshot.chapters.${index}.quoteCandidate`,
        'Adjacent chapters cannot repeat a quote.',
      );
    chapter.linkedEntryIds.forEach((id) => {
      if (!entryIds.has(id))
        issue(
          errors,
          'invalid-reference',
          `snapshot.chapters.${index}.linkedEntryIds`,
          `Unknown entry: ${id}.`,
        );
      if (includedEntries.has(id))
        issue(
          errors,
          'duplicate-entry-inclusion',
          `snapshot.chapters.${index}.linkedEntryIds`,
          `Entry belongs to more than one chapter: ${id}.`,
        );
      includedEntries.add(id);
    });
  });
  if (includedEntries.size !== entryIds.size)
    issue(
      errors,
      'invalid-reference',
      'snapshot.chapters',
      'Every entry must belong to one chapter.',
    );
  const validTrends = new Set([
    'emerging',
    'fading',
    'intensifying',
    'isolated',
    'recurring',
    'resolved',
    'stable',
  ]);
  snapshot.trends.forEach((trend, index) => {
    if (!validTrends.has(trend.currentTrend))
      issue(
        errors,
        'invalid-trend',
        `snapshot.trends.${index}.currentTrend`,
        'Unknown theme trend.',
      );
    trend.occurrences.forEach((occurrence) => {
      if (!entryIds.has(occurrence.entryId))
        issue(
          errors,
          'invalid-reference',
          `snapshot.trends.${index}.occurrences`,
          `Unknown entry: ${occurrence.entryId}.`,
        );
    });
    if (
      (trend.currentTrend === 'isolated' && trend.occurrenceCount !== 1) ||
      (trend.currentTrend === 'emerging' && trend.occurrenceCount !== 2) ||
      (trend.currentTrend === 'intensifying' && trend.consecutiveCount < 3)
    )
      issue(
        errors,
        'invalid-trend',
        `snapshot.trends.${index}`,
        'Trend classification is inconsistent with its occurrences.',
      );
  });
  snapshot.recurringThemes.forEach((theme, index) => {
    if (theme.occurrenceCount < 2)
      issue(
        errors,
        'invalid-trend',
        `snapshot.recurringThemes.${index}`,
        'A recurring theme requires at least two occurrences.',
      );
  });
  snapshot.transitions.forEach((transition, index) => {
    if (!entryIds.has(transition.fromEntryId) || !entryIds.has(transition.toEntryId))
      issue(
        errors,
        'invalid-reference',
        `snapshot.transitions.${index}`,
        'Transition references an unknown entry.',
      );
    const fromIndex = snapshot.entries.findIndex((entry) => entry.id === transition.fromEntryId);
    const toIndex = snapshot.entries.findIndex((entry) => entry.id === transition.toEntryId);
    if (toIndex !== fromIndex + 1)
      issue(
        errors,
        'invalid-chronology',
        `snapshot.transitions.${index}`,
        'Transitions must connect adjacent entries.',
      );
  });
  snapshot.numberPatterns.forEach((pattern, index) => {
    if (pattern.systemVersions.length > 1 && pattern.compatibility === 'compatible')
      issue(
        errors,
        'invalid-version',
        `snapshot.numberPatterns.${index}.compatibility`,
        'Mixed calculation systems cannot be compatible.',
      );
    pattern.entryIds.forEach((id) => {
      if (!entryIds.has(id))
        issue(
          errors,
          'invalid-reference',
          `snapshot.numberPatterns.${index}.entryIds`,
          `Unknown entry: ${id}.`,
        );
    });
  });
  snapshot.cardPatterns.forEach((pattern, index) => {
    pattern.entryIds.forEach((id) => {
      if (!entryIds.has(id))
        issue(
          errors,
          'invalid-reference',
          `snapshot.cardPatterns.${index}.entryIds`,
          `Unknown entry: ${id}.`,
        );
    });
  });
  snapshot.recommendationPatterns.forEach((pattern, index) => {
    pattern.entryIds.forEach((id) => {
      if (!entryIds.has(id))
        issue(
          errors,
          'invalid-reference',
          `snapshot.recommendationPatterns.${index}.entryIds`,
          `Unknown entry: ${id}.`,
        );
    });
  });
  snapshot.milestones.forEach((milestone, index) => {
    if (!milestone.entryIds.length || milestone.entryIds.some((id) => !entryIds.has(id)))
      issue(
        errors,
        'inconsistent-milestone',
        `snapshot.milestones.${index}`,
        'Milestone references are inconsistent.',
      );
    if (milestone.type === 'tenth-reading' && milestone.entryIds.length !== 10)
      issue(
        errors,
        'inconsistent-milestone',
        `snapshot.milestones.${index}`,
        'Tenth-reading milestone requires ten entries.',
      );
  });
  snapshot.yearSummaries.forEach((summary, index) => {
    const entries = snapshot.entries.filter(
      (entry) => Number(entry.createdAt.slice(0, 4)) === summary.year,
    );
    const chapters = snapshot.chapters.filter((chapter) =>
      chapter.linkedEntryIds.some((id) => entries.some((entry) => entry.id === id)),
    );
    if (
      summary.entryCount !== entries.length ||
      summary.chapterCount !== chapters.length ||
      summary.bookmarkedCount !== entries.filter((entry) => entry.bookmarked).length ||
      summary.firstEntryDate !== (entries[0]?.createdAt ?? '') ||
      summary.lastEntryDate !== (entries.at(-1)?.createdAt ?? '')
    )
      issue(
        errors,
        'inconsistent-year-summary',
        `snapshot.yearSummaries.${index}`,
        'Year summary does not match entries.',
      );
  });
  try {
    const serialized = JSON.stringify(snapshot);
    if (JSON.stringify(JSON.parse(serialized)) !== serialized)
      issue(errors, 'serialization-error', 'snapshot', 'JSON round-trip is not stable.');
  } catch {
    issue(errors, 'serialization-error', 'snapshot', 'Snapshot cannot be serialized.');
  }
  return { errors, valid: errors.length === 0 };
}
