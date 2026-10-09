import type { Locale, PluralForms } from '@shared/i18n';

export const tarotCardCountForms = {
  es: { one: 'carta', other: 'cartas' },
  en: { one: 'card', other: 'cards' },
  ru: { one: 'карта', few: 'карты', many: 'карт', other: 'карты' },
  uk: { one: 'карта', few: 'карти', many: 'карт', other: 'карти' },
} satisfies Record<Locale, PluralForms>;
