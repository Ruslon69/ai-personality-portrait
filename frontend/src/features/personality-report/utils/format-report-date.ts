import { formatDate, type Locale } from '@shared/i18n';

const missingDate: Record<Locale, string> = {
  ru: 'Дата не указана',
  es: 'Fecha no indicada',
  en: 'Date not provided',
  uk: 'Дату не вказано',
};

export function formatReportDate(value: string, locale: Locale = 'ru') {
  return formatDate(value, locale, undefined, missingDate[locale]);
}
