import { formatDate } from '@shared/i18n';
import { profileUiCopy } from '../data/profile-ui-copy';
import type { ProfileCompletionStatus, ProfileLocale } from '@entities/personality-profile';

const completionStatusLabels: Record<ProfileLocale, Record<ProfileCompletionStatus, string>> = {
  es: { complete: 'Incluido', missing: 'Se puede añadir', skipped: 'Omitido' },
  en: { complete: 'Included', missing: 'Can be added', skipped: 'Skipped' },
  ru: { complete: 'Добавлено', missing: 'Можно добавить', skipped: 'Пропущено' },
  uk: { complete: 'Додано', missing: 'Можна додати', skipped: 'Пропущено' },
};

export function formatProfileDate(value: string, locale: ProfileLocale = 'ru') {
  return formatDate(
    value,
    locale,
    { day: 'numeric', month: 'long', year: 'numeric' },
    profileUiCopy[locale].missingDate,
  );
}

export function getCompletionStatusLabel(
  status: ProfileCompletionStatus,
  locale: ProfileLocale = 'ru',
) {
  return completionStatusLabels[locale][status];
}
