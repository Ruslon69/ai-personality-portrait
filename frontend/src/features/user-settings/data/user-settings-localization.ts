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
    retry: string;
  };
  data: {
    description: string;
    historyAction: string;
    localDescription: string;
    localTitle: string;
    privacyAction: string;
    sessionDescription: string;
    sessionTitle: string;
    title: string;
    eyebrow: string;
    clearTitle: string;
    clearDescription: string;
  };
  hero: { back: string; badge: string; description: string; title: string };
  themeLabels: Record<'dark' | 'light' | 'system', string>;
};

export const userSettingsCopy: Record<Locale, UserSettingsCopy> = {
  es: {
    announcements: { themeChanged: (theme) => `Tema cambiado: ${theme}.` },
    appearance: {
      description: 'Los cambios se aplican al instante.',
      eyebrow: 'Apariencia',
      legend: 'Tema de la interfaz',
      options: 'Puedes elegir un tema claro, oscuro o el del sistema.',
      title: 'Elige el tema que te resulte cómodo',
      retry: 'Intentar guardar de nuevo',
    },
    data: {
      description:
        'La información guardada pertenece a este navegador. No se sincroniza con una cuenta ni con otro dispositivo.',
      eyebrow: 'Privacidad y datos',
      historyAction: 'Gestionar lecturas de Tarot guardadas',
      localDescription:
        'Las lecturas de Tarot guardadas, las cartas del día, las preferencias, el idioma y la apariencia pueden conservarse después de cerrar el navegador.',
      localTitle: 'Guardado en este dispositivo',
      privacyAction: 'Leer la política de privacidad',
      sessionDescription:
        'Las respuestas del retrato, sus resultados y las grabaciones de voz desaparecen al recargar la página. Las fechas de Numerología y las lecturas de Tarot sin terminar suelen conservarse hasta que termina la sesión del navegador.',
      sessionTitle: 'Información temporal',
      title: 'Tú decides sobre tu información',
      clearTitle: 'Eliminar información de este navegador',
      clearDescription:
        'En el Historial puedes eliminar lecturas individuales o vaciar la lista. Para eliminar toda la información guardada de Soul Arkana, incluidas las cartas del día y las preferencias, borra los datos de este sitio en los ajustes de tu navegador. No existe una copia en el servidor desde la que recuperarla.',
    },
    hero: {
      back: 'Volver a mis resultados',
      badge: 'Tus preferencias',
      description: 'Elige la apariencia y las opciones de lectura de Tarot que prefieras.',
      title: 'Ajustes',
    },
    themeLabels: { dark: 'oscuro', light: 'claro', system: 'del sistema' },
  },
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
      retry: 'Try saving again',
    },
    data: {
      description:
        'Your saved information belongs to this browser. It is not synced to an account or another device.',
      eyebrow: 'Privacy and data',
      historyAction: 'Manage saved Tarot readings',
      localDescription:
        'Saved Tarot readings, your daily cards, preferences, language, and appearance can remain after you close the browser.',
      localTitle: 'Saved on this device',
      privacyAction: 'Read the Privacy Policy',
      sessionDescription:
        'Portrait answers, results, and voice recordings disappear when you reload the page. Numerology birth dates and unfinished Tarot readings normally last until the browser session ends.',
      sessionTitle: 'Temporary information',
      title: 'Your information stays under your control',
      clearTitle: 'Removing local information',
      clearDescription:
        'In History, you can delete individual saved readings or clear the reading list. To remove all saved Soul Arkana information, including daily cards and preferences, clear this site’s data in your browser settings. There is no server copy to restore it from.',
    },
    hero: {
      back: 'Back to my results',
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
      retry: 'Попробовать сохранить снова',
    },
    data: {
      description:
        'Сохранённые данные связаны с этим браузером. Они не синхронизируются с аккаунтом или другим устройством.',
      eyebrow: 'Приватность и данные',
      historyAction: 'Управлять сохранёнными раскладами',
      localDescription:
        'Сохранённые расклады Таро, карты дня, настройки, язык и оформление могут оставаться после закрытия браузера.',
      localTitle: 'Сохраняется на устройстве',
      privacyAction: 'Прочитать политику приватности',
      sessionDescription:
        'Ответы, результат личного разбора и запись голоса исчезают при перезагрузке страницы. Дата для Нумерологии и незавершённый расклад Таро обычно доступны до завершения сессии браузера.',
      sessionTitle: 'Временные данные',
      title: 'Ваши данные остаются под вашим контролем',
      clearTitle: 'Удаление локальных данных',
      clearDescription:
        'В Истории можно удалить отдельные сохранённые расклады или очистить список. Чтобы удалить все сохранённые данные Soul Arkana, включая карты дня и настройки, очистите данные этого сайта в настройках браузера. Серверной копии для восстановления нет.',
    },
    hero: {
      back: 'К моим результатам',
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
      retry: 'Спробувати зберегти знову',
    },
    data: {
      description:
        'Збережені дані пов’язані із цим браузером. Вони не синхронізуються з обліковим записом чи іншим пристроєм.',
      eyebrow: 'Приватність і дані',
      historyAction: 'Керувати збереженими розкладами',
      localDescription:
        'Збережені розклади Таро, карти дня, налаштування, мова й оформлення можуть залишатися після закриття браузера.',
      localTitle: 'Зберігається на пристрої',
      privacyAction: 'Прочитати політику приватності',
      sessionDescription:
        'Відповіді, результат особистого розбору й запис голосу зникають після перезавантаження сторінки. Дата для Нумерології та незавершений розклад Таро зазвичай доступні до завершення сесії браузера.',
      sessionTitle: 'Тимчасові дані',
      title: 'Ваші дані залишаються під вашим контролем',
      clearTitle: 'Видалення локальних даних',
      clearDescription:
        'В Історії можна видалити окремі збережені розклади або очистити список. Щоб видалити всі збережені дані Soul Arkana, включно з картами дня й налаштуваннями, очистьте дані цього сайту в налаштуваннях браузера. Серверної копії для відновлення немає.',
    },
    hero: {
      back: 'До моїх результатів',
      badge: 'Ваші налаштування',
      description: 'Оберіть оформлення й параметри розкладів Таро, які вам підходять.',
      title: 'Налаштування',
    },
    themeLabels: { dark: 'темна', light: 'світла', system: 'системна' },
  },
};

const localizedAppearanceOptions: Record<Exclude<Locale, 'ru'>, readonly AppearanceOption[]> = {
  es: [
    { description: 'Usar siempre la apariencia clara.', label: 'Claro', value: 'light' },
    { description: 'Usar siempre la apariencia oscura.', label: 'Oscuro', value: 'dark' },
    { description: 'Seguir el ajuste del dispositivo.', label: 'Sistema', value: 'system' },
  ],
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
