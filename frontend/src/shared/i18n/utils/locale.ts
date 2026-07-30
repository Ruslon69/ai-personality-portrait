import { appStorage } from '@shared/lib/storage';

import { fallbackLocale, localeStorageKey, supportedLocales } from '../config';
import type { Locale } from '../types';

export function normalizeLocale(value: string | null | undefined): Locale | null {
  const language = value?.trim().toLowerCase().split('-')[0];

  return supportedLocales.find((locale) => locale === language) ?? null;
}

export function resolveBrowserLocale(languages: readonly string[] = []): Locale {
  for (const language of languages) {
    const locale = normalizeLocale(language);

    if (locale) {
      return locale;
    }
  }

  return fallbackLocale;
}

export function getInitialLocale(): Locale {
  const storedLocale = normalizeLocale(appStorage.get(localeStorageKey));

  if (storedLocale) {
    return storedLocale;
  }

  if (typeof navigator === 'undefined') {
    return fallbackLocale;
  }

  const languages = navigator.languages.length > 0 ? navigator.languages : [navigator.language];

  return resolveBrowserLocale(languages);
}

export function saveLocale(locale: Locale) {
  appStorage.set(localeStorageKey, locale);
}

export function formatMessage(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
