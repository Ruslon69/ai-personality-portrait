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
  es: {
    clearFailed:
      'No hemos podido vaciar el historial. Tus lecturas siguen ahí. Inténtalo de nuevo.',
    dailyCardFailed: 'No se ha podido guardar la carta de hoy. Prueba a abrirla de nuevo.',
    deleteFailed: 'No hemos podido eliminar la lectura. Sigue en tu historial. Inténtalo de nuevo.',
    favoriteFailed: 'No se ha podido guardar el cambio en favoritos. Inténtalo de nuevo.',
    historyLimitFailed: 'No se ha podido aplicar el límite del historial. Inténtalo de nuevo.',
    saveFailed:
      'Este resultado está disponible ahora, pero no se ha podido guardar para otra visita en este navegador.',
  },
  en: {
    clearFailed: 'We could not clear your history. Your readings are still there. Try again.',
    dailyCardFailed: "Today's card could not be saved. Try opening it again.",
    deleteFailed: 'We could not delete the reading. It is still in your history. Try again.',
    favoriteFailed: 'The bookmark change could not be saved. Try again.',
    historyLimitFailed: 'The saved history limit could not be applied. Try again.',
    saveFailed:
      'This result is available now, but it could not be saved for a future visit in this browser.',
  },
  ru: {
    clearFailed: 'Не удалось очистить историю. Расклады остались на месте. Попробуйте ещё раз.',
    dailyCardFailed: 'Не удалось сохранить карту дня. Попробуйте открыть её ещё раз.',
    deleteFailed: 'Не удалось удалить расклад. Он остался в истории. Попробуйте ещё раз.',
    favoriteFailed: 'Не удалось сохранить изменение закладки. Попробуйте ещё раз.',
    historyLimitFailed: 'Не удалось применить лимит сохранённой истории. Попробуйте ещё раз.',
    saveFailed:
      'Результат доступен сейчас, но сохранить его для следующего посещения в этом браузере не удалось.',
  },
  uk: {
    clearFailed: 'Не вдалося очистити історію. Розклади залишилися на місці. Спробуйте ще раз.',
    dailyCardFailed: 'Не вдалося зберегти карту дня. Спробуйте відкрити її ще раз.',
    deleteFailed: 'Не вдалося видалити розклад. Він залишився в історії. Спробуйте ще раз.',
    favoriteFailed: 'Не вдалося зберегти зміну закладки. Спробуйте ще раз.',
    historyLimitFailed: 'Не вдалося застосувати ліміт збереженої історії. Спробуйте ще раз.',
    saveFailed:
      'Результат доступний зараз, але його не вдалося зберегти для наступного відвідування в цьому браузері.',
  },
};
