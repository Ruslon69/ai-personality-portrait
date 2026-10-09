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
  saveFailed: string;
  historyFailed: string;
  retry: string;
  reduceTitle: string;
  reduceDescription: (limit: number) => string;
  reduceConfirm: string;
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
    historyDescription:
      'При уменьшении лимита самые старые расклады сверх него будут удалены. Восстановить их нельзя.',
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
      'Перевёрнутые карты, анимация и подтверждение будут включены; лимит истории вернётся к 75. Если раскладов больше 75, самые старые будут удалены без возможности восстановления. Язык и тема останутся прежними.',
    resetTitle: 'Восстановить настройки Таро?',
    restored: 'Настройки Таро восстановлены по умолчанию.',
    saved: 'Настройки применены.',
    saveFailed:
      'Настройки действуют сейчас, но браузер не смог их сохранить. Проверьте разрешение на хранение данных сайта и попробуйте ещё раз.',
    historyFailed:
      'Не удалось сохранить изменение истории. Предыдущие записи сохранены. Попробуйте ещё раз.',
    retry: 'Попробовать снова',
    reduceTitle: 'Уменьшить историю?',
    reduceDescription: (limit) =>
      `Останутся последние ${limit} раскладов. Более старые будут удалены из этого браузера без возможности восстановления.`,
    reduceConfirm: 'Уменьшить лимит',
    title: 'Настройки чтения',
  },
  es: {
    allowReversed: 'Incluir cartas invertidas',
    allowReversedDescription:
      'Las nuevas lecturas podrán incluir cartas invertidas. Las lecturas guardadas no cambiarán.',
    animations: 'Animaciones al revelar',
    animationsDescription:
      'Muestra el giro de las cartas y transiciones breves. Las cartas se abren al instante si tienes activada la reducción de movimiento.',
    backToTarot: 'Volver a Tarot',
    cancel: 'Cancelar',
    confirmNewReading: 'Confirmar antes de empezar otra lectura',
    confirmNewReadingDescription: 'Evita sustituir por accidente una lectura sin terminar.',
    description: 'Ajusta cómo se desarrolla una lectura sin cambiar el significado de las cartas.',
    eyebrow: 'Tarot',
    historyDescription:
      'Al reducir el límite se eliminan las lecturas más antiguas que lo superen. No se pueden recuperar.',
    historyLimit: 'Lecturas que conservar',
    language: 'Idioma de Tarot',
    languageDescription: 'Tarot usa el idioma de la aplicación. Puedes cambiarlo en la cabecera.',
    newReadingCancel: 'Conservar la lectura actual',
    newReadingConfirm: 'Empezar otra lectura',
    newReadingDescription:
      'La lectura actual no está terminada. Si empiezas otra, perderás los avances sin guardar.',
    newReadingTitle: '¿Empezar otra lectura?',
    reset: 'Restablecer valores iniciales',
    resetConfirm: 'Restablecer',
    resetDescription:
      'Se activarán las cartas invertidas, las animaciones y la confirmación. El historial volverá a 75 lecturas. Si tienes más de 75, las más antiguas se eliminarán de forma permanente. El idioma y el tema no cambiarán.',
    resetTitle: '¿Restablecer los ajustes de Tarot?',
    restored: 'Ajustes de Tarot restablecidos.',
    saved: 'Ajustes aplicados.',
    saveFailed:
      'Los ajustes se aplican ahora, pero tu navegador no ha podido guardarlos. Comprueba que se permite guardar datos del sitio e inténtalo de nuevo.',
    historyFailed:
      'No se ha podido guardar el cambio del historial. Tus lecturas anteriores se han conservado. Inténtalo de nuevo.',
    retry: 'Intentar de nuevo',
    reduceTitle: '¿Conservar menos lecturas?',
    reduceDescription: (limit) =>
      `Se conservarán tus ${limit} lecturas más recientes. Las anteriores se eliminarán de forma permanente de este navegador.`,
    reduceConfirm: 'Reducir el límite',
    title: 'Ajustes de lectura',
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
    historyDescription:
      'Lowering the limit removes the oldest readings above it. They cannot be recovered.',
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
      'Reversed cards, animations, and confirmation will be enabled; history will return to 75 readings. If you have more than 75, the oldest will be permanently removed. Language and theme will stay the same.',
    resetTitle: 'Restore Tarot defaults?',
    restored: 'Tarot settings restored to defaults.',
    saved: 'Settings applied.',
    saveFailed:
      'Settings apply for now, but your browser could not save them. Check that site storage is allowed and try again.',
    historyFailed:
      'The history change could not be saved. Your previous readings have been kept. Try again.',
    retry: 'Try again',
    reduceTitle: 'Keep fewer readings?',
    reduceDescription: (limit) =>
      `Your latest ${limit} readings will remain. Older readings will be permanently removed from this browser.`,
    reduceConfirm: 'Reduce limit',
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
    historyDescription:
      'Після зменшення ліміту найстаріші розклади понад нього буде видалено. Відновити їх неможливо.',
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
      'Перевернуті карти, анімація та підтвердження будуть увімкнені; ліміт історії повернеться до 75. Якщо розкладів більше ніж 75, найстаріші буде видалено без можливості відновлення. Мова й тема залишаться без змін.',
    resetTitle: 'Відновити налаштування Таро?',
    restored: 'Налаштування Таро відновлено.',
    saved: 'Налаштування застосовано.',
    saveFailed:
      'Налаштування діють зараз, але браузер не зміг їх зберегти. Перевірте дозвіл на зберігання даних сайту й спробуйте ще раз.',
    historyFailed:
      'Не вдалося зберегти зміну історії. Попередні записи збережено. Спробуйте ще раз.',
    retry: 'Спробувати знову',
    reduceTitle: 'Зменшити історію?',
    reduceDescription: (limit) =>
      `Залишаться останні ${limit} розкладів. Старіші буде видалено з цього браузера без можливості відновлення.`,
    reduceConfirm: 'Зменшити ліміт',
    title: 'Налаштування читання',
  },
};
