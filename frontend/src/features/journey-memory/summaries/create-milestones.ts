import type {
  JourneyCardPattern,
  JourneyMemoryEntry,
  JourneyMilestone,
  JourneyNumberPattern,
  JourneyRecurringTheme,
} from '../types';
import { daysBetween, stableId } from '../utils';

function milestone(
  type: JourneyMilestone['type'],
  entryIds: readonly string[],
  occurredAt: string,
  params: Readonly<Record<string, string | number>> = {},
): JourneyMilestone {
  return {
    entryIds,
    id: stableId('journey-milestone', { entryIds, type }),
    occurredAt,
    semanticSummary: { key: `journey.milestone.${type}`, params },
    type,
  };
}

export function createJourneyMilestones(input: {
  cardPatterns: readonly JourneyCardPattern[];
  entries: readonly JourneyMemoryEntry[];
  numberPatterns: readonly JourneyNumberPattern[];
  themes: readonly JourneyRecurringTheme[];
}): readonly JourneyMilestone[] {
  const result: JourneyMilestone[] = [];
  const { entries } = input;
  const first = entries[0];
  if (!first) return result;
  result.push(milestone('first-reading', [first.id], first.createdAt));
  const recurring = input.themes.find((theme) => theme.occurrenceCount >= 2);
  const secondOccurrence = recurring?.occurrences[1];
  if (recurring && secondOccurrence)
    result.push(
      milestone(
        'first-recurring-theme',
        recurring.occurrences.slice(0, 2).map((item) => item.entryId),
        secondOccurrence.occurredAt,
        { theme: recurring.themeId },
      ),
    );
  const repeatedCard = input.cardPatterns.find(
    (pattern) => pattern.patternType === 'repeated-card',
  );
  if (repeatedCard) {
    const entry = entries.find((item) => item.id === repeatedCard.entryIds[1]);
    if (entry)
      result.push(
        milestone('first-repeated-card', repeatedCard.entryIds.slice(0, 2), entry.createdAt, {
          card: repeatedCard.cardIds[0] ?? '',
        }),
      );
  }
  const master = input.numberPatterns.find((pattern) => pattern.kind === 'master-number');
  if (master) {
    const entry = entries.find((item) => master.entryIds.includes(item.id)) ?? first;
    result.push(
      milestone('first-master-number', [entry.id], entry.createdAt, {
        number: master.values[0] ?? 0,
      }),
    );
  }
  const bookmarked = entries.find((entry) => entry.bookmarked);
  if (bookmarked)
    result.push(milestone('first-bookmarked-chapter', [bookmarked.id], bookmarked.createdAt));
  const monthEntry = entries.find((entry) => daysBetween(first.createdAt, entry.createdAt) >= 28);
  if (monthEntry)
    result.push(
      milestone('first-month-completed', [first.id, monthEntry.id], monthEntry.createdAt),
    );
  const yearTransition = entries.slice(1).find((entry, index) => {
    const previous = entries[index];
    const from = previous?.numbers.find((number) => number.calculationId === 'personal-year');
    const to = entry.numbers.find((number) => number.calculationId === 'personal-year');
    return from && to && from.value !== to.value;
  });
  if (yearTransition) {
    const index = entries.findIndex((entry) => entry.id === yearTransition.id);
    const previous = entries[index - 1];
    if (previous)
      result.push(
        milestone(
          'first-year-transition',
          [previous.id, yearTransition.id],
          yearTransition.createdAt,
        ),
      );
  }
  if (entries[9])
    result.push(
      milestone(
        'tenth-reading',
        entries.slice(0, 10).map((entry) => entry.id),
        entries[9].createdAt,
      ),
    );
  const resolved = input.themes.find((theme) => theme.currentTrend === 'resolved');
  if (resolved) {
    const latest = entries.at(-1);
    if (latest)
      result.push(
        milestone(
          'first-resolved-theme',
          resolved.occurrences.map((item) => item.entryId),
          latest.createdAt,
          { theme: resolved.themeId },
        ),
      );
  }
  const returned = entries.slice(1).find((entry, index) => {
    const previous = entries[index];
    return previous && daysBetween(previous.createdAt, entry.createdAt) >= 60;
  });
  if (returned) {
    const index = entries.findIndex((entry) => entry.id === returned.id);
    const previous = entries[index - 1];
    if (previous)
      result.push(
        milestone('return-after-long-pause', [previous.id, returned.id], returned.createdAt),
      );
  }
  return result.sort(
    (left, right) =>
      left.occurredAt.localeCompare(right.occurredAt) || left.id.localeCompare(right.id),
  );
}
