import type { TarotTopic } from '@features/tarot';
import type { Locale } from '@shared/i18n';

export type TarotHistoryCopy = {
  back: string;
  cancel: string;
  cardCount: (count: number) => string;
  clear: string;
  cleared: string;
  clearConfirm: string;
  clearDescription: string;
  clearTitle: string;
  create: string;
  delete: string;
  deleteConfirm: string;
  deleteDescription: (title: string) => string;
  deleteTitle: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  localOnly: string;
  open: string;
  removed: string;
  saved: string;
  title: string;
  topics: Record<TarotTopic, string>;
};

export const tarotHistoryCopy: Record<Locale, TarotHistoryCopy> = {
  ru: {
    back: 'К Таро',
    cancel: 'Отмена',
    cardCount: (count) => {
      const lastTwo = count % 100;
      const last = count % 10;
      const noun =
        lastTwo >= 11 && lastTwo <= 14
          ? 'карт'
          : last === 1
            ? 'карта'
            : last >= 2 && last <= 4
              ? 'карты'
              : 'карт';
      return `${count} ${noun}`;
    },
    clear: 'Очистить историю',
    cleared: 'История раскладов очищена.',
    clearConfirm: 'Очистить историю',
    clearDescription: 'Все сохранённые расклады будут удалены из этого браузера.',
    clearTitle: 'Очистить всю историю?',
    create: 'Создать расклад',
    delete: 'Удалить',
    deleteConfirm: 'Удалить расклад',
    deleteDescription: (title) => `Расклад «${title}» будет удалён только из этого браузера.`,
    deleteTitle: 'Удалить сохранённый расклад?',
    emptyDescription: 'Здесь появятся завершённые расклады, к которым можно будет вернуться позже.',
    emptyTitle: 'История пока пуста',
    eyebrow: 'ЛОКАЛЬНАЯ ИСТОРИЯ',
    localOnly: 'Расклады хранятся только в этом браузере и не синхронизируются с облаком.',
    open: 'Открыть расклад',
    removed: 'Расклад удалён из истории.',
    saved: 'Сохранённые расклады',
    title: 'История раскладов',
    topics: {
      decision: 'Решение',
      love: 'Отношения',
      money: 'Финансы',
      open: 'Открытый вопрос',
      work: 'Дела',
    },
  },
  en: {
    back: 'Back to Tarot',
    cancel: 'Cancel',
    cardCount: (count) => `${count} ${count === 1 ? 'card' : 'cards'}`,
    clear: 'Clear history',
    cleared: 'Reading history cleared.',
    clearConfirm: 'Clear history',
    clearDescription: 'All saved readings will be removed from this browser.',
    clearTitle: 'Clear all history?',
    create: 'Create a reading',
    delete: 'Delete',
    deleteConfirm: 'Delete reading',
    deleteDescription: (title) => `“${title}” will be removed from this browser only.`,
    deleteTitle: 'Delete this saved reading?',
    emptyDescription: 'Completed readings you can revisit later will appear here.',
    emptyTitle: 'Your history is empty',
    eyebrow: 'LOCAL HISTORY',
    localOnly: 'Readings are stored only in this browser and are not synced to the cloud.',
    open: 'Open reading',
    removed: 'Reading removed from history.',
    saved: 'Saved readings',
    title: 'Tarot reading history',
    topics: {
      decision: 'Decision',
      love: 'Relationships',
      money: 'Money',
      open: 'Open question',
      work: 'Work',
    },
  },
  uk: {
    back: 'До Таро',
    cancel: 'Скасувати',
    cardCount: (count) => {
      const lastTwo = count % 100;
      const last = count % 10;
      const noun =
        lastTwo >= 11 && lastTwo <= 14
          ? 'карт'
          : last === 1
            ? 'карта'
            : last >= 2 && last <= 4
              ? 'карти'
              : 'карт';
      return `${count} ${noun}`;
    },
    clear: 'Очистити історію',
    cleared: 'Історію розкладів очищено.',
    clearConfirm: 'Очистити історію',
    clearDescription: 'Усі збережені розклади буде видалено з цього браузера.',
    clearTitle: 'Очистити всю історію?',
    create: 'Створити розклад',
    delete: 'Видалити',
    deleteConfirm: 'Видалити розклад',
    deleteDescription: (title) => `Розклад «${title}» буде видалено лише з цього браузера.`,
    deleteTitle: 'Видалити збережений розклад?',
    emptyDescription: 'Тут з’являться завершені розклади, до яких можна буде повернутися пізніше.',
    emptyTitle: 'Історія поки порожня',
    eyebrow: 'ЛОКАЛЬНА ІСТОРІЯ',
    localOnly: 'Розклади зберігаються лише в цьому браузері й не синхронізуються з хмарою.',
    open: 'Відкрити розклад',
    removed: 'Розклад видалено з історії.',
    saved: 'Збережені розклади',
    title: 'Історія розкладів',
    topics: {
      decision: 'Рішення',
      love: 'Стосунки',
      money: 'Фінанси',
      open: 'Відкрите питання',
      work: 'Справи',
    },
  },
};
