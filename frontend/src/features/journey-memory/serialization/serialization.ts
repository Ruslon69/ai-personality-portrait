import type { JourneyMemorySnapshot } from '../types';
import { validateJourneyMemorySnapshot } from '../validation';

export function serializeJourneyMemorySnapshot(snapshot: JourneyMemorySnapshot) {
  const validation = validateJourneyMemorySnapshot(snapshot);
  if (!validation.valid)
    throw new Error(
      `Cannot serialize invalid Journey snapshot: ${validation.errors[0]?.message ?? 'unknown error'}`,
    );
  return JSON.stringify(snapshot);
}

export function deserializeJourneyMemorySnapshot(serialized: string): JourneyMemorySnapshot {
  const snapshot = JSON.parse(serialized) as JourneyMemorySnapshot;
  const validation = validateJourneyMemorySnapshot(snapshot);
  if (!validation.valid)
    throw new Error(
      `Cannot deserialize invalid Journey snapshot: ${validation.errors[0]?.message ?? 'unknown error'}`,
    );
  return snapshot;
}
