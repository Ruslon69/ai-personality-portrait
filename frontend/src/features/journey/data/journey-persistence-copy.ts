import type { Locale } from '@shared/i18n';

export type JourneyPersistenceCopy = {
  clearFailed: string;
  dailyCardFailed: string;
  deleteFailed: string;
  favoriteFailed: string;
  historyLimitFailed: string;
  saveFailed: string;
};

export const journeyPersistenceCopy: Record<Locale, JourneyPersistenceCopy> = {
  en: {
    clearFailed: 'History could not be cleared permanently. Your readings remain available.',
    dailyCardFailed: "Today's card could not be saved. Try opening it again.",
    deleteFailed: 'The reading could not be deleted permanently. It remains in your history.',
    favoriteFailed: 'The bookmark change could not be saved. Try again.',
    historyLimitFailed: 'The saved history limit could not be applied. Try again.',
    saveFailed:
      'This result is available now, but it could not be saved for a future visit in this browser.',
  },
  ru: {
    clearFailed: 'Не удалось сохранить очистку истории. Ваши расклады остались на месте.',
    dailyCardFailed: 'Не удалось сохранить карту дня. Попробуйте открыть её ещё раз.',
    deleteFailed: 'Не удалось сохранить удаление расклада. Он остался в вашей истории.',
    favoriteFailed: 'Не удалось сохранить изменение закладки. Попробуйте ещё раз.',
    historyLimitFailed: 'Не удалось применить лимит сохранённой истории. Попробуйте ещё раз.',
    saveFailed:
      'Результат доступен сейчас, но сохранить его для следующего посещения в этом браузере не удалось.',
  },
  uk: {
    clearFailed: 'Не вдалося зберегти очищення історії. Ваші розклади залишилися на місці.',
    dailyCardFailed: 'Не вдалося зберегти карту дня. Спробуйте відкрити її ще раз.',
    deleteFailed: 'Не вдалося зберегти видалення розкладу. Він залишився у вашій історії.',
    favoriteFailed: 'Не вдалося зберегти зміну закладки. Спробуйте ще раз.',
    historyLimitFailed: 'Не вдалося застосувати ліміт збереженої історії. Спробуйте ще раз.',
    saveFailed:
      'Результат доступний зараз, але його не вдалося зберегти для наступного відвідування в цьому браузері.',
  },
};
