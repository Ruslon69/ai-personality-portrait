import {
  buildJourneyMemorySnapshot,
  JOURNEY_MEMORY_VERSIONS,
} from '@features/journey-memory/model';
import {
  journeyStateToMemorySources,
  normalizeJourneyMemoryEntries,
} from '@features/journey-memory/normalization';
import { stableHash, stableStringify } from '@features/journey-memory/utils';
import type { JourneyState } from '@features/journey/types';

import type { JourneyMemoryStorageSection } from '../types';

export type JourneyMemorySyncResult = {
  action: 'created' | 'rebuilt' | 'reused';
  section: JourneyMemoryStorageSection;
};

export function journeyMemoryFingerprint(state: JourneyState) {
  const sources = journeyStateToMemorySources(state);
  return stableHash(stableStringify(normalizeJourneyMemoryEntries(sources)));
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
  const data = buildJourneyMemorySnapshot({
    generatedAt,
    locale: state.readings[0]?.reading.context.locale ?? 'ru',
    sources: journeyStateToMemorySources(state),
  });
  return {
    action: existing ? 'rebuilt' : 'created',
    section: { data, schemaVersion: 'journey-memory-v1' },
  };
}
