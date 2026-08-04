import { useSyncExternalStore } from 'react';

import { draftPortraitStore } from './draft-portrait.store';

export function useDraftPortraitState() {
  return useSyncExternalStore(
    draftPortraitStore.subscribe,
    draftPortraitStore.getState,
    draftPortraitStore.getState,
  );
}
