import type { JourneyState } from '@features/journey/types';

import { canonicalParse } from '../serialization';
import type { JourneyStorageSection, ProductStorageAdapter } from '../types';
import { cloneJson, isRecord } from '../utils';
import { validateProductStorageSection } from '../validation';

function isJourneyState(value: unknown): value is JourneyState {
  return (
    isRecord(value) &&
    typeof value.identity === 'string' &&
    isRecord(value.dailyCards) &&
    Array.isArray(value.readings)
  );
}

export function mergeJourneyStates(current: JourneyState, incoming: JourneyState): JourneyState {
  const readings = new Map(current.readings.map((record) => [record.reading.id, record]));
  incoming.readings.forEach((record) => {
    const existing = readings.get(record.reading.id);
    if (!existing) readings.set(record.reading.id, record);
    else {
      const latest = existing.savedAt.localeCompare(record.savedAt) >= 0 ? existing : record;
      readings.set(record.reading.id, {
        ...latest,
        favorite: existing.favorite || record.favorite,
      });
    }
  });
  return {
    dailyCards: { ...incoming.dailyCards, ...current.dailyCards },
    identity: current.identity || incoming.identity,
    readings: [...readings.values()].sort((left, right) =>
      right.savedAt.localeCompare(left.savedAt),
    ),
  };
}

export const journeyStorageAdapter: ProductStorageAdapter<JourneyState, JourneyStorageSection> = {
  fromEnvelope(section) {
    return section ? cloneJson(section.data) : null;
  },
  legacyFallback(raw) {
    if (!raw) return null;
    const parsed = canonicalParse(raw);
    return parsed.status === 'success' && isJourneyState(parsed.value)
      ? cloneJson(parsed.value)
      : null;
  },
  mergeStrategy: mergeJourneyStates,
  ownership: 'envelope-primary',
  section: 'journey',
  toEnvelopeSection(state) {
    return { data: cloneJson(state), schemaVersion: 'journey-storage-v1' };
  },
  validation(state) {
    return validateProductStorageSection('journey', {
      data: state,
      schemaVersion: 'journey-storage-v1',
    });
  },
};
