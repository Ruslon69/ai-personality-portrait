import { useSyncExternalStore } from 'react';

import { sessionStore } from './session.store';

export function useSessionState() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getState, sessionStore.getState);
}
