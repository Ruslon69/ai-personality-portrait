import { useSyncExternalStore } from 'react';

import { tarotPreferencesActions, tarotPreferencesStore } from '../model';

export function useTarotPreferences() {
  const preferences = useSyncExternalStore(
    tarotPreferencesStore.subscribe,
    tarotPreferencesStore.getState,
    tarotPreferencesStore.getState,
  );

  return { actions: tarotPreferencesActions, preferences };
}
