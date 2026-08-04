import { useSyncExternalStore } from 'react';

import { journeyActions, journeyStore } from '../model';

export function useJourney() {
  const state = useSyncExternalStore(
    journeyStore.subscribe,
    journeyStore.getState,
    journeyStore.getState,
  );

  return { actions: journeyActions, state };
}
