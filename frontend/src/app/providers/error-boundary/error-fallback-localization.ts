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
  es: {
    action: 'Recargar página',
    description:
      'Recarga la página para intentarlo de nuevo. Las respuestas y los retratos que no se hayan guardado se perderán. Las lecturas guardadas permanecerán en este navegador.',
    title: 'No se pudo abrir la aplicación',
  },
  en: {
    action: 'Reload page',
    description:
      'Reload the page to try again. Unsaved Portrait answers and results will be lost. Saved readings stay in this browser.',
    title: 'The application could not be opened',
  },
  ru: {
    action: 'Обновить страницу',
    description:
      'Обновите страницу и попробуйте ещё раз. Несохранённые ответы и результат Портрета будут потеряны. Сохранённые расклады останутся в этом браузере.',
    title: 'Не удалось открыть приложение',
  },
  uk: {
    action: 'Оновити сторінку',
    description:
      'Оновіть сторінку й спробуйте ще раз. Незбережені відповіді й результат Портрета буде втрачено. Збережені розклади залишаться в цьому браузері.',
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
