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
      description:
        'The appearance changes immediately and stays synchronized with the header control.',
      eyebrow: 'Appearance',
      legend: 'Interface theme',
      options: 'Light, dark and system themes are available.',
      title: 'Choose a comfortable theme',
    },
    hero: {
      badge: 'Local settings',
      description:
        'Choose the interface appearance and reading preferences that are actually stored in this browser.',
      title: 'Settings',
    },
    themeLabels: { dark: 'dark', light: 'light', system: 'system' },
  },
  ru: {
    announcements: {
      themeChanged: (theme) => `Тема изменена: ${theme}.`,
    },
    appearance: {
      description:
        'Оформление меняется сразу и остаётся синхронизировано с переключателем в шапке.',
      eyebrow: 'Внешний вид',
      legend: 'Тема интерфейса',
      options: 'Доступны светлая, тёмная и системная темы.',
      title: 'Выберите удобную тему',
    },
    hero: {
      badge: 'Локальные настройки',
      description:
        'Выберите оформление интерфейса и реально сохраняемые в этом браузере настройки чтения.',
      title: 'Настройки',
    },
    themeLabels: { dark: 'тёмная', light: 'светлая', system: 'системная' },
  },
  uk: {
    announcements: {
      themeChanged: (theme) => `Тему змінено: ${theme}.`,
    },
    appearance: {
      description:
        'Оформлення змінюється одразу й залишається синхронізованим із перемикачем у шапці.',
      eyebrow: 'Вигляд',
      legend: 'Тема інтерфейсу',
      options: 'Доступні світла, темна й системна теми.',
      title: 'Виберіть зручну тему',
    },
    hero: {
      badge: 'Локальні налаштування',
      description:
        'Оберіть оформлення інтерфейсу й налаштування читання, які справді зберігаються в цьому браузері.',
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
