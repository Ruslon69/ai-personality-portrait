import type { ThemeMode } from '@app/providers/theme';

const nextTheme: Record<ThemeMode, ThemeMode> = {
  dark: 'system',
  light: 'dark',
  system: 'light',
};

export function getNextTheme(theme: ThemeMode) {
  return nextTheme[theme];
}
