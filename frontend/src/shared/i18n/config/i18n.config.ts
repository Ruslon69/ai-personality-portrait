import type { Locale } from '../types';

export const fallbackLocale: Locale = 'ru';
export const localeStorageKey = 'locale';

export const localeOptions = [
  { label: 'Русский', locale: 'ru', shortLabel: 'RU' },
  { label: 'English', locale: 'en', shortLabel: 'EN' },
  { label: 'Українська', locale: 'uk', shortLabel: 'UK' },
] as const satisfies readonly {
  label: string;
  locale: Locale;
  shortLabel: string;
}[];

export const supportedLocales = localeOptions.map(({ locale }) => locale);

// Questionnaire, profile, settings and long demo reports remain a future localization scope.
