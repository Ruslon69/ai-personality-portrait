import type { Locale } from '@shared/i18n';

import type { AppearanceOption } from '../types';
import { appearanceOptions } from './user-settings.data';

export type UserSettingsCopy = {
  announcements: {
    themeChanged: (theme: string) => string;
  };
  appearance: {
    description: string;
    eyebrow: string;
    legend: string;
    options: string;
    title: string;
  };
  hero: { badge: string; description: string; title: string };
  themeLabels: Record<'dark' | 'light' | 'system', string>;
};

export const userSettingsCopy: Record<Locale, UserSettingsCopy> = {
  en: {
    announcements: {
      themeChanged: (theme) => `Theme changed: ${theme}.`,
    },
    appearance: {
      description: 'Changes apply immediately.',
      eyebrow: 'Appearance',
      legend: 'Interface theme',
      options: 'Light, dark and system themes are available.',
      title: 'Choose a comfortable theme',
    },
    hero: {
      badge: 'Your preferences',
      description: 'Choose the appearance and Tarot reading options that suit you.',
      title: 'Settings',
    },
    themeLabels: { dark: 'dark', light: 'light', system: 'system' },
  },
  ru: {
    announcements: {
      themeChanged: (theme) => `Тема изменена: ${theme}.`,
    },
    appearance: {
      description: 'Изменения применяются сразу.',
      eyebrow: 'Внешний вид',
      legend: 'Тема интерфейса',
      options: 'Доступны светлая, тёмная и системная темы.',
      title: 'Выберите удобную тему',
    },
    hero: {
      badge: 'Ваши предпочтения',
      description: 'Выберите оформление и параметры раскладов Таро, которые вам подходят.',
      title: 'Настройки',
    },
    themeLabels: { dark: 'тёмная', light: 'светлая', system: 'системная' },
  },
  uk: {
    announcements: {
      themeChanged: (theme) => `Тему змінено: ${theme}.`,
    },
    appearance: {
      description: 'Зміни застосовуються одразу.',
      eyebrow: 'Вигляд',
      legend: 'Тема інтерфейсу',
      options: 'Доступні світла, темна й системна теми.',
      title: 'Виберіть зручну тему',
    },
    hero: {
      badge: 'Ваші налаштування',
      description: 'Оберіть оформлення й параметри розкладів Таро, які вам підходять.',
      title: 'Налаштування',
    },
    themeLabels: { dark: 'темна', light: 'світла', system: 'системна' },
  },
};

const localizedAppearanceOptions: Record<Exclude<Locale, 'ru'>, readonly AppearanceOption[]> = {
  en: [
    { description: 'Always use the light appearance.', label: 'Light', value: 'light' },
    { description: 'Always use the dark appearance.', label: 'Dark', value: 'dark' },
    { description: 'Follow the device setting.', label: 'System', value: 'system' },
  ],
  uk: [
    { description: 'Завжди використовувати світле оформлення.', label: 'Світла', value: 'light' },
    { description: 'Завжди використовувати темне оформлення.', label: 'Темна', value: 'dark' },
    {
      description: 'Використовувати налаштування пристрою.',
      label: 'Системна',
      value: 'system',
    },
  ],
};

export function getLocalizedUserSettingsData(locale: Locale) {
  return {
    appearanceOptions: locale === 'ru' ? appearanceOptions : localizedAppearanceOptions[locale],
  };
}
