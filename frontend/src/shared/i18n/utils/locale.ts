import { appStorage } from '@shared/lib/storage';

import { fallbackLocale, localeStorageKey, supportedLocales } from '../config';
import type { Locale } from '../types';

export function normalizeLocale(value: string | null | undefined): Locale | null {
  const language = value?.trim().toLowerCase().split('-')[0];

  return supportedLocales.find((locale) => locale === language) ?? null;
}

/** Exact persisted/content locale identifiers; browser tags are normalized separately. */
export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === 'string' && supportedLocales.some((locale) => locale === value);
}

export function resolveLocale(value: unknown): Locale {
  return isSupportedLocale(value) ? value : fallbackLocale;
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
  return appStorage.set(localeStorageKey, locale);
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
  fallback = '',
) {
  if ([...template.matchAll(/\{(\w+)\}/g)].some(([, key]) => values[key!] === undefined))
    return fallback;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]!));
}
