import type { ProfileCompletionStatus, ProfileLocale } from '@entities/personality-profile';

const completionStatusLabels: Record<ProfileLocale, Record<ProfileCompletionStatus, string>> = {
  en: { complete: 'Included', missing: 'Can be added', skipped: 'Skipped' },
  ru: { complete: 'Добавлено', missing: 'Можно добавить', skipped: 'Пропущено' },
  uk: { complete: 'Додано', missing: 'Можна додати', skipped: 'Пропущено' },
};

export function formatProfileDate(value: string, locale: ProfileLocale = 'ru') {
  const date = new Date(value);
  const language = locale === 'en' ? 'en-GB' : locale === 'uk' ? 'uk-UA' : 'ru-RU';
  const formatter = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (!Number.isNaN(date.getTime())) return formatter.format(date);
  return locale === 'en'
    ? 'Date unavailable'
    : locale === 'uk'
      ? 'Дату не вказано'
      : 'Дата не указана';
}

export function getCompletionStatusLabel(
  status: ProfileCompletionStatus,
  locale: ProfileLocale = 'ru',
) {
  return completionStatusLabels[locale][status];
}
