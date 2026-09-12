import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { RouterContext } from './RouterContext';
import type { RouterContextValue, RouterProviderProps } from './RouterProvider.types';
import { createNavigationState, initializeScrollRestoration } from './scroll-restoration';

const navigationEvent = 'soul-arkana:navigation';

function getCurrentPath() {
  return window.location.pathname;
}

function getServerPath() {
  return '/';
}

function subscribeToHistory(onStoreChange: () => void) {
  const cleanupScrollRestoration = initializeScrollRestoration(onStoreChange);
  window.addEventListener(navigationEvent, onStoreChange);
  return () => {
    cleanupScrollRestoration();
    window.removeEventListener(navigationEvent, onStoreChange);
  };
}

export function RouterProvider({ children }: RouterProviderProps) {
  const currentPath = useSyncExternalStore(subscribeToHistory, getCurrentPath, getServerPath);

  const navigate = useCallback<RouterContextValue['navigate']>((path, options) => {
    if (window.location.pathname === path) {
      return;
    }

    const isReplace = options?.replace === true;
    const method = isReplace ? 'replaceState' : 'pushState';
    window.history[method](createNavigationState(isReplace ? 'replace' : 'forward'), '', path);
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event(navigationEvent));
  }, []);

  const value = useMemo(() => ({ currentPath, navigate }), [currentPath, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
