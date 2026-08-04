import { useSyncExternalStore } from 'react';

import { tarotSessionActions, tarotSessionStore } from '../model';

export function useTarotSession() {
  const state = useSyncExternalStore(
    tarotSessionStore.subscribe,
    tarotSessionStore.getState,
    tarotSessionStore.getState,
  );

  return { actions: tarotSessionActions, state };
}
