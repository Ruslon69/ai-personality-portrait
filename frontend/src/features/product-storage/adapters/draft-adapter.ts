import type { DraftPortraitState } from '@store/draft-portrait';

import { canonicalParse } from '../serialization';
import type { DraftStorageSection, ProductStorageAdapter } from '../types';
import { cloneJson, isRecord } from '../utils';
import { validateProductStorageSection } from '../validation';

export const draftPortraitStorageAdapter: ProductStorageAdapter<
  DraftPortraitState,
  DraftStorageSection
> = {
  fromEnvelope(section) {
    if (!section) return null;
    const currentProfile =
      section.data.profiles.find((profile) => profile.id === section.data.currentProfileId) ?? null;
    return {
      currentProfile,
      draft: cloneJson(section.data.draft),
      profiles: cloneJson(section.data.profiles),
    };
  },
  legacyFallback(raw) {
    if (!raw) return null;
    const parsed = canonicalParse(raw);
    if (parsed.status !== 'success' || !isRecord(parsed.value) || !isRecord(parsed.value.draft))
      return null;
    return parsed.value as unknown as DraftPortraitState;
  },
  mergeStrategy(current) {
    return cloneJson(current);
  },
  ownership: 'volatile',
  section: 'draftPortrait',
  toEnvelopeSection() {
    return null;
  },
  validation(state) {
    return validateProductStorageSection('draftPortrait', {
      data: {
        currentProfileId: state.currentProfile?.id ?? null,
        draft: state.draft,
        profiles: state.profiles,
      },
      schemaVersion: 'draft-storage-v1',
    });
  },
};
