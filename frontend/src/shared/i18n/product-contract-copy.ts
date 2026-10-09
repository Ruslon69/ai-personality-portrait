import type { Locale } from './types';

/** Outcome-based promises shared by entry, result and recovery surfaces. */
export const productContractCopy = {
  ru: {
    shareUnavailable: 'Поделиться портретом пока нельзя. Вы можете продолжить чтение здесь.',
    tarotUnsaved:
      'Разбор доступен сейчас, но его не удалось сохранить для повторного открытия после обновления страницы.',
    dailyTitle: 'Карта дня',
    dailyOpen: 'Открыть карту дня',
    dailyDescription: 'Одна бесплатная карта на сегодня. Повторное открытие покажет ту же карту.',
    portraitLifetime: 'Ответы и портрет доступны до обновления или закрытия страницы.',
    portraitMissing:
      'Ответы и портрет не сохраняются после обновления или закрытия страницы. Вы можете пройти вопросы снова.',
    numerologyUnsaved:
      'Разбор готов. Дату не удалось сохранить для повторного открытия после обновления страницы.',
    retrySaving: 'Попробовать сохранить дату снова',
  },
  es: {
    shareUnavailable: 'Aún no se puede compartir el retrato. Puedes seguir leyéndolo aquí.',
    tarotUnsaved:
      'Tu lectura está disponible ahora, pero no hemos podido guardarla para volver a abrirla después de recargar la página.',
    dailyTitle: 'Carta del día',
    dailyOpen: 'Abrir la carta de hoy',
    dailyDescription: 'Una carta gratuita para hoy. Al volver a abrirla verás la misma carta.',
    portraitLifetime:
      'Tus respuestas y tu retrato estarán disponibles hasta que recargues o cierres la página.',
    portraitMissing:
      'Las respuestas y los retratos no se conservan después de recargar o cerrar la página. Puedes responder las preguntas de nuevo.',
    numerologyUnsaved:
      'Tu lectura está lista. No hemos podido guardar la fecha para volver a abrirla después de recargar la página.',
    retrySaving: 'Intentar guardar la fecha de nuevo',
  },
  en: {
    shareUnavailable: 'Sharing is not available yet. You can keep reading your portrait here.',
    tarotUnsaved:
      'Your reading is available now, but we could not save it to reopen after a page reload.',
    dailyTitle: 'Card of the day',
    dailyOpen: 'Open today’s card',
    dailyDescription: 'One free card for today. Open it again to see the same card.',
    portraitLifetime:
      'Your answers and portrait stay available until you reload or close the page.',
    portraitMissing:
      'Answers and portraits are not kept after you reload or close the page. You can answer the questions again.',
    numerologyUnsaved:
      'Your reading is ready. We could not save the date to reopen it after a page reload.',
    retrySaving: 'Try saving the date again',
  },
  uk: {
    shareUnavailable: 'Поділитися портретом поки не можна. Ви можете продовжити читання тут.',
    tarotUnsaved:
      'Розбір доступний зараз, але не вдалося зберегти його для повторного відкриття після оновлення сторінки.',
    dailyTitle: 'Карта дня',
    dailyOpen: 'Відкрити карту дня',
    dailyDescription:
      'Одна безкоштовна карта на сьогодні. Повторне відкриття покаже ту саму карту.',
    portraitLifetime: 'Відповіді й портрет доступні до оновлення або закриття сторінки.',
    portraitMissing:
      'Відповіді й портрет не зберігаються після оновлення або закриття сторінки. Ви можете відповісти на запитання знову.',
    numerologyUnsaved:
      'Розбір готовий. Не вдалося зберегти дату для повторного відкриття після оновлення сторінки.',
    retrySaving: 'Спробувати зберегти дату ще раз',
  },
} satisfies Record<Locale, Record<string, string>>;
