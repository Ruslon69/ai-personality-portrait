import { fallbackLocale, localeStorageKey } from '@shared/i18n/config';
import type { Locale } from '@shared/i18n/types';
import { normalizeLocale, resolveBrowserLocale } from '@shared/i18n/utils';
import { appStorage } from '@shared/lib/storage';

export type ErrorFallbackCopy = {
  action: string;
  description: string;
  title: string;
};

export const errorFallbackCopy: Record<Locale, ErrorFallbackCopy> = {
  en: {
    action: 'Reload page',
    description: 'Reload the page to try again. Local data from the current session may be reset.',
    title: 'The application could not be opened',
  },
  ru: {
    action: 'Обновить страницу',
    description:
      'Обновите страницу и попробуйте ещё раз. Локальные данные текущей сессии могут быть сброшены.',
    title: 'Не удалось открыть приложение',
  },
  uk: {
    action: 'Оновити сторінку',
    description:
      'Оновіть сторінку й спробуйте ще раз. Локальні дані поточної сесії можуть бути скинуті.',
    title: 'Не вдалося відкрити застосунок',
  },
};

export function resolveErrorFallbackLocale(
  storedValue: string | null | undefined,
  browserLanguages: readonly string[] = [],
): Locale {
  return normalizeLocale(storedValue) ?? resolveBrowserLocale(browserLanguages);
}

export function getErrorFallbackLocale(): Locale {
  try {
    const languages =
      typeof navigator === 'undefined'
        ? []
        : navigator.languages.length > 0
          ? navigator.languages
          : [navigator.language];
    return resolveErrorFallbackLocale(appStorage.get(localeStorageKey), languages);
  } catch {
    return fallbackLocale;
  }
}
