import type {
  JourneyCardPattern,
  JourneyMemoryEntry,
  JourneyNumberPattern,
  JourneyRecommendationPattern,
  JourneyRecurringTheme,
} from '../types';
import { stableId, uniqueSorted } from '../utils';

function interrupted(entryIndexes: readonly number[]) {
  return entryIndexes.some(
    (value, index) => index > 0 && value - (entryIndexes[index - 1] ?? 0) > 1,
  );
}

function orderedEntryIds(ids: readonly string[], entries: readonly JourneyMemoryEntry[]) {
  return [...new Set(ids)].sort(
    (left, right) =>
      entries.findIndex((entry) => entry.id === left) -
      entries.findIndex((entry) => entry.id === right),
  );
}

export function recurringJourneyThemes(
  tracked: readonly JourneyRecurringTheme[],
): readonly JourneyRecurringTheme[] {
  return tracked.filter(
    (theme) =>
      theme.occurrenceCount >= 2 &&
      new Set(theme.occurrences.map((item) => item.entryId)).size >= 2,
  );
}

export function findJourneyCardPatterns(
  entries: readonly JourneyMemoryEntry[],
): readonly JourneyCardPattern[] {
  const candidates = new Map<
    string,
    { cardIds: string[]; entryIds: string[]; patternType: JourneyCardPattern['patternType'] }
  >();
  const add = (
    semanticId: string,
    patternType: JourneyCardPattern['patternType'],
    entryId: string,
    cardId: string,
  ) => {
    const current = candidates.get(semanticId) ?? { cardIds: [], entryIds: [], patternType };
    current.cardIds.push(cardId);
    current.entryIds.push(entryId);
    candidates.set(semanticId, current);
  };
  entries.forEach((entry) => {
    entry.cards.forEach((card) => {
      add(`card:${card.id}`, 'repeated-card', entry.id, card.id);
      if (card.arcana === 'major') add(`major:${card.id}`, 'major-arcana', entry.id, card.id);
      if (card.suit) add(`suit:${card.suit}`, 'suit', entry.id, card.id);
      if (card.arcana === 'minor' && card.number >= 11)
        add(`court:${card.number}`, 'court-role', entry.id, card.id);
      if (card.reversedMode)
        add(`reversed:${card.reversedMode}`, 'reversed-mode', entry.id, card.id);
      add(`position:${card.positionId}:${card.orientation}`, 'card-position', entry.id, card.id);
    });
  });
  return [...candidates.entries()]
    .filter(([, value]) => new Set(value.entryIds).size >= 2)
    .map(([semanticId, value]) => {
      const entryIds = orderedEntryIds(value.entryIds, entries);
      const indexes = entryIds.map((id) => entries.findIndex((entry) => entry.id === id));
      const cards = entries
        .filter((entry) => entryIds.includes(entry.id))
        .flatMap((entry) => entry.cards)
        .filter((card) => value.cardIds.includes(card.id));
      const orientations = new Set(cards.map((card) => card.orientation));
      const relation =
        orientations.size > 1
          ? 'contrast'
          : cards.every((card) => card.orientation === 'reversed')
            ? 'unresolved-sequence'
            : interrupted(indexes)
              ? 'interruption'
              : new Set(cards.map((card) => card.positionId)).size > 1
                ? 'progression'
                : 'recurrence';
      return {
        cardIds: uniqueSorted(value.cardIds),
        entryIds,
        id: stableId('journey-card-pattern', semanticId),
        occurrenceCount: value.entryIds.length,
        patternType: value.patternType,
        relation,
        semanticId,
      } satisfies JourneyCardPattern;
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function findJourneyNumberPatterns(
  entries: readonly JourneyMemoryEntry[],
): readonly JourneyNumberPattern[] {
  const patterns: JourneyNumberPattern[] = [];
  const groups = new Map<string, { entryIds: string[]; systems: string[]; values: number[] }>();
  entries.forEach((entry) => {
    entry.numbers.forEach((number) => {
      const key = `${number.calculationId}:${number.value}`;
      const current = groups.get(key) ?? { entryIds: [], systems: [], values: [] };
      current.entryIds.push(entry.id);
      current.systems.push(number.systemVersion);
      current.values.push(number.value);
      groups.set(key, current);
    });
  });
  groups.forEach((group, key) => {
    const entryIds = orderedEntryIds(group.entryIds, entries);
    if (entryIds.length < 2 && !group.values.some((value) => [11, 22, 33].includes(value))) return;
    const systems = uniqueSorted(group.systems);
    const calculationId = key.split(':')[0] ?? '';
    patterns.push({
      calculationIds: [calculationId],
      compatibility: systems.length === 1 ? 'compatible' : 'separate-lineage',
      entryIds,
      id: stableId('journey-number-pattern', { key, systems }),
      kind: group.values.some((value) => [11, 22, 33].includes(value))
        ? 'master-number'
        : calculationId.includes('personal-')
          ? 'period-repetition'
          : 'repeated-number',
      systemVersions: systems,
      values: uniqueSorted(group.values),
    });
  });
  entries.slice(1).forEach((entry, index) => {
    const previous = entries[index];
    const from = previous?.numbers.find((item) => item.calculationId === 'personal-year');
    const to = entry.numbers.find((item) => item.calculationId === 'personal-year');
    if (!previous || !from || !to || from.value === to.value) return;
    const systems = uniqueSorted([from.systemVersion, to.systemVersion]);
    patterns.push({
      calculationIds: ['personal-year'],
      compatibility: systems.length === 1 ? 'compatible' : 'incompatible',
      entryIds: [previous.id, entry.id],
      id: stableId('journey-number-transition', {
        from: from.value,
        to: to.value,
        entry: entry.id,
      }),
      kind: 'personal-year-transition',
      systemVersions: systems,
      values: [from.value, to.value],
    });
  });
  entries.forEach((entry) => {
    entry.cards.forEach((card) => {
      entry.numbers.forEach((number) => {
        if (card.number !== number.value) return;
        patterns.push({
          calculationIds: [number.calculationId],
          compatibility: 'compatible',
          entryIds: [entry.id],
          id: stableId('journey-card-number', {
            card: card.id,
            entry: entry.id,
            value: number.value,
          }),
          kind: 'card-number-resonance',
          systemVersions: [number.systemVersion],
          values: [number.value],
        });
      });
    });
  });
  return patterns.sort((left, right) => left.id.localeCompare(right.id));
}

export function findJourneyRecommendationPatterns(
  entries: readonly JourneyMemoryEntry[],
): readonly JourneyRecommendationPattern[] {
  const groups = new Map<string, { entryIds: string[]; semanticIds: string[] }>();
  entries.forEach((entry) => {
    entry.practicalFocuses.forEach((focus) => {
      const current = groups.get(focus.category) ?? { entryIds: [], semanticIds: [] };
      current.entryIds.push(entry.id);
      current.semanticIds.push(focus.semanticId);
      groups.set(focus.category, current);
    });
  });
  return [...groups.entries()]
    .filter(([, group]) => new Set(group.entryIds).size >= 2)
    .map(([category, group]) => ({
      category: category as JourneyRecommendationPattern['category'],
      entryIds: orderedEntryIds(group.entryIds, entries),
      id: stableId('journey-recommendation-pattern', category),
      occurrenceCount: group.entryIds.length,
      semanticIds: uniqueSorted(group.semanticIds),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}
