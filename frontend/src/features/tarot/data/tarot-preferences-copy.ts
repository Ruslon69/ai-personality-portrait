import type { Locale } from '@shared/i18n';

type TarotPreferencesCopy = {
  allowReversed: string;
  allowReversedDescription: string;
  animations: string;
  animationsDescription: string;
  backToTarot: string;
  cancel: string;
  confirmNewReading: string;
  confirmNewReadingDescription: string;
  description: string;
  eyebrow: string;
  historyDescription: string;
  historyLimit: string;
  language: string;
  languageDescription: string;
  newReadingCancel: string;
  newReadingConfirm: string;
  newReadingDescription: string;
  newReadingTitle: string;
  reset: string;
  resetConfirm: string;
  resetDescription: string;
  resetTitle: string;
  restored: string;
  saved: string;
  title: string;
};

export const tarotPreferencesCopy: Record<Locale, TarotPreferencesCopy> = {
  ru: {
    allowReversed: 'Разрешить перевёрнутые карты',
    allowReversedDescription:
      'В новых раскладах некоторые карты могут выпадать перевёрнутыми. Сохранённые расклады не изменятся.',
    animations: 'Анимация раскрытия',
    animationsDescription:
      'Показывать переворот карты и короткие переходы. При включённом уменьшении движения карты откроются сразу.',
    backToTarot: 'Вернуться к Таро',
    cancel: 'Отмена',
    confirmNewReading: 'Спрашивать перед новым раскладом',
    confirmNewReadingDescription: 'Защищает незавершённый расклад от случайной замены новым.',
    description: 'Настройте, как проходит расклад. Значения карт останутся прежними.',
    eyebrow: 'Таро',
    historyDescription: 'Когда лимит достигнут, удаляются только самые старые расклады.',
    historyLimit: 'Хранить раскладов',
    language: 'Язык Таро',
    languageDescription: 'Используется общий язык приложения; изменить его можно в шапке.',
    newReadingCancel: 'Остаться в текущем',
    newReadingConfirm: 'Начать новый',
    newReadingDescription:
      'Текущий расклад ещё не завершён. Если начать другой, его несохранённый прогресс будет потерян.',
    newReadingTitle: 'Начать новый расклад?',
    reset: 'Восстановить настройки по умолчанию',
    resetConfirm: 'Восстановить',
    resetDescription:
      'Перевёрнутые карты, анимация и подтверждение будут включены; лимит истории вернётся к 75.',
    resetTitle: 'Восстановить настройки Таро?',
    restored: 'Настройки Таро восстановлены по умолчанию.',
    saved: 'Настройки применены.',
    title: 'Настройки чтения',
  },
  en: {
    allowReversed: 'Allow reversed cards',
    allowReversedDescription:
      'New readings may include reversed cards. Saved readings will not be changed.',
    animations: 'Reveal animations',
    animationsDescription:
      'Show the card flip and brief transitions. Cards open instantly when reduced motion is enabled.',
    backToTarot: 'Back to Tarot',
    cancel: 'Cancel',
    confirmNewReading: 'Ask before starting a new reading',
    confirmNewReadingDescription:
      'Protects an unfinished reading from being replaced accidentally.',
    description: 'Adjust how a reading unfolds without changing the meaning of the cards.',
    eyebrow: 'Tarot',
    historyDescription: 'Only the oldest readings are removed when the limit is reached.',
    historyLimit: 'Keep readings',
    language: 'Tarot language',
    languageDescription: 'Tarot follows the app language, which you can change in the header.',
    newReadingCancel: 'Keep current reading',
    newReadingConfirm: 'Start new reading',
    newReadingDescription:
      'The current reading is unfinished. Starting another will discard its unsaved progress.',
    newReadingTitle: 'Start a new reading?',
    reset: 'Restore defaults',
    resetConfirm: 'Restore',
    resetDescription:
      'Reversed cards, animations, and confirmation will be enabled; history will return to 75 readings.',
    resetTitle: 'Restore Tarot defaults?',
    restored: 'Tarot settings restored to defaults.',
    saved: 'Settings applied.',
    title: 'Reading settings',
  },
  uk: {
    allowReversed: 'Дозволити перевернуті карти',
    allowReversedDescription:
      'У нових розкладах деякі карти можуть випадати перевернутими. Збережені розклади не зміняться.',
    animations: 'Анімація відкриття',
    animationsDescription:
      'Показувати переворот карти й короткі переходи. Коли зменшення руху ввімкнено, карти відкриються одразу.',
    backToTarot: 'Повернутися до Таро',
    cancel: 'Скасувати',
    confirmNewReading: 'Запитувати перед новим розкладом',
    confirmNewReadingDescription: 'Захищає незавершений розклад від випадкової заміни новим.',
    description: 'Налаштуйте, як проходить розклад. Значення карт не зміняться.',
    eyebrow: 'Таро',
    historyDescription: 'Коли ліміт вичерпано, видаляються лише найстаріші розклади.',
    historyLimit: 'Зберігати розкладів',
    language: 'Мова Таро',
    languageDescription: 'Використовується загальна мова застосунку; змінити її можна в шапці.',
    newReadingCancel: 'Залишитися в поточному',
    newReadingConfirm: 'Почати новий',
    newReadingDescription:
      'Поточний розклад ще не завершено. Якщо почати інший, його незбережений прогрес буде втрачено.',
    newReadingTitle: 'Почати новий розклад?',
    reset: 'Відновити типові налаштування',
    resetConfirm: 'Відновити',
    resetDescription:
      'Перевернуті карти, анімація та підтвердження будуть увімкнені; ліміт історії повернеться до 75.',
    resetTitle: 'Відновити налаштування Таро?',
    restored: 'Налаштування Таро відновлено.',
    saved: 'Налаштування застосовано.',
    title: 'Налаштування читання',
  },
};
