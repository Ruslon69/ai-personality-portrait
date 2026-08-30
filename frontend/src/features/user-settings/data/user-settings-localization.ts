import type { Locale } from '@shared/i18n';

import type {
  AppearanceOption,
  CompatibilityInvitation,
  SettingsAccount,
  SettingsAction,
  SettingsConsent,
} from '../types';
import {
  appearanceOptions,
  dangerZoneActions,
  demoCompatibilityInvitations,
  demoSettingsAccount,
  portraitDataActions,
  privacyConsentSettings,
} from './user-settings.data';

export type UserSettingsCopy = {
  account: { eyebrow: string; note: string; title: string };
  announcements: {
    cancelled: string;
    consentDisabled: string;
    consentEnabled: string;
    themeChanged: (theme: string) => string;
  };
  appearance: {
    description: string;
    eyebrow: string;
    legend: string;
    options: string;
    title: string;
  };
  compatibility: {
    description: string;
    eyebrow: string;
    newLinksUnavailable: string;
    revoke: string;
    revokeConfirmation: (recipient: string) => {
      confirmLabel: string;
      description: string;
      resultMessage: string;
      title: string;
    };
    title: string;
  };
  danger: { description: string; eyebrow: string; title: string };
  data: { description: string; eyebrow: string; title: string };
  dateUnavailable: string;
  dialog: {
    cancel: string;
    confirm: string;
    defaultDescription: string;
    defaultTitle: string;
    label: string;
  };
  hero: { badge: string; description: string; title: string };
  invitationStatuses: Record<'accepted' | 'awaiting-consent' | 'revoked', string>;
  privacy: { description: string; eyebrow: string; legend: string; title: string };
  themeLabels: Record<'dark' | 'light' | 'system', string>;
};

