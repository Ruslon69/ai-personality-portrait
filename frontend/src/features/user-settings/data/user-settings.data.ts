import type {
  AppearanceOption,
  CompatibilityInvitation,
  SettingsAccount,
  SettingsAction,
  SettingsConsent,
} from '../types';

export const appearanceOptions: readonly AppearanceOption[] = [
  {
    description: 'Всегда использовать светлое оформление.',
    label: 'Светлая',
    value: 'light',
  },
  {
    description: 'Всегда использовать тёмное оформление.',
    label: 'Тёмная',
    value: 'dark',
  },
  {
    description: 'Следовать настройке устройства.',
    label: 'Системная',
    value: 'system',
  },
] as const;

export const privacyConsentSettings: readonly SettingsConsent[] = [
  {
    description:
      'По умолчанию исходное аудио удаляется после анализа. Этот выбор пока демонстрационный.',
    id: 'voice-storage',
    label: 'Сохранять исходную голосовую запись',
  },
  {
    description:
      'Разрешение на продукт не означает разрешение использовать обратную связь для улучшения.',
    id: 'product-improvement',
    label: 'Использовать обратную связь для улучшения продукта',
  },
  {
    description: 'Получать необязательные новости продукта. Сейчас сообщения не отправляются.',
    id: 'marketing',
    label: 'Маркетинговые сообщения',
  },
] as const;

export const portraitDataActions: readonly SettingsAction[] = [
  {
    description: 'Проверить будущий сценарий экспорта без создания файла.',
    id: 'export-data',
    label: 'Экспортировать данные',
    resultMessage: 'Экспорт показан в демонстрационном режиме. Файл не создавался.',
    tone: 'neutral',
  },
  {
    confirmation: {
      confirmLabel: 'Подтвердить заглушку',
      description:
        'Это только проверка сценария. Голосовая запись и связанные данные не будут изменены.',
      title: 'Удалить голосовую запись?',
    },
    description: 'Открыть безопасное подтверждение удаления исходного аудио.',
    id: 'delete-voice',
    label: 'Удалить голосовую запись',
    resultMessage: 'Демонстрационное удаление голоса подтверждено. Реальные данные не изменялись.',
    tone: 'danger',
  },
  {
    confirmation: {
      confirmLabel: 'Подтвердить заглушку',
      description:
        'Текущий портрет останется доступен: настоящее удаление в локальной версии не выполняется.',
      title: 'Удалить текущий портрет?',
    },
    description: 'Проверить отдельный сценарий удаления текущего результата.',
    id: 'delete-current-portrait',
    label: 'Удалить текущий портрет',
    resultMessage:
      'Демонстрационное удаление портрета подтверждено. Реальные данные не изменялись.',
    tone: 'danger',
  },
  {
    confirmation: {
      confirmLabel: 'Подтвердить заглушку',
      description:
        'Ответы, дата, голос и портрет не будут удалены. Это только локальная демонстрация.',
      title: 'Удалить данные портрета?',
    },
    description: 'Проверить общий сценарий удаления данных текущего портрета.',
    id: 'delete-portrait-data',
    label: 'Удалить все данные',
    resultMessage:
      'Демонстрационное удаление данных портрета подтверждено. Реальные данные не изменялись.',
    tone: 'danger',
  },
] as const;

export const dangerZoneActions: readonly SettingsAction[] = [
  {
    confirmation: {
      confirmLabel: 'Подтвердить удаление профиля',
      description:
        'Профиль не будет удалён в этой локальной версии. Подтверждение проверяет только будущий сценарий.',
      title: 'Удалить профиль?',
    },
    description: 'Будущий сценарий удаления профиля и его связей.',
    id: 'delete-profile',
    label: 'Удалить профиль',
    resultMessage: 'Демонстрационное удаление профиля подтверждено. Реальный профиль не изменялся.',
    tone: 'danger',
  },
  {
    confirmation: {
      confirmLabel: 'Подтвердить удаление всех данных',
      description:
        'Никакие данные не будут удалены. В рабочем продукте это действие потребует отдельной проверяемой процедуры.',
      title: 'Удалить профиль и все данные?',
    },
    description: 'Самый широкий сценарий удаления, отделённый от остальных настроек.',
    id: 'delete-all-data',
    label: 'Удалить все данные',
    resultMessage:
      'Демонстрационное удаление всех данных подтверждено. Реальные данные не изменялись.',
    tone: 'danger',
  },
] as const;

export const demoCompatibilityInvitations: readonly CompatibilityInvitation[] = [
  {
    createdAt: '2026-07-27T12:00:00.000Z',
    id: 'invitation-partner',
    label: 'Романтические отношения',
    recipient: 'Приватное приглашение №1',
    status: 'awaiting-consent',
  },
  {
    createdAt: '2026-07-20T09:30:00.000Z',
    id: 'invitation-shared',
    label: 'Совместный разбор',
    recipient: 'Приватное приглашение №2',
    status: 'accepted',
  },
] as const;

export const demoSettingsAccount: SettingsAccount = {
  description:
    'Регистрация не подключена. Настройки согласий и приглашений сбросятся после обновления страницы.',
  label: 'Гостевой режим',
  mode: 'guest',
};
