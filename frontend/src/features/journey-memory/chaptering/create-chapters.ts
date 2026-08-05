import { classifyUnsafeClaims } from '@features/expert-interpretation';

import type {
  JourneyChapter,
  JourneyChapterTitle,
  JourneyChapterTitleCategory,
  JourneyMemoryEntry,
  JourneyMemoryQuoteSource,
  JourneyMilestone,
  JourneyRecurringTheme,
  JourneyTransition,
} from '../types';
import { daysBetween, stableId, uniqueSorted } from '../utils';

function titleCategory(
  entries: readonly JourneyMemoryEntry[],
  transition: JourneyTransition | undefined,
  recurringTheme: JourneyRecurringTheme | undefined,
): JourneyChapterTitleCategory {
  const entry = entries[0];
  if (!entry) return 'beginning';
  if (transition?.type === 'unresolved-theme-returned') return 'return';
  if (transition?.type === 'numerology-period-changed') return 'new-cycle';
  if (recurringTheme?.currentTrend === 'resolved') return 'completion';
  if (recurringTheme?.currentTrend === 'intensifying') return 'growth';
  if (entry.topic === 'love') return 'relationship';
  if (entry.topic === 'work') return 'work';
  if (entry.topic === 'money') return 'money';
  if (entry.topic === 'decision') return 'choice';
  if (entry.leadingTheme?.includes('boundary')) return 'boundary';
  if (entry.leadingTheme?.includes('pause') || entry.leadingTheme?.includes('hermit'))
    return 'pause';
  if (entry.period === 'year') return 'new-cycle';
  if (entry.kind === 'personality-profile') return 'inner-focus';
  return entries.length > 1 ? 'transition' : 'beginning';
}

function titleConcept(
  category: JourneyChapterTitleCategory,
  leadingTheme: string | null,
  prefix: 'subtitle' | 'title',
): JourneyChapterTitle {
  return {
    category,
    key: `journey.chapter.${prefix}.${category}`,
    params: { theme: leadingTheme ?? 'open' },
  };
}

function selectQuote(
  entries: readonly JourneyMemoryEntry[],
  previousQuote: JourneyMemoryQuoteSource | null,
  transition: JourneyTransition | undefined,
) {
  const candidates = entries
    .flatMap((entry) => entry.quoteSources)
    .filter(
      (quote) =>
        quote.text.trim().length >= 12 &&
        quote.text.trim().length <= 180 &&
        classifyUnsafeClaims(quote.text).length === 0 &&
        quote.text !== previousQuote?.text,
    );
  const candidate = candidates[0];
  if (candidate) return candidate;
  if (transition) {
    return {
      id: transition.id,
      kind: 'transition' as const,
      strength: 'secondary' as const,
      text: transition.semanticSummary.key,
    };
  }
  return null;
}

function groupEntries(entries: readonly JourneyMemoryEntry[]) {
  const groups: JourneyMemoryEntry[][] = [];
  entries.forEach((entry) => {
    const current = groups.at(-1);
    const previous = current?.at(-1);
    if (
      current &&
      previous &&
      entry.leadingTheme !== null &&
      entry.leadingTheme === previous.leadingTheme &&
      daysBetween(previous.createdAt, entry.createdAt) <= 31
    ) {
      current.push(entry);
    } else {
      groups.push([entry]);
    }
  });
  return groups;
}

export function createJourneyChaptersV1(input: {
  entries: readonly JourneyMemoryEntry[];
  milestones: readonly JourneyMilestone[];
  recurringThemes: readonly JourneyRecurringTheme[];
  transitions: readonly JourneyTransition[];
}): readonly JourneyChapter[] {
  let previousQuote: JourneyMemoryQuoteSource | null = null;
  return groupEntries(input.entries).map((entries, index) => {
    const first = entries[0];
    const last = entries.at(-1);
    if (!first || !last) throw new Error('Chapter group cannot be empty.');
    const transition = input.transitions.find((item) => item.toEntryId === first.id);
    const recurring = input.recurringThemes.find((theme) => theme.themeId === first.leadingTheme);
    const category = titleCategory(entries, transition, recurring);
    const quoteCandidate = selectQuote(entries, previousQuote, transition);
    previousQuote = quoteCandidate;
    const cards = entries.flatMap((entry) => entry.cards.map((card) => card.id));
    const numbers = entries.flatMap((entry) => entry.numbers.map((number) => number.value));
    const milestone = input.milestones.find((item) =>
      item.entryIds.some((id) => entries.some((entry) => entry.id === id)),
    );
    return {
      bookmarked: entries.some((entry) => entry.bookmarked),
      dateRange: { from: first.createdAt, to: last.createdAt },
      id: stableId(
        'journey-chapter',
        entries.map((entry) => entry.id),
      ),
      leadingTheme: first.leadingTheme,
      linkedEntryIds: entries.map((entry) => entry.id),
      milestoneType: milestone?.type ?? null,
      ordinal: index + 1,
      quoteCandidate,
      representativeCard: cards[0] ?? null,
      representativeNumber: numbers[0] ?? null,
      subtitleConcept: titleConcept(category, first.leadingTheme, 'subtitle'),
      supportingThemes: uniqueSorted(entries.flatMap((entry) => entry.supportingThemes)).slice(
        0,
        4,
      ),
      titleConcept: titleConcept(category, first.leadingTheme, 'title'),
    };
  });
}
