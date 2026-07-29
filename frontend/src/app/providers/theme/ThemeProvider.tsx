import { useCallback, useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { ThemeContext } from './ThemeContext';
import type { ResolvedTheme, ThemeMode, ThemeProviderProps } from './ThemeProvider.types';
import { applyTheme, resolveTheme } from './theme-utils';

const systemThemeQuery = '(prefers-color-scheme: dark)';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredTheme(storageKey: string, fallback: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    return isThemeMode(storedTheme) ? storedTheme : fallback;
  } catch {
    return fallback;
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia(systemThemeQuery).matches ? 'dark' : 'light';
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(systemThemeQuery);
  mediaQuery.addEventListener('change', onStoreChange);

  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    readStoredTheme(storageKey, defaultTheme),
  );
  const systemTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeToSystemTheme,
    getSystemTheme,
    () => 'light',
  );
  const resolvedTheme = resolveTheme(theme, systemTheme);

  useLayoutEffect(() => {
    applyTheme(theme, document.documentElement);

    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  }, [storageKey, theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const value = useMemo(
    () => ({ resolvedTheme, setTheme, theme }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
