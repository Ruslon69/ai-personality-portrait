import type { JourneyState } from '@features/journey/types';

import { journeyStorageAdapter } from '../adapters/journey-adapter';
import {
  tarotReadingsFromJourney,
  tarotReadingsStorageAdapter,
} from '../adapters/tarot-readings-adapter';
import type { ProductStorageData, ProductStorageEnvelope } from '../types';
import { synchronizeJourneyMemory } from './journey-memory-bridge';

export function journeyStateFromCompatibilitySources(
  envelope: ProductStorageEnvelope | null,
  legacyRaw: string | null,
): JourneyState | null {
  return (
    journeyStorageAdapter.fromEnvelope(envelope?.data.journey) ??
    journeyStorageAdapter.legacyFallback(legacyRaw)
  );
}

export function journeySectionsFromState(
  state: JourneyState,
  envelope: ProductStorageEnvelope | null,
  generatedAt: string,
): Pick<ProductStorageData, 'journey' | 'journeyMemory' | 'tarotReadings'> {
  const journey = journeyStorageAdapter.toEnvelopeSection(state);
  const tarotReadings = tarotReadingsStorageAdapter.toEnvelopeSection(
    tarotReadingsFromJourney(state),
  );
  const memory = synchronizeJourneyMemory(state, envelope?.data.journeyMemory, generatedAt);
  return {
    ...(journey ? { journey } : {}),
    journeyMemory: memory.section,
    ...(tarotReadings ? { tarotReadings } : {}),
  };
}