export const userSettingsCopy: Record<Locale, UserSettingsCopy> = {
  en: {
    account: {
      eyebrow: 'Account',
      note: 'Registration is not required at this stage.',
      title: 'Current state',
    },
    announcements: {
      cancelled: 'Action cancelled. Settings were not changed.',
      consentDisabled: 'Separate consent disabled.',
      consentEnabled: 'Separate consent enabled.',
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
    compatibility: {
      description: 'Consent applies only to the selected invitation and can be withdrawn.',
      eyebrow: 'Compatibility',
      newLinksUnavailable: 'New openings from this link are unavailable.',
      revoke: 'Withdraw invitation',
      revokeConfirmation: (recipient) => ({
        confirmLabel: 'Withdraw invitation',
        description: `Invitation “${recipient}” will become unavailable in this local demonstration.`,
        resultMessage: `Invitation “${recipient}” was withdrawn locally.`,
        title: 'Withdraw this invitation?',
      }),
      title: 'Active invitations',
    },
    danger: {
      description:
        'Each action requires separate confirmation. No data is deleted in this demonstration.',
      eyebrow: 'Danger zone',
      title: 'Profile and all-data actions',
    },
    data: {
      description: 'These actions demonstrate future workflows and do not export or delete data.',
      eyebrow: 'Portrait data',
      title: 'Actions for current data',
    },
    dateUnavailable: 'Date unavailable',
    dialog: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      defaultDescription: 'This action is waiting for confirmation.',
      defaultTitle: 'Confirm action',
      label: 'Confirm a data action',
    },
    hero: {
      badge: 'Local settings',
      description:
        'Manage appearance, separate consents and demonstration data. Changes other than the theme reset after a page refresh.',
      title: 'Settings',
    },
    invitationStatuses: {
      accepted: 'Consent received',
      'awaiting-consent': 'Awaiting consent',
      revoked: 'Invitation withdrawn',
    },
    privacy: {
      description: 'All choices are off by default and apply only until the page is refreshed.',
      eyebrow: 'Privacy',
      legend: 'Separate privacy consents',
      title: 'Each consent is a separate choice',
    },
    themeLabels: { dark: 'dark', light: 'light', system: 'system' },
  },
  ru: {
    account: {
      eyebrow: 'Аккаунт',
      note: 'Регистрация на этом этапе не требуется.',
      title: 'Текущее состояние',
    },
    announcements: {
      cancelled: 'Действие отменено. Настройки не изменились.',
      consentDisabled: 'Отдельное согласие выключено.',
      consentEnabled: 'Отдельное согласие включено.',
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
    compatibility: {
      description: 'Согласие относится только к конкретному приглашению и может быть отозвано.',
      eyebrow: 'Совместимость',
      newLinksUnavailable: 'Новые открытия по ссылке недоступны.',
      revoke: 'Отозвать приглашение',
      revokeConfirmation: (recipient) => ({
        confirmLabel: 'Отозвать приглашение',
        description: `Приглашение «${recipient}» станет недоступно в этой локальной демонстрации.`,
        resultMessage: `Приглашение «${recipient}» отозвано локально.`,
        title: 'Отозвать приглашение?',
      }),
      title: 'Активные приглашения',
    },
    danger: {
      description:
        'Каждое действие требует отдельного подтверждения. В демонстрации данные не удаляются.',
      eyebrow: 'Опасная зона',
      title: 'Действия с профилем и всеми данными',
    },
    data: {
      description:
        'Эти действия демонстрируют будущие сценарии и не экспортируют или не удаляют данные.',
      eyebrow: 'Данные портрета',
      title: 'Действия с текущими данными',
    },
    dateUnavailable: 'Дата не указана',
    dialog: {
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      defaultDescription: 'Это действие ожидает подтверждения.',
      defaultTitle: 'Подтвердите действие',
      label: 'Подтверждение действия с данными',
    },
    hero: {
      badge: 'Локальные настройки',
      description:
        'Управляйте оформлением, отдельными согласиями и демонстрационными данными. Кроме темы, изменения сбросятся после обновления страницы.',
      title: 'Настройки',
    },
    invitationStatuses: {
      accepted: 'Согласие получено',
      'awaiting-consent': 'Согласие ожидается',
      revoked: 'Приглашение отозвано',
    },
    privacy: {
      description: 'Все параметры изначально выключены и действуют только до обновления страницы.',
      eyebrow: 'Приватность',
      legend: 'Отдельные согласия приватности',
      title: 'Каждое согласие — отдельный выбор',
    },
    themeLabels: { dark: 'тёмная', light: 'светлая', system: 'системная' },
  },
  uk: {
    account: {
      eyebrow: 'Обліковий запис',
      note: 'На цьому етапі реєстрація не потрібна.',
      title: 'Поточний стан',
    },
    announcements: {
      cancelled: 'Дію скасовано. Налаштування не змінено.',
      consentDisabled: 'Окрему згоду вимкнено.',
      consentEnabled: 'Окрему згоду ввімкнено.',
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
    compatibility: {
      description: 'Згода стосується лише конкретного запрошення й може бути відкликана.',
      eyebrow: 'Сумісність',
      newLinksUnavailable: 'Нові відкриття за цим посиланням недоступні.',
      revoke: 'Відкликати запрошення',
      revokeConfirmation: (recipient) => ({
        confirmLabel: 'Відкликати запрошення',
        description: `Запрошення «${recipient}» стане недоступним у цій локальній демонстрації.`,
        resultMessage: `Запрошення «${recipient}» відкликано локально.`,
        title: 'Відкликати запрошення?',
      }),
      title: 'Активні запрошення',
    },
    danger: {
      description: 'Кожна дія потребує окремого підтвердження. У демонстрації дані не видаляються.',
      eyebrow: 'Небезпечна зона',
      title: 'Дії з профілем і всіма даними',
    },
    data: {
      description: 'Ці дії демонструють майбутні сценарії й не експортують та не видаляють дані.',
      eyebrow: 'Дані портрета',
      title: 'Дії з поточними даними',
    },
    dateUnavailable: 'Дату не вказано',
    dialog: {
      cancel: 'Скасувати',
      confirm: 'Підтвердити',
      defaultDescription: 'Ця дія очікує підтвердження.',
      defaultTitle: 'Підтвердьте дію',
      label: 'Підтвердження дії з даними',
    },
    hero: {
      badge: 'Локальні налаштування',
      description:
        'Керуйте оформленням, окремими згодами й демонстраційними даними. Усі зміни, крім теми, скинуться після оновлення сторінки.',
      title: 'Налаштування',
    },
    invitationStatuses: {
      accepted: 'Згоду отримано',
      'awaiting-consent': 'Очікується згода',
      revoked: 'Запрошення відкликано',
    },
    privacy: {
      description: 'Усі параметри спочатку вимкнені й діють лише до оновлення сторінки.',
      eyebrow: 'Приватність',
      legend: 'Окремі згоди щодо приватності',
      title: 'Кожна згода — окремий вибір',
    },
    themeLabels: { dark: 'темна', light: 'світла', system: 'системна' },
  },
};

type LocalizedSettingsData = {
  account: SettingsAccount;
  appearanceOptions: readonly AppearanceOption[];
  dangerActions: readonly SettingsAction[];
  invitations: readonly CompatibilityInvitation[];
  portraitDataActions: readonly SettingsAction[];
  privacyConsents: readonly SettingsConsent[];
};

const localizedData: Record<Exclude<Locale, 'ru'>, LocalizedSettingsData> = {
  en: {
    account: {
      description:
        'Registration is not connected. Consent and invitation settings reset after a page refresh.',
      label: 'Guest mode',
      mode: 'guest',
    },
    appearanceOptions: [
      { description: 'Always use the light appearance.', label: 'Light', value: 'light' },
      { description: 'Always use the dark appearance.', label: 'Dark', value: 'dark' },
      { description: 'Follow the device setting.', label: 'System', value: 'system' },
    ],
    dangerActions: [
      {
        confirmation: {
          confirmLabel: 'Confirm profile deletion',
          description:
            'The profile will not be deleted in this local version. This confirmation only exercises a future workflow.',
          title: 'Delete profile?',
        },
        description: 'Future workflow for deleting a profile and its connections.',
        id: 'delete-profile',
        label: 'Delete profile',
        resultMessage:
          'Demonstration profile deletion confirmed. The real profile was not changed.',
        tone: 'danger',
      },
      {
        confirmation: {
          confirmLabel: 'Confirm deletion of all data',
          description:
            'No data will be deleted. In a production product this action requires a separate verifiable procedure.',
          title: 'Delete profile and all data?',
        },
        description: 'The broadest deletion workflow, kept separate from other settings.',
        id: 'delete-all-data',
        label: 'Delete all data',
        resultMessage: 'Demonstration deletion of all data confirmed. Real data was not changed.',
        tone: 'danger',
      },
    ],
    invitations: [
      {
        createdAt: '2026-07-27T12:00:00.000Z',
        id: 'invitation-partner',
        label: 'Romantic relationship',
        recipient: 'Private invitation #1',
        status: 'awaiting-consent',
      },
      {
        createdAt: '2026-07-20T09:30:00.000Z',
        id: 'invitation-shared',
        label: 'Shared reading',
        recipient: 'Private invitation #2',
        status: 'accepted',
      },
    ],
    portraitDataActions: [
      {
        description: 'Preview a future export workflow without creating a file.',
        id: 'export-data',
        label: 'Export data',
        resultMessage: 'Export was shown in demonstration mode. No file was created.',
        tone: 'neutral',
      },
      {
        confirmation: {
          confirmLabel: 'Confirm demonstration',
          description:
            'This only tests the workflow. The voice recording and related data will not change.',
          title: 'Delete voice recording?',
        },
        description: 'Open a safe confirmation for deleting source audio.',
        id: 'delete-voice',
        label: 'Delete voice recording',
        resultMessage: 'Demonstration voice deletion confirmed. Real data was not changed.',
        tone: 'danger',
      },
      {
        confirmation: {
          confirmLabel: 'Confirm demonstration',
          description:
            'The current portrait remains available: this local version does not perform deletion.',
          title: 'Delete current portrait?',
        },
        description: 'Preview a separate workflow for deleting the current result.',
        id: 'delete-current-portrait',
        label: 'Delete current portrait',
        resultMessage: 'Demonstration portrait deletion confirmed. Real data was not changed.',
        tone: 'danger',
      },
      {
        confirmation: {
          confirmLabel: 'Confirm demonstration',
          description:
            'Answers, date, voice and portrait will not be deleted. This is only a local demonstration.',
          title: 'Delete portrait data?',
        },
        description: 'Preview the complete workflow for deleting current portrait data.',
        id: 'delete-portrait-data',
        label: 'Delete all data',
        resultMessage: 'Demonstration portrait-data deletion confirmed. Real data was not changed.',
        tone: 'danger',
      },
    ],
    privacyConsents: [
      {
        description:
          'Source audio is deleted after analysis by default. This choice is currently demonstrational.',
        id: 'voice-storage',
        label: 'Keep the source voice recording',
      },
      {
        description:
          'Product permission does not imply permission to use feedback for improvement.',
        id: 'product-improvement',
        label: 'Use feedback to improve the product',
      },
      {
        description: 'Receive optional product news. No messages are currently sent.',
        id: 'marketing',
        label: 'Marketing messages',
      },
    ],
  },
  uk: {
    account: {
      description:
        'Реєстрацію не підключено. Налаштування згод і запрошень скинуться після оновлення сторінки.',
      label: 'Гостьовий режим',
      mode: 'guest',
    },
    appearanceOptions: [
      { description: 'Завжди використовувати світле оформлення.', label: 'Світла', value: 'light' },
      { description: 'Завжди використовувати темне оформлення.', label: 'Темна', value: 'dark' },
      { description: 'Використовувати налаштування пристрою.', label: 'Системна', value: 'system' },
    ],
    dangerActions: [
      {
        confirmation: {
          confirmLabel: 'Підтвердити видалення профілю',
          description:
            'Профіль не буде видалено в цій локальній версії. Підтвердження лише перевіряє майбутній сценарій.',
          title: 'Видалити профіль?',
        },
        description: 'Майбутній сценарій видалення профілю та його зв’язків.',
        id: 'delete-profile',
        label: 'Видалити профіль',
        resultMessage:
          'Демонстраційне видалення профілю підтверджено. Реальний профіль не змінено.',
        tone: 'danger',
      },
      {
        confirmation: {
          confirmLabel: 'Підтвердити видалення всіх даних',
          description:
            'Жодні дані не буде видалено. У робочому продукті ця дія потребуватиме окремої перевірюваної процедури.',
          title: 'Видалити профіль і всі дані?',
        },
        description: 'Найширший сценарій видалення, відокремлений від інших налаштувань.',
        id: 'delete-all-data',
        label: 'Видалити всі дані',
        resultMessage: 'Демонстраційне видалення всіх даних підтверджено. Реальні дані не змінено.',
        tone: 'danger',
      },
    ],
    invitations: [
      {
        createdAt: '2026-07-27T12:00:00.000Z',
        id: 'invitation-partner',
        label: 'Романтичні стосунки',
        recipient: 'Приватне запрошення №1',
        status: 'awaiting-consent',
      },
      {
        createdAt: '2026-07-20T09:30:00.000Z',
        id: 'invitation-shared',
        label: 'Спільний розбір',
        recipient: 'Приватне запрошення №2',
        status: 'accepted',
      },
    ],
    portraitDataActions: [
      {
        description: 'Перевірити майбутній сценарій експорту без створення файлу.',
        id: 'export-data',
        label: 'Експортувати дані',
        resultMessage: 'Експорт показано в демонстраційному режимі. Файл не створено.',
        tone: 'neutral',
      },
      {
        confirmation: {
          confirmLabel: 'Підтвердити демонстрацію',
          description: 'Це лише перевірка сценарію. Голосовий запис і пов’язані дані не зміняться.',
          title: 'Видалити голосовий запис?',
        },
        description: 'Відкрити безпечне підтвердження видалення початкового аудіо.',
        id: 'delete-voice',
        label: 'Видалити голосовий запис',
        resultMessage: 'Демонстраційне видалення голосу підтверджено. Реальні дані не змінено.',
        tone: 'danger',
      },
      {
        confirmation: {
          confirmLabel: 'Підтвердити демонстрацію',
          description:
            'Поточний портрет залишиться доступним: у локальній версії видалення не виконується.',
          title: 'Видалити поточний портрет?',
        },
        description: 'Перевірити окремий сценарій видалення поточного результату.',
        id: 'delete-current-portrait',
        label: 'Видалити поточний портрет',
        resultMessage: 'Демонстраційне видалення портрета підтверджено. Реальні дані не змінено.',
        tone: 'danger',
      },
      {
        confirmation: {
          confirmLabel: 'Підтвердити демонстрацію',
          description:
            'Відповіді, дата, голос і портрет не буде видалено. Це лише локальна демонстрація.',
          title: 'Видалити дані портрета?',
        },
        description: 'Перевірити загальний сценарій видалення даних поточного портрета.',
        id: 'delete-portrait-data',
        label: 'Видалити всі дані',
        resultMessage:
          'Демонстраційне видалення даних портрета підтверджено. Реальні дані не змінено.',
        tone: 'danger',
      },
    ],
    privacyConsents: [
      {
        description:
          'Початкове аудіо типово видаляється після аналізу. Цей вибір поки демонстраційний.',
        id: 'voice-storage',
        label: 'Зберігати початковий голосовий запис',
      },
      {
        description: 'Дозвіл на продукт не означає дозволу використовувати відгуки для покращення.',
        id: 'product-improvement',
        label: 'Використовувати відгуки для покращення продукту',
      },
      {
        description:
          'Отримувати необов’язкові новини продукту. Зараз повідомлення не надсилаються.',
        id: 'marketing',
        label: 'Маркетингові повідомлення',
      },
    ],
  },
};

export function getLocalizedUserSettingsData(locale: Locale): LocalizedSettingsData {
  if (locale !== 'ru') return localizedData[locale];
  return {
    account: demoSettingsAccount,
    appearanceOptions,
    dangerActions: dangerZoneActions,
    invitations: demoCompatibilityInvitations,
    portraitDataActions,
    privacyConsents: privacyConsentSettings,
  };
}
