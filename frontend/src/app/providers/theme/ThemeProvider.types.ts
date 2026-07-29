import type { PropsWithChildren } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
};

export type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: ThemeMode;
  storageKey?: string;
}>;
