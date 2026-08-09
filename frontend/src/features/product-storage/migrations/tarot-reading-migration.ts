import type { ReadingEngineLineage } from '@features/tarot';

import type { ProductStorageData } from '../types';
import { isRecord } from '../utils';

function stringAt(value: unknown, ...path: readonly string[]) {
  let current = value;
  for (const key of path) {
    if (!isRecord(current)) return null;
    current = current[key];
  }
  return typeof current === 'string' ? current : null;
}

export function legacyReadingLineage(reading: unknown): ReadingEngineLineage {
  const values = {
    authorContent: stringAt(reading, 'expertInterpretation', 'content', 'version'),
    calculationSystem:
      stringAt(reading, 'context', 'numerology', 'system') ??
      stringAt(reading, 'expertInterpretation', 'metadata', 'versions', 'numerologyCalculation'),
    crossSystemReasoning: stringAt(
      reading,
      'crossSystemReasoning',
      'metadata',
      'versions',
      'engine',
    ),
    expertInterpretation: stringAt(
      reading,
      'expertInterpretation',
      'metadata',
      'versions',
      'engine',
    ),
    journeyMemory: stringAt(reading, 'continuity', 'journeySnapshotVersion'),
    narrative: stringAt(reading, 'narrative', 'metadata', 'composerVersion'),
    numerologyKnowledge: null,
    readingContinuity: stringAt(reading, 'continuity', 'continuityVersion'),
    tarotKnowledge: null,
  };
  const present = Object.values(values).filter((value) => value !== null).length;
  const legacy = 'legacy-unavailable';
  return {
    authorContent: values.authorContent ?? legacy,
    calculationSystem: values.calculationSystem ?? legacy,
    crossSystemReasoning: values.crossSystemReasoning ?? legacy,
    expertInterpretation: values.expertInterpretation ?? legacy,
    journeyMemory: values.journeyMemory ?? legacy,
    narrative: values.narrative ?? legacy,
    numerologyKnowledge: legacy,
    readingContinuity: values.readingContinuity ?? legacy,
    status: present === 0 ? 'legacy' : 'mixed',
    tarotKnowledge: legacy,
  };
}

export function migrateTarotReadingContinuity<T extends object>(
  reading: T,
): T & { reasoningVersions: ReadingEngineLineage } {
  if (isRecord(reading) && isRecord(reading.reasoningVersions))
    return reading as T & { reasoningVersions: ReadingEngineLineage };
  return { ...reading, reasoningVersions: legacyReadingLineage(reading) };
}

export function migrateProductStorageReadingLineage(data: ProductStorageData): {
  changed: boolean;
  data: ProductStorageData;
} {
  let changed = false;
  const migrateRecord = <T extends { reading: object }>(record: T): T => {
    if (isRecord(record.reading) && isRecord(record.reading.reasoningVersions)) return record;
    changed = true;
    return { ...record, reading: migrateTarotReadingContinuity(record.reading) };
  };
  const journey = data.journey
    ? {
        ...data.journey,
        data: {
          ...data.journey.data,
          readings: data.journey.data.readings.map(migrateRecord),
        },
      }
    : undefined;
  const tarotReadings = data.tarotReadings
    ? { ...data.tarotReadings, data: data.tarotReadings.data.map(migrateRecord) }
    : undefined;
  return {
    changed,
    data: {
      ...data,
      ...(journey ? { journey } : {}),
      ...(tarotReadings ? { tarotReadings } : {}),
    },
  };
}
