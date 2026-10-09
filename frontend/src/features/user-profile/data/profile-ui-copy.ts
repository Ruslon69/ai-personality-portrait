import type { ProfileLocale } from '@entities/personality-profile';

export const profileUiCopy = {
  ru: {
    badge: 'Локальный профиль',
    missingDate: 'Дата не указана',
    sources: (count: number, total: number) => `Добавлено источников: ${count} из ${total}`,
  },
  en: {
    badge: 'Saved locally',
    missingDate: 'Date unavailable',
    sources: (count: number, total: number) => `${count} of ${total} sources included`,
  },
  uk: {
    badge: 'Локальний профіль',
    missingDate: 'Дату не вказано',
    sources: (count: number, total: number) => `Додано джерел: ${count} із ${total}`,
  },
  es: {
    badge: 'Guardado en este navegador',
    missingDate: 'Fecha no disponible',
    sources: (count: number, total: number) => `Fuentes incluidas: ${count} de ${total}`,
  },
} satisfies Record<ProfileLocale, unknown>;
