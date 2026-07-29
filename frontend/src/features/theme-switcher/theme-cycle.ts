import type { ThemeMode } from '@app';

export const themeLabels = {
  dark: 'тёмная',
  light: 'светлая',
  system: 'системная',
} as const satisfies Record<ThemeMode, string>;

const nextTheme: Record<ThemeMode, ThemeMode> = {
  dark: 'system',
  light: 'dark',
  system: 'light',
};

export function getNextTheme(theme: ThemeMode) {
  return nextTheme[theme];
}
