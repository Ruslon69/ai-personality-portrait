import type { JourneyRecurringTheme, JourneyTransition } from '../../journey-memory/types';
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
