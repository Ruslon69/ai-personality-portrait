import type {
  JourneyMemoryEntry,
  JourneyRecurringTheme,
  JourneyThemeOccurrence,
  JourneyThemeTrend,
} from '../types';
import { uniqueSorted } from '../utils';

function trendFor(input: {
  consecutiveCount: number;
  missedEntries: number;
  occurrenceCount: number;
}): JourneyThemeTrend {
  if (input.occurrenceCount === 1) return 'isolated';
  if (input.missedEntries >= 3) return 'resolved';
  if (input.missedEntries > 0) return 'fading';
  if (input.consecutiveCount >= 3) return 'intensifying';
  if (input.occurrenceCount >= 4) return 'stable';
  if (input.occurrenceCount === 2) return 'emerging';
  return 'recurring';
}

function trailingConsecutiveCount(
  entries: readonly JourneyMemoryEntry[],
  entryIds: ReadonlySet<string>,
) {
  let count = 0;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (!entry || !entryIds.has(entry.id)) break;
    count += 1;
  }
  return count;
}

export function trackJourneyThemes(
  entries: readonly JourneyMemoryEntry[],
): readonly JourneyRecurringTheme[] {
  const occurrences = new Map<string, JourneyThemeOccurrence[]>();
  entries.forEach((entry) => {
    entry.themes.forEach((theme) => {
      const current = occurrences.get(theme.semanticId) ?? [];
      current.push({
        cardIds: theme.cardIds,
        entryId: entry.id,
        numberValues: theme.numberValues,
        occurredAt: entry.createdAt,
        sourceIds: theme.sourceIds,
        spreadId: entry.spreadId,
        themeId: theme.semanticId,
        topic: entry.topic,
      });
      occurrences.set(theme.semanticId, current);
    });
  });
  return [...occurrences.entries()]
    .map(([themeId, themeOccurrences]) => {
      const entryIds = new Set(themeOccurrences.map((item) => item.entryId));
      const lastOccurrence = themeOccurrences.at(-1);
      const lastIndex = lastOccurrence
        ? entries.findIndex((entry) => entry.id === lastOccurrence.entryId)
        : -1;
      const missedEntries = Math.max(0, entries.length - 1 - lastIndex);
      const consecutiveCount = trailingConsecutiveCount(entries, entryIds);
      const recencyWeight = themeOccurrences.reduce((total, occurrence) => {
        const index = entries.findIndex((entry) => entry.id === occurrence.entryId);
        return total + 1 / Math.max(1, entries.length - index);
      }, 0);
      return {
        consecutiveCount,
        currentTrend: trendFor({
          consecutiveCount,
          missedEntries,
          occurrenceCount: themeOccurrences.length,
        }),
        firstSeenAt: themeOccurrences[0]?.occurredAt ?? '',
        lastSeenAt: lastOccurrence?.occurredAt ?? '',
        occurrenceCount: themeOccurrences.length,
        occurrences: themeOccurrences,
        recencyWeight: Number(recencyWeight.toFixed(6)),
        relatedCards: uniqueSorted(themeOccurrences.flatMap((item) => item.cardIds)),
        relatedNumbers: uniqueSorted(themeOccurrences.flatMap((item) => item.numberValues)),
        relatedTopics: uniqueSorted(
          themeOccurrences.flatMap((item) => (item.topic ? [item.topic] : [])),
        ),
        sourceDiversity: new Set(themeOccurrences.flatMap((item) => item.sourceIds)).size,
        spreadDiversity: new Set(
          themeOccurrences.flatMap((item) => (item.spreadId ? [item.spreadId] : [])),
        ).size,
        themeId,
      } satisfies JourneyRecurringTheme;
    })
    .sort(
      (left, right) =>
        right.occurrenceCount - left.occurrenceCount || left.themeId.localeCompare(right.themeId),
    );
}
