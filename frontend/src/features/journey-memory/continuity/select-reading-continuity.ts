import type {
  JourneyMemoryEntry,
  JourneyMemorySnapshot,
  JourneyRecurringTheme,
  ReadingContinuityContext,
  ReadingContinuityEntry,
  ReadingContinuityQuery,
  ReadingContinuityTheme,
} from '../types';
import { stableHash, stableStringify, uniqueSorted } from '../utils';
import { canonicalThemeId } from '../normalization/normalize-entries';

const LIMITS = {
  cards: 3,
  entries: 10,
  focuses: 3,
  numbers: 3,
  themes: 5,
  transitions: 3,
} as const;

function originalReadingId(entry: JourneyMemoryEntry) {
  return entry.sourceReferences
    .find((reference) => reference.kind === 'reading')
    ?.id.replace(/^reading:/u, '');
}

function hasCompatibleLineage(entry: JourneyMemoryEntry, query: ReadingContinuityQuery) {
  const comparable = Object.entries(query.sourceEngineVersions).filter(
    ([key]) => entry.engineVersions[key] !== undefined,
  );
  return comparable.every(([key, version]) => entry.engineVersions[key] === version);
}

function overlap<T>(left: readonly T[], right: readonly T[]) {
  const target = new Set(right);
  return left.filter((value) => target.has(value));
}

function relevance(entry: JourneyMemoryEntry, query: ReadingContinuityQuery, recency: number) {
  const entryThemes = [entry.leadingTheme, ...entry.supportingThemes].filter(
    (theme): theme is string => theme !== null,
  );
  const themeMatches = overlap(entryThemes, query.themeIds.map(canonicalThemeId)).length;
  const cardMatches = overlap(
    entry.cards.map((card) => card.id),
    query.cardIds,
  ).length;
  const numberMatches = overlap(
    entry.numbers.map((number) => number.value),
    query.numberValues,
  ).length;
  const semanticScore =
    themeMatches * 16 +
    cardMatches * 14 +
    numberMatches * 5 +
    (entry.topic !== null && entry.topic === query.topic ? 24 : 0) +
    (entry.spreadId === query.spreadId ? 18 : 0);
  return semanticScore < 12 ? 0 : semanticScore + Math.max(0, 10 - recency);
}

function compactEntry(entry: JourneyMemoryEntry, score: number): ReadingContinuityEntry {
  return {
    cardIds: uniqueSorted(entry.cards.map((card) => card.id)),
    createdAt: entry.createdAt,
    id: entry.id,
    leadingTheme: entry.leadingTheme,
    numberValues: uniqueSorted(entry.numbers.map((number) => number.value)),
    practicalFocusIds: uniqueSorted(entry.practicalFocuses.map((focus) => focus.semanticId)),
    relevance: score,
    spreadId: entry.spreadId,
    supportingThemes: uniqueSorted(entry.supportingThemes),
    topic: entry.topic,
  };
}

function compactTheme(theme: JourneyRecurringTheme): ReadingContinuityTheme {
  return {
    occurrenceCount: theme.occurrenceCount,
    relatedCardIds: uniqueSorted(theme.relatedCards),
    relatedEntryIds: uniqueSorted(theme.occurrences.map((occurrence) => occurrence.entryId)),
    relatedNumberValues: uniqueSorted(theme.relatedNumbers),
    themeId: theme.themeId,
    trend: theme.currentTrend,
  };
}

function selectThemes(
  snapshot: JourneyMemorySnapshot,
  selectedIds: ReadonlySet<string>,
  trends: readonly JourneyRecurringTheme['currentTrend'][],
) {
  return snapshot.recurringThemes
    .filter(
      (theme) =>
        trends.includes(theme.currentTrend) &&
        theme.occurrences.some((occurrence) => selectedIds.has(occurrence.entryId)),
    )
    .sort(
      (left, right) =>
        right.occurrenceCount - left.occurrenceCount || left.themeId.localeCompare(right.themeId),
    )
    .slice(0, LIMITS.themes)
    .map(compactTheme);
}

