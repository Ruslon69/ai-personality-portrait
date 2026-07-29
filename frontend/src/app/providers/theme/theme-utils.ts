import type { ResolvedTheme, ThemeMode } from './ThemeProvider.types';

export function applyTheme(theme: ThemeMode, root: Pick<HTMLElement, 'dataset'>) {
  root.dataset.theme = theme;
}

export function resolveTheme(theme: ThemeMode, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === 'system' ? systemTheme : theme;
}
