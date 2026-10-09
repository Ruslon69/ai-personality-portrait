import { en } from './en';
import { es } from './es';
import { ru } from './ru';
import { uk } from './uk';

export const messagesByLocale = {
  en,
  ru,
  uk,
  es,
} as const satisfies Record<Locale, I18nMessages>;
import type { I18nMessages, Locale } from '../types';
