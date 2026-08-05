import type { CompletionStateStorageSection, ProductStorageAdapter } from '../types';
import { cloneJson } from '../utils';
import { validateProductStorageSection } from '../validation';

export type CompletionPersistenceState = { completedStages: readonly string[] };

export const completionStorageAdapter: ProductStorageAdapter<
  CompletionPersistenceState,
  CompletionStateStorageSection
> = {
  fromEnvelope(section) {
    return section ? cloneJson(section.data) : null;
  },
  legacyFallback() {
    return null;
  },
  mergeStrategy(current, incoming) {
    return {
      completedStages: [
        ...new Set([...current.completedStages, ...incoming.completedStages]),
      ].sort(),
    };
  },
  ownership: 'envelope-primary',
  section: 'completionState',
  toEnvelopeSection(state) {
    return { data: cloneJson(state), schemaVersion: 'completion-storage-v1' };
  },
  validation(state) {
    return validateProductStorageSection('completionState', {
      data: state,
      schemaVersion: 'completion-storage-v1',
    });
  },
};
