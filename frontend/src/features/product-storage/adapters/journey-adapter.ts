import type { JourneyState } from '@features/journey/types';
import { normalizeDailyCards } from '@features/journey/lib/normalize-daily-cards';

import { canonicalParse } from '../serialization';
import type { JourneyStorageSection, ProductStorageAdapter } from '../types';
import { cloneJson, isRecord } from '../utils';
import { validateProductStorageSection } from '../validation';

function recoverJourneyState(value: unknown): JourneyState | null {
  return isRecord(value) && typeof value.identity === 'string' && Array.isArray(value.readings)
    ? { ...cloneJson(value as JourneyState), dailyCards: normalizeDailyCards(value.dailyCards) }
    : null;
}

/** A successful legacy write may outlive an envelope write that fell back to memory. */
export function restoreDailyCardState(
  envelope: JourneyState | null,
  legacy: JourneyState | null,
): JourneyState | null {
  if (!envelope) return legacy;
  if (!legacy || legacy.identity !== envelope.identity) return envelope;
  const dailyCards = { ...envelope.dailyCards };
  Object.entries(legacy.dailyCards).forEach(([dateKey, saved]) => {
    const current = dailyCards[dateKey];
    if (!current) dailyCards[dateKey] = saved;
    else if (
      !current.openedAt &&
      saved.openedAt &&
      current.selection.cardId === saved.selection.cardId &&
      current.selection.orientation === saved.selection.orientation &&
      current.selection.positionId === saved.selection.positionId
    )
      dailyCards[dateKey] = { ...current, openedAt: saved.openedAt };
  });
  // Only the Daily Card open state is reconciled. Envelope readings remain authoritative.
  return { ...envelope, dailyCards };
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
    return section ? recoverJourneyState(section.data) : null;
  },
  legacyFallback(raw) {
    if (!raw) return null;
    const parsed = canonicalParse(raw);
    return parsed.status === 'success' ? recoverJourneyState(parsed.value) : null;
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
