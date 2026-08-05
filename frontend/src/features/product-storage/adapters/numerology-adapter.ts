import type { NumerologyProfile } from '@features/numerology/types';

import type { NumerologyStorageSection, ProductStorageAdapter } from '../types';
import { cloneJson } from '../utils';
import { validateProductStorageSection } from '../validation';

export type NumerologyPersistenceState = {
  birthDate: string;
  profile: NumerologyProfile | null;
};

export const numerologyStorageAdapter: ProductStorageAdapter<
  NumerologyPersistenceState,
  NumerologyStorageSection
> = {
  fromEnvelope(section) {
    return section ? cloneJson(section.data) : null;
  },
  legacyFallback(raw) {
    return raw ? { birthDate: raw, profile: null } : null;
  },
  mergeStrategy(current, incoming) {
    return incoming.birthDate === current.birthDate
      ? { birthDate: current.birthDate, profile: incoming.profile ?? current.profile }
      : cloneJson(incoming);
  },
  ownership: 'envelope-primary',
  section: 'numerology',
  toEnvelopeSection(state) {
    return { data: cloneJson(state), schemaVersion: 'numerology-storage-v1' };
  },
  validation(state) {
    return validateProductStorageSection('numerology', {
      data: state,
      schemaVersion: 'numerology-storage-v1',
    });
  },
};
