import { useSyncExternalStore } from 'react';

import { uiStore } from './ui.store';

export function useUiState() {
  return useSyncExternalStore(uiStore.subscribe, uiStore.getState, uiStore.getState);
}
