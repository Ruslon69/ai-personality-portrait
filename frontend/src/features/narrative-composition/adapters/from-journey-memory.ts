import type { JourneyRecurringTheme, JourneyTransition } from '../../journey-memory/types';
import type { ReadingContinuityContext } from '../../journey-memory/types';
import type { NarrativeMemoryContext } from '../types';
import { uniqueValues } from '../utils';

export function narrativeMemoryContextFromSnapshot(snapshot: {
  recurringThemes: readonly Pick<JourneyRecurringTheme, 'currentTrend' | 'themeId'>[];
  transitions: readonly Pick<JourneyTransition, 'id'>[];
}): NarrativeMemoryContext {
  return {
    emergingThemeIds: uniqueValues(
      snapshot.recurringThemes
        .filter((theme) => theme.currentTrend === 'emerging')
        .map((theme) => theme.themeId),
    ),
    recurringThemeIds: uniqueValues(
      snapshot.recurringThemes
        .filter((theme) => ['intensifying', 'recurring', 'stable'].includes(theme.currentTrend))
        .map((theme) => theme.themeId),
    ),
    resolvedThemeIds: uniqueValues(
      snapshot.recurringThemes
        .filter((theme) => theme.currentTrend === 'resolved')
        .map((theme) => theme.themeId),
    ),
    transitionIds: uniqueValues(snapshot.transitions.map((transition) => transition.id)),
  };
}

export function narrativeMemoryContextFromContinuity(
  continuity: ReadingContinuityContext,
): NarrativeMemoryContext {
  return {
    emergingThemeIds: uniqueValues(continuity.emergingThemes.map((theme) => theme.themeId)),
    fadingThemeIds: uniqueValues(continuity.fadingThemes.map((theme) => theme.themeId)),
    lastRelatedEntryId: continuity.lastRelatedReading?.id ?? null,
    recurringThemeIds: uniqueValues(continuity.recurringThemes.map((theme) => theme.themeId)),
    repeatedCardIds: uniqueValues(continuity.repeatedCards.flatMap((pattern) => pattern.cardIds)),
    repeatedPracticalFocusIds: uniqueValues(
      continuity.repeatedPracticalFocuses.flatMap((pattern) => pattern.semanticIds),
    ),
    resolvedThemeIds: uniqueValues(continuity.resolvedThemes.map((theme) => theme.themeId)),
    transitionIds: uniqueValues(continuity.recentTransitions.map((transition) => transition.id)),
  };
}
