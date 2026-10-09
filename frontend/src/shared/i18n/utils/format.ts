import { localeDefinitions } from '../config/locale-definitions';
import type { Locale } from '../types';
import { resolveLocale } from './locale';

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export function pluralForm(count: number, locale: Locale, forms: PluralForms): string {
  const category = new Intl.PluralRules(localeDefinitions[resolveLocale(locale)].formatTag).select(
    count,
  );
  return forms[category] ?? forms.other;
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(localeDefinitions[resolveLocale(locale)].formatTag, options).format(
    value,
  );
}

/** Calendar dates stay on their own day; timestamps follow the viewer's timezone. */
export function formatDate(
  value: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
  invalidLabel = '',
): string {
  let date: Date;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number) as [number, number, number];
    date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return invalidLabel;
  } else date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? invalidLabel
    : new Intl.DateTimeFormat(localeDefinitions[resolveLocale(locale)].formatTag, options).format(
        date,
      );
}
