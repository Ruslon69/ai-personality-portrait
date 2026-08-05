import { canonicalParse } from '../serialization';
import type { ProductStorageAdapter, TarotSessionStorageSection } from '../types';
import { cloneJson, isRecord } from '../utils';
import { validateProductStorageSection } from '../validation';

export type TarotSessionPersistenceState = TarotSessionStorageSection['data'];

export const tarotSessionStorageAdapter: ProductStorageAdapter<
  TarotSessionPersistenceState,
  TarotSessionStorageSection
> = {
  fromEnvelope(section) {
    return section ? cloneJson(section.data) : null;
  },
  legacyFallback(raw) {
    if (!raw) return null;
    const parsed = canonicalParse(raw);
    return parsed.status === 'success' && isRecord(parsed.value)
      ? (parsed.value as TarotSessionPersistenceState)
      : null;
  },
  mergeStrategy(current, incoming) {
    return { ...current, ...incoming };
  },
  ownership: 'session-only',
  section: 'tarotSession',
  toEnvelopeSection() {
    return null;
  },
  validation(state) {
    return validateProductStorageSection('tarotSession', {
      data: state,
      schemaVersion: 'tarot-session-storage-v1',
    });
  },
};
