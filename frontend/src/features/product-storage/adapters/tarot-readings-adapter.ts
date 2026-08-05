import type { JourneyState } from '@features/journey/types';

import { journeyStorageAdapter } from './journey-adapter';
import type { ProductStorageAdapter, TarotReadingsStorageSection } from '../types';
import { cloneJson } from '../utils';
import { validateProductStorageSection } from '../validation';

export type TarotReadingsState = TarotReadingsStorageSection['data'];

export function tarotReadingsFromJourney(state: JourneyState): TarotReadingsState {
  return state.readings.map((record) => ({
    bookmarked: record.favorite,
    reading: record.reading,
    savedAt: record.savedAt,
  }));
}

export const tarotReadingsStorageAdapter: ProductStorageAdapter<
  TarotReadingsState,
  TarotReadingsStorageSection
> = {
  fromEnvelope(section) {
    return section ? cloneJson(section.data) : null;
  },
  legacyFallback(raw) {
    const journey = journeyStorageAdapter.legacyFallback(raw);
    return journey ? tarotReadingsFromJourney(journey) : null;
  },
  mergeStrategy(current, incoming) {
    const records = new Map(current.map((record) => [record.reading.id, record]));
    incoming.forEach((record) => {
      const existing = records.get(record.reading.id);
      records.set(
        record.reading.id,
        existing ? { ...existing, bookmarked: existing.bookmarked || record.bookmarked } : record,
      );
    });
    return [...records.values()].sort((left, right) => right.savedAt.localeCompare(left.savedAt));
  },
  ownership: 'envelope-primary',
  section: 'tarotReadings',
  toEnvelopeSection(state) {
    return { data: cloneJson(state), schemaVersion: 'tarot-storage-v1' };
  },
  validation(state) {
    return validateProductStorageSection('tarotReadings', {
      data: state,
      schemaVersion: 'tarot-storage-v1',
    });
  },
};
