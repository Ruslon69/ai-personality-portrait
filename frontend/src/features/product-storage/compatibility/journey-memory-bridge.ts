import {
  buildJourneyMemorySnapshot,
  createJourneyMemoryEntryFingerprint,
  JOURNEY_MEMORY_VERSIONS,
} from '@features/journey-memory/model';
import {
  journeyStateToMemorySources,
  normalizeJourneyMemoryEntries,
} from '@features/journey-memory/normalization';
import type { JourneyState } from '@features/journey/types';
import { enrichTarotReadingWithContinuity } from '@features/tarot/lib';

import type { JourneyMemoryStorageSection } from '../types';

export type JourneyMemorySyncResult = {
  action: 'created' | 'rebuilt' | 'reused';
  section: JourneyMemoryStorageSection;
};

export function journeyMemoryFingerprint(state: JourneyState) {
  const sources = journeyStateToMemorySources(state);
  return createJourneyMemoryEntryFingerprint(normalizeJourneyMemoryEntries(sources));
}

function versionsCompatible(section: JourneyMemoryStorageSection) {
  return Object.entries(JOURNEY_MEMORY_VERSIONS).every(
    ([key, version]) =>
      section.data.metadata.versions[key as keyof typeof JOURNEY_MEMORY_VERSIONS] === version,
  );
}

export function synchronizeJourneyMemory(
  state: JourneyState,
  existing: JourneyMemoryStorageSection | undefined,
  generatedAt: string,
): JourneyMemorySyncResult {
  const fingerprint = journeyMemoryFingerprint(state);
  if (
    existing &&
    existing.data.metadata.entryFingerprint === fingerprint &&
    versionsCompatible(existing)
  )
    return { action: 'reused', section: existing };
  const built = buildJourneyMemorySnapshot({
    generatedAt,
    locale: state.readings[0]?.reading.context.locale ?? 'ru',
    sources: journeyStateToMemorySources(state),
  });
  const data = { ...built, metadata: { ...built.metadata, entryFingerprint: fingerprint } };
  return {
    action: existing ? 'rebuilt' : 'created',
    section: { data, schemaVersion: 'journey-memory-v1' },
  };
}

export function reconcileJourneyStateAfterConflict(
  latest: JourneyState,
  incoming: JourneyState,
  generatedAt: string,
): JourneyState {
  let accumulated: JourneyState = {
    dailyCards: { ...latest.dailyCards, ...incoming.dailyCards },
    identity: latest.identity,
    readings: [...latest.readings],
  };
  const latestIds = new Set(latest.readings.map((record) => record.reading.id));
  const additions = incoming.readings
    .filter((record) => !latestIds.has(record.reading.id))
    .sort(
      (left, right) =>
        left.savedAt.localeCompare(right.savedAt) ||
        left.reading.id.localeCompare(right.reading.id),
    );
  additions.forEach((record) => {
    const snapshot = synchronizeJourneyMemory(accumulated, undefined, generatedAt).section.data;
    const reading =
      record.reading.reasoningVersions?.status === 'current'
        ? enrichTarotReadingWithContinuity(record.reading, snapshot)
        : record.reading;
    accumulated = {
      ...accumulated,
      readings: [{ ...record, reading }, ...accumulated.readings],
    };
  });
  const incomingById = new Map(incoming.readings.map((record) => [record.reading.id, record]));
  return {
    ...accumulated,
    readings: accumulated.readings
      .map((record) => {
        const incomingRecord = incomingById.get(record.reading.id);
        return incomingRecord
          ? { ...record, favorite: record.favorite || incomingRecord.favorite }
          : record;
      })
      .sort(
        (left, right) =>
          right.savedAt.localeCompare(left.savedAt) ||
          left.reading.id.localeCompare(right.reading.id),
      ),
  };
}
