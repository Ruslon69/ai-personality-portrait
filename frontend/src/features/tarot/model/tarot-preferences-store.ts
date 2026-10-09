import {
  getProductStorageService,
  persistPreferencesToProductStorage,
  readPreferencesFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';
import { createStore, type Store } from '@store';

import {
  DEFAULT_TAROT_PREFERENCES,
  normalizeTarotPreferences,
  type TarotPreferences,
} from '../lib/tarot-preferences';

function readPreferences() {
  return normalizeTarotPreferences(readPreferencesFromProductStorage().tarot);
}

export function createTarotPreferencesActions(
  store: Store<TarotPreferences>,
  persist: (preferences: TarotPreferences) => boolean,
) {
  let lastWritePersisted = false;
  store.subscribe(() => {
    lastWritePersisted = persist(store.getState());
  });
  return {
    restoreDefaults() {
      store.setState({ ...DEFAULT_TAROT_PREFERENCES });
      return lastWritePersisted;
    },
    update(patch: Partial<TarotPreferences>) {
      store.setState(patch);
      return lastWritePersisted;
    },
  };
}

export const tarotPreferencesStore = createStore<TarotPreferences>(readPreferences());
export const tarotPreferencesActions = createTarotPreferencesActions(
  tarotPreferencesStore,
  (preferences) => {
    const write = persistPreferencesToProductStorage({ tarot: preferences });
    return (
      write.legacyWritten ||
      (write.envelopeWritten && getProductStorageService().getCapability() === 'persistent')
    );
  },
);
