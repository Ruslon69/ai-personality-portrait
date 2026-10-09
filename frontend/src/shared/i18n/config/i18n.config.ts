import type { Locale } from '../types';
import { localeDefinitions } from './locale-definitions';

export const fallbackLocale: Locale = 'ru';
export const localeStorageKey = 'locale';

export const localeOptions = (Object.keys(localeDefinitions) as (keyof typeof localeDefinitions)[])
  .filter((locale) => localeDefinitions[locale].enabled)
  .map((locale) => ({ locale: locale as Locale, ...localeDefinitions[locale] }));

export const supportedLocales = localeOptions.map(({ locale }) => locale);
