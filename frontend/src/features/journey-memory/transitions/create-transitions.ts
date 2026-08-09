import type {
  JourneyMemoryEntry,
  JourneyMemorySourceReference,
  JourneyTransition,
  JourneyTransitionType,
} from '../types';
import { stableId, uniqueSorted } from '../utils';

function reference(entryId: string, id: string, kind: JourneyMemorySourceReference['kind']) {
  return { id: `${entryId}:${id}`, kind, source: 'journey' as const };
}

function addTransition(
  transitions: JourneyTransition[],
  from: JourneyMemoryEntry,
  to: JourneyMemoryEntry,
  type: JourneyTransitionType,
  evidence: readonly JourneyMemorySourceReference[],
  params: Readonly<Record<string, string | number>>,
  confidence: JourneyTransition['confidence'] = 'structural',
) {
  transitions.push({
    confidence,
    evidence,
    fromEntryId: from.id,
    id: stableId('journey-transition', { from: from.id, to: to.id, type }),
    semanticSummary: { key: `journey.transition.${type}`, params },
    toEntryId: to.id,
    type,
  });
}

export function createJourneyTransitions(
  entries: readonly JourneyMemoryEntry[],
): readonly JourneyTransition[] {
  const transitions: JourneyTransition[] = [];
  entries.slice(1).forEach((to, index) => {
    const from = entries[index];
    if (!from) return;
    const fromThemes = new Set(from.themes.map((theme) => theme.semanticId));
    const toThemes = new Set(to.themes.map((theme) => theme.semanticId));
    const sharedThemes = [...fromThemes].filter((theme) => toThemes.has(theme));
    if (sharedThemes.length) {
      const theme = sharedThemes[0] ?? '';
      addTransition(
        transitions,
        from,
        to,
        to.leadingTheme === theme && from.leadingTheme !== theme
          ? 'theme-intensified'
          : 'same-theme-new-expression',
        [reference(from.id, theme, 'theme'), reference(to.id, theme, 'theme')],
        { theme },
      );
    }
    if (from.leadingTheme && !toThemes.has(from.leadingTheme)) {
      addTransition(
        transitions,
        from,
        to,
        'theme-weakened',
        [reference(from.id, from.leadingTheme, 'theme')],
        { theme: from.leadingTheme },
        'contextual',
      );
    }
    const returnedTheme = to.themes.find((theme) => {
      if (fromThemes.has(theme.semanticId)) return false;
      return entries
        .slice(0, index)
        .some((entry) => entry.themes.some((item) => item.semanticId === theme.semanticId));
    });
    if (returnedTheme) {
      addTransition(
        transitions,
        from,
        to,
        'unresolved-theme-returned',
        [reference(to.id, returnedTheme.semanticId, 'theme')],
        { theme: returnedTheme.semanticId },
        'contextual',
      );
    }
    const fromFocus = uniqueSorted(from.practicalFocuses.map((focus) => focus.category));
    const toFocus = uniqueSorted(to.practicalFocuses.map((focus) => focus.category));
    if (fromFocus.join(':') !== toFocus.join(':')) {
      addTransition(
        transitions,
        from,
        to,
        'practical-focus-changed',
        [
          reference(from.id, fromFocus.join(','), 'authored-section'),
          reference(to.id, toFocus.join(','), 'authored-section'),
        ],
        { from: fromFocus.join(','), to: toFocus.join(',') },
      );
    }
    const fromCards = uniqueSorted(from.cards.map((card) => `${card.id}:${card.orientation}`));
    const toCards = uniqueSorted(to.cards.map((card) => `${card.id}:${card.orientation}`));
    if (fromCards.join(':') !== toCards.join(':')) {
      addTransition(
        transitions,
        from,
        to,
        'card-pattern-shifted',
        [
          ...from.cards.slice(0, 1).map((card) => reference(from.id, card.id, 'card')),
          ...to.cards.slice(0, 1).map((card) => reference(to.id, card.id, 'card')),
        ],
        { from: from.cards[0]?.id ?? 'none', to: to.cards[0]?.id ?? 'none' },
      );
    }
    const fromYear = from.numbers.find((number) => number.calculationId === 'personal-year');
    const toYear = to.numbers.find((number) => number.calculationId === 'personal-year');
    if (fromYear && toYear && fromYear.value !== toYear.value) {
      addTransition(
        transitions,
        from,
        to,
        'numerology-period-changed',
        [
          reference(from.id, String(fromYear.value), 'number'),
          reference(to.id, String(toYear.value), 'number'),
        ],
        { from: fromYear.value, to: toYear.value },
        fromYear.systemVersion === toYear.systemVersion ? 'direct' : 'contextual',
      );
    }
    (
      [
        ['current-pinnacle', 'pinnacle-transition'],
        ['current-life-cycle', 'life-cycle-transition'],
      ] as const
    ).forEach(([calculationId, type]) => {
      const fromPeriod = from.numbers.find((number) => number.calculationId === calculationId);
      const toPeriod = to.numbers.find((number) => number.calculationId === calculationId);
      if (!fromPeriod || !toPeriod || fromPeriod.value === toPeriod.value) return;
      addTransition(
        transitions,
        from,
        to,
        type,
        [
          reference(from.id, `${calculationId}:${fromPeriod.value}`, 'number'),
          reference(to.id, `${calculationId}:${toPeriod.value}`, 'number'),
        ],
        { from: fromPeriod.value, to: toPeriod.value },
        fromPeriod.systemVersion === toPeriod.systemVersion ? 'direct' : 'contextual',
      );
    });
    if (from.topic !== to.topic) {
      addTransition(
        transitions,
        from,
        to,
        'topic-changed',
        [
          reference(from.id, from.topic ?? 'open', 'reading'),
          reference(to.id, to.topic ?? 'open', 'reading'),
        ],
        { from: from.topic ?? 'open', to: to.topic ?? 'open' },
        'direct',
      );
    }
  });
  return transitions;
}
