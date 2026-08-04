import type { PersonalityProfile, PersonalityProfileAccess } from '@entities/personality-profile';

const historyDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const accessLabels: Record<PersonalityProfileAccess, string> = {
  free: 'Бесплатный',
  full: 'Полный',
};

export function formatHistoryDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 'Дата не указана' : historyDateFormatter.format(date);
}

export function getHistoryAccessLabel(access: PersonalityProfileAccess) {
  return accessLabels[access];
}

export function removePortraitById(items: readonly PersonalityProfile[], portraitId: string) {
  return items.filter((item) => item.id !== portraitId);
}
