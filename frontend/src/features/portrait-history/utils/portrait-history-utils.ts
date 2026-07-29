import type { PortraitHistoryAccess, PortraitHistoryItem } from '../types';

const historyDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const accessLabels: Record<PortraitHistoryAccess, string> = {
  free: 'Бесплатный',
  full: 'Полный',
};

export function formatHistoryDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 'Дата не указана' : historyDateFormatter.format(date);
}

export function getHistoryAccessLabel(access: PortraitHistoryAccess) {
  return accessLabels[access];
}

export function removePortraitById(items: readonly PortraitHistoryItem[], portraitId: string) {
  return items.filter((item) => item.id !== portraitId);
}