export function selectReadingContinuityContext(
  snapshot: JourneyMemorySnapshot,
  query: ReadingContinuityQuery,
): ReadingContinuityContext {
  const newestFirst = [...snapshot.entries].sort(
    (left, right) =>
      right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id),
  );
  const relevant = newestFirst
    .filter(
      (entry) =>
        entry.id !== query.currentReadingId &&
        originalReadingId(entry) !== query.currentReadingId &&
        hasCompatibleLineage(entry, query),
    )
    .map((entry, index) => ({ entry, score: relevance(entry, query, index) }))
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.entry.createdAt.localeCompare(left.entry.createdAt) ||
        left.entry.id.localeCompare(right.entry.id),
    )
    .slice(0, LIMITS.entries)
    .map(({ entry, score }) => compactEntry(entry, score));
  const selectedIds = new Set(relevant.map((entry) => entry.id));
  const entryDates = new Map(snapshot.entries.map((entry) => [entry.id, entry.createdAt]));
  const recurringThemes = selectThemes(snapshot, selectedIds, [
    'recurring',
    'intensifying',
    'stable',
  ]);
  const emergingThemes = selectThemes(snapshot, selectedIds, ['emerging']);
  const fadingThemes = selectThemes(snapshot, selectedIds, ['fading']);
  const resolvedThemes = selectThemes(snapshot, selectedIds, ['resolved']);
  const repeatedCards = snapshot.cardPatterns
    .filter(
      (pattern) =>
        pattern.entryIds.some((id) => selectedIds.has(id)) &&
        pattern.cardIds.some((id) => query.cardIds.includes(id)),
    )
    .sort(
      (left, right) =>
        right.occurrenceCount - left.occurrenceCount || left.id.localeCompare(right.id),
    )
    .slice(0, LIMITS.cards)
    .map((pattern) => ({
      cardIds: uniqueSorted(pattern.cardIds),
      entryIds: uniqueSorted(pattern.entryIds),
      id: pattern.id,
      relation: pattern.relation,
      semanticId: pattern.semanticId,
    }));
  const repeatedNumbers = snapshot.numberPatterns
    .filter(
      (pattern) =>
        pattern.entryIds.some((id) => selectedIds.has(id)) &&
        pattern.values.some((value) => query.numberValues.includes(value)),
    )
    .sort((left, right) => left.id.localeCompare(right.id))
    .slice(0, LIMITS.numbers)
    .map((pattern) => ({
      compatibility: pattern.compatibility,
      entryIds: uniqueSorted(pattern.entryIds),
      id: pattern.id,
      values: uniqueSorted(pattern.values),
    }));
  const repeatedPracticalFocuses = snapshot.recommendationPatterns
    .filter((pattern) => pattern.entryIds.some((id) => selectedIds.has(id)))
    .sort(
      (left, right) =>
        right.occurrenceCount - left.occurrenceCount || left.id.localeCompare(right.id),
    )
    .slice(0, LIMITS.focuses)
    .map((pattern) => ({
      category: pattern.category,
      entryIds: uniqueSorted(pattern.entryIds),
      id: pattern.id,
      semanticIds: uniqueSorted(pattern.semanticIds),
    }));
  const recentTransitions = snapshot.transitions
    .filter(
      (transition) =>
        selectedIds.has(transition.fromEntryId) || selectedIds.has(transition.toEntryId),
    )
    .sort(
      (left, right) =>
        (entryDates.get(right.toEntryId) ?? '').localeCompare(
          entryDates.get(left.toEntryId) ?? '',
        ) || left.id.localeCompare(right.id),
    )
    .slice(0, LIMITS.transitions);
  const memoryFingerprint = stableHash(
    stableStringify({
      entries: relevant.map((entry) => entry.id),
      snapshot: snapshot.metadata.entryFingerprint,
      themes: [...recurringThemes, ...emergingThemes, ...fadingThemes, ...resolvedThemes].map(
        (theme) => `${theme.themeId}:${theme.trend}`,
      ),
      transitions: recentTransitions.map((transition) => transition.id),
    }),
  );
  return {
    continuityVersion: 'reading-continuity-v1',
    emergingThemes,
    fadingThemes,
    journeySnapshotVersion: snapshot.metadata.versions.engine,
    lastRelatedReading:
      [...relevant].sort(
        (left, right) =>
          right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id),
      )[0] ?? null,
    memoryFingerprint,
    previousRelevantEntries: relevant,
    recentTransitions,
    recurringThemes,
    repeatedCards,
    repeatedNumbers,
    repeatedPracticalFocuses,
    resolvedThemes,
  };
}

export function hasReadingContinuity(context: ReadingContinuityContext) {
  return context.previousRelevantEntries.length > 0;
}
