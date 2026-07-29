import type { ProfileCompletionStatus } from '../types';

const profileDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const completionStatusLabels: Record<ProfileCompletionStatus, string> = {
  complete: 'Добавлено',
  missing: 'Можно добавить',
  skipped: 'Пропущено',
};

export function formatProfileDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 'Дата не указана' : profileDateFormatter.format(date);
}

export function getCompletionStatusLabel(status: ProfileCompletionStatus) {
  return completionStatusLabels[status];
}
