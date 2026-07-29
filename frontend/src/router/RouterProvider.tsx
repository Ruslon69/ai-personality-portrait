import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { RouterContext } from './RouterContext';
import type { RouterContextValue, RouterProviderProps } from './RouterProvider.types';

function getCurrentPath() {
  return window.location.pathname;
}

function getServerPath() {
  return '/';
}

function subscribeToHistory(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

export function RouterProvider({ children }: RouterProviderProps) {
  const currentPath = useSyncExternalStore(subscribeToHistory, getCurrentPath, getServerPath);

  const navigate = useCallback<RouterContextValue['navigate']>((path, options) => {
    const method = options?.replace ? 'replaceState' : 'pushState';
    window.history[method](null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const value = useMemo(() => ({ currentPath, navigate }), [currentPath, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
