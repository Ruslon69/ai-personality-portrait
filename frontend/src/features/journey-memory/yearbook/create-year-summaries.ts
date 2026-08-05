import type {
  JourneyCardPattern,
  JourneyChapter,
  JourneyMemoryEntry,
  JourneyNumberPattern,
  JourneyRecommendationPattern,
  JourneyRecurringTheme,
  JourneyTransition,
  JourneyYearSummary,
} from '../types';
import { uniqueSorted, yearFromIso } from '../utils';

export function createJourneyYearSummaries(input: {
  cardPatterns: readonly JourneyCardPattern[];
  chapters: readonly JourneyChapter[];
  entries: readonly JourneyMemoryEntry[];
  numberPatterns: readonly JourneyNumberPattern[];
  recommendationPatterns: readonly JourneyRecommendationPattern[];
  themes: readonly JourneyRecurringTheme[];
  transitions: readonly JourneyTransition[];
}): readonly JourneyYearSummary[] {
  const years = uniqueSorted(input.entries.map((entry) => yearFromIso(entry.createdAt)));
  return years.map((year) => {
    const entries = input.entries.filter((entry) => yearFromIso(entry.createdAt) === year);
    const entryIds = new Set(entries.map((entry) => entry.id));
    const chapters = input.chapters.filter((chapter) =>
      chapter.linkedEntryIds.some((id) => entryIds.has(id)),
    );
    const transitions = input.transitions.filter(
      (transition) => entryIds.has(transition.fromEntryId) && entryIds.has(transition.toEntryId),
    );
    const themes = input.themes.filter((theme) =>
      theme.occurrences.some((occurrence) => entryIds.has(occurrence.entryId)),
    );
    const versions = Object.fromEntries(
      uniqueSorted(entries.flatMap((entry) => Object.keys(entry.engineVersions))).map((key) => [
        key,
        uniqueSorted(entries.flatMap((entry) => entry.engineVersions[key] ?? [])).join('|'),
      ]),
    );
    return {
      bookmarkedCount: entries.filter((entry) => entry.bookmarked).length,
      chapterCount: chapters.length,
      emergingThemes: themes
        .filter((theme) => theme.currentTrend === 'emerging')
        .map((theme) => theme.themeId),
      engineVersions: versions,
      entryCount: entries.length,
      fadingThemes: themes
        .filter((theme) => ['fading', 'resolved'].includes(theme.currentTrend))
        .map((theme) => theme.themeId),
      firstEntryDate: entries[0]?.createdAt ?? '',
      keyPracticalFocuses: input.recommendationPatterns
        .filter((pattern) => pattern.entryIds.some((id) => entryIds.has(id)))
        .sort((left, right) => right.occurrenceCount - left.occurrenceCount)
        .map((pattern) => pattern.category)
        .slice(0, 5),
      lastEntryDate: entries.at(-1)?.createdAt ?? '',
      mostRecurringThemes: [...themes]
        .sort((left, right) => right.occurrenceCount - left.occurrenceCount)
        .map((theme) => theme.themeId)
        .slice(0, 5),
      repeatedCards: uniqueSorted(
        input.cardPatterns
          .filter(
            (pattern) =>
              pattern.patternType === 'repeated-card' &&
              pattern.entryIds.some((id) => entryIds.has(id)),
          )
          .flatMap((pattern) => pattern.cardIds),
      ),
      repeatedNumbers: uniqueSorted(
        input.numberPatterns
          .filter((pattern) => pattern.entryIds.some((id) => entryIds.has(id)))
          .flatMap((pattern) => pattern.values),
      ),
      representativeQuote:
        chapters.find((chapter) => chapter.quoteCandidate)?.quoteCandidate ?? null,
      strongestTransitions: transitions
        .filter((transition) => transition.confidence !== 'contextual')
        .map((transition) => transition.id)
        .slice(0, 5),
      year,
    };
  });
}
