import { createStore } from '@store';
import {
  persistJourneyStateToProductStorage,
  readJourneyStateFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';
import type { TarotReading } from '@features/tarot';

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

function readState(): JourneyState {
  const saved = readJourneyStateFromProductStorage();
  return saved ?? { ...defaultState, identity: createIdentity() };
}

export const journeyStore = createStore(readState());

journeyStore.subscribe(() => {
  persistJourneyStateToProductStorage(journeyStore.getState());
});

export const journeyActions = {
  ensureDailyCard(card: JourneyDailyCard) {
    const state = journeyStore.getState();
    if (state.dailyCards[card.dateKey]) return;
    journeyStore.setState({ dailyCards: { ...state.dailyCards, [card.dateKey]: card } });
  },
  openDailyCard(dateKey: string) {
    const state = journeyStore.getState();
    const card = state.dailyCards[dateKey];
    if (!card || card.openedAt) return;
    journeyStore.setState({
      dailyCards: {
        ...state.dailyCards,
        [dateKey]: { ...card, openedAt: new Date().toISOString() },
      },
    });
  },
  recordReading(reading: TarotReading) {
    const state = journeyStore.getState();
    const existing = state.readings.find((item) => item.reading.id === reading.id);
    const record = {
      favorite: existing?.favorite ?? false,
      reading,
      savedAt: existing?.savedAt ?? new Date().toISOString(),
    };
    journeyStore.setState({
      readings: [record, ...state.readings.filter((item) => item.reading.id !== reading.id)],
    });
  },
  toggleFavorite(readingId: string) {
    const state = journeyStore.getState();
    journeyStore.setState({
      readings: state.readings.map((item) =>
        item.reading.id === readingId ? { ...item, favorite: !item.favorite } : item,
      ),
    });
  },
};
