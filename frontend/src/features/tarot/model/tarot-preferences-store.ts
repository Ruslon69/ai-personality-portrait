import {
  persistPreferencesToProductStorage,
  readPreferencesFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';
import { createStore } from '@store';

import {
  DEFAULT_TAROT_PREFERENCES,
  normalizeTarotPreferences,
  type TarotPreferences,
} from '../lib/tarot-preferences';

function readPreferences() {
  return normalizeTarotPreferences(readPreferencesFromProductStorage().tarot);
}

export const tarotPreferencesStore = createStore<TarotPreferences>(readPreferences());

tarotPreferencesStore.subscribe(() => {
  persistPreferencesToProductStorage({ tarot: tarotPreferencesStore.getState() });
});

export const tarotPreferencesActions = {
  restoreDefaults() {
    tarotPreferencesStore.setState({ ...DEFAULT_TAROT_PREFERENCES });
  },
  update(patch: Partial<TarotPreferences>) {
    tarotPreferencesStore.setState(patch);
  },
};
