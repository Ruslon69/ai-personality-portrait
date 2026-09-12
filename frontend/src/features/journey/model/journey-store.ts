import { createStore, type Store } from '@store';
import {
  persistJourneyStateToProductStorage,
  readJourneyStateFromProductStorage,
  readPreferencesFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';
import type { TarotReading } from '@features/tarot';
import { enrichTarotReadingWithContinuity } from '@features/tarot';
import { buildJourneyMemorySnapshot, journeyStateToMemorySources } from '@features/journey-memory';

import {
  addTarotHistoryRecord,
  normalizeTarotHistoryRecords,
  removeTarotHistoryRecord,
} from '../lib/tarot-history';
import type { JourneyDailyCard, JourneyState } from '../types';

function createIdentity() {
  if (typeof window === 'undefined') return 'journey-preview';
  return window.crypto?.randomUUID?.() ?? `journey-${Date.now().toString(36)}`;
}

const defaultState: JourneyState = {
  dailyCards: {},
  identity: 'journey-preview',
  readings: [],
};

function currentHistoryLimit() {
  const value = readPreferencesFromProductStorage().tarot?.historyLimit;
  return value === 25 || value === 50 || value === 75 || value === 100 ? value : 75;
}

function readState(): JourneyState {
  const saved = readJourneyStateFromProductStorage();
  return saved
    ? { ...saved, readings: normalizeTarotHistoryRecords(saved.readings, currentHistoryLimit()) }
    : { ...defaultState, identity: createIdentity() };
}

export const journeyStore = createStore(readState());

type JourneyActionDependencies = {
  historyLimit: () => 25 | 50 | 75 | 100;
  now: () => string;
  persist: (state: JourneyState) => { persisted: boolean };
};

export type JourneyMutationResult<T = undefined> = {
  changed: boolean;
  persisted: boolean;
  value: T;
};

export function createJourneyActions(
  store: Store<JourneyState>,
  dependencies: JourneyActionDependencies,
) {
  function unchanged<T>(value: T): JourneyMutationResult<T> {
    return { changed: false, persisted: true, value };
  }

  function commit<T>(
    update: Partial<JourneyState>,
    value: T,
    rollbackOnFailure = false,
  ): JourneyMutationResult<T> {
    const previous = store.getState();
    store.setState(update);
    const persistence = dependencies.persist(store.getState());
    if (!persistence.persisted && rollbackOnFailure) store.setState(previous);
    return { changed: true, persisted: persistence.persisted, value };
  }

  return {
    ensureDailyCard(card: JourneyDailyCard) {
      const state = store.getState();
      if (state.dailyCards[card.dateKey]) return unchanged(undefined);
      return commit({ dailyCards: { ...state.dailyCards, [card.dateKey]: card } }, undefined);
    },
    openDailyCard(dateKey: string) {
      const state = store.getState();
      const card = state.dailyCards[dateKey];
      if (!card || card.openedAt) return unchanged(undefined);
      return commit(
        {
          dailyCards: {
            ...state.dailyCards,
            [dateKey]: { ...card, openedAt: dependencies.now() },
          },
        },
        undefined,
        true,
      );
    },
    recordReading(reading: TarotReading) {
      const state = store.getState();
      const existing = state.readings.find((item) => item.reading.id === reading.id);
      if (existing) return unchanged(existing.reading);
      const previousSnapshot = buildJourneyMemorySnapshot({
        generatedAt: reading.createdAt,
        locale: reading.context.locale,
        sources: journeyStateToMemorySources(state),
      });
      const completedReading = enrichTarotReadingWithContinuity(reading, previousSnapshot);
      const update = addTarotHistoryRecord(
        state.readings,
        completedReading,
        dependencies.now(),
        dependencies.historyLimit(),
      );
      return commit({ readings: update.records }, update.record.reading);
    },
    deleteReading(readingId: string) {
      const state = store.getState();
      if (!state.readings.some((record) => record.reading.id === readingId))
        return unchanged(undefined);
      return commit(
        { readings: removeTarotHistoryRecord(state.readings, readingId) },
        undefined,
        true,
      );
    },
    clearReadings() {
      const state = store.getState();
      if (state.readings.length === 0) return unchanged(undefined);
      return commit({ readings: [] }, undefined, true);
    },
    setHistoryLimit(limit: 25 | 50 | 75 | 100) {
      const state = store.getState();
      if (state.readings.length <= limit) return unchanged(undefined);
      return commit(
        { readings: normalizeTarotHistoryRecords(state.readings, limit) },
        undefined,
        true,
      );
    },
    toggleFavorite(readingId: string) {
      const state = store.getState();
      if (!state.readings.some((item) => item.reading.id === readingId))
        return unchanged(undefined);
      return commit(
        {
          readings: state.readings.map((item) =>
            item.reading.id === readingId ? { ...item, favorite: !item.favorite } : item,
          ),
        },
        undefined,
        true,
      );
    },
  };
}

export const journeyActions = createJourneyActions(journeyStore, {
  historyLimit: currentHistoryLimit,
  now: () => new Date().toISOString(),
  persist: persistJourneyStateToProductStorage,
});
