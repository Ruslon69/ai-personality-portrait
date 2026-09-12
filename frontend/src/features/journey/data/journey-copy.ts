import type { Locale } from '@shared/i18n';

export type JourneyCopy = {
  book: {
    chapterNavigation: string;
    currentChapter: string;
    firstChapter: string;
    noChapters: string;
    openPath: string;
    reader: string;
    title: string;
  };
  card: {
    action: string;
    eyebrow: string;
    meaning: string;
    open: string;
    opened: string;
    title: string;
  };
  empty: {
    description: string;
    primary: string;
    title: string;
  };
  hero: {
    eyebrow: string;
    lead: string;
    title: string;
    welcome: string;
  };
  latest: {
    continue: string;
    description: string;
    empty: string;
    explore: string;
    title: string;
  };
  numbers: {
    day: string;
    description: string;
    month: string;
    noDate: string;
    title: string;
    year: string;
  };
  path: {
    addBookmark: string;
    addedBookmark: string;
    back: string;
    empty: string;
    eyebrow: string;
    bookmark: string;
    futureDescription: string;
    futureTitle: string;
    journeyMilestone: string;
    lead: string;
    open: string;
    portraitMilestone: string;
    preview: string;
    removeBookmark: string;
    removedBookmark: string;
    title: string;
  };
  quick: {
    exploreDescription: string;
    exploreTitle: string;
    latestDescription: string;
    latestTitle: string;
    pathDescription: string;
    pathTitle: string;
    title: string;
  };
  upcoming: {
    description: string;
    items: readonly string[];
    title: string;
  };
  yearBook: {
    description: string;
    eyebrow: string;
    title: string;
  };
};

export const journeyCopy: Record<Locale, JourneyCopy> = {
  ru: {
    book: {
      title: 'Мои результаты',
      reader: 'Гость',
      firstChapter: 'Первый результат',
      currentChapter: 'Последний результат',
      noChapters: 'Пока пусто',
      openPath: 'Все результаты',
      chapterNavigation: 'Сохранённые результаты',
    },
    hero: {
      eyebrow: 'Сохранено в этом браузере',
      title: 'Ваши результаты',
      lead: 'Откройте последний разбор или посмотрите всё, что сохранили раньше.',
      welcome: 'С возвращением',
    },
    card: {
      eyebrow: 'Карта сегодня',
      title: 'Один символ для фокуса дня',
      meaning: 'Короткая мысль',
      action: 'Попробуйте сегодня',
      open: 'Открыть карту дня',
      opened: 'Карта сохранена для сегодняшнего дня',
    },
    numbers: {
      title: 'Числа сегодняшнего контекста',
      description: 'Персональные циклы рассчитаны по вашей дате и текущему дню.',
      year: 'Персональный год',
      month: 'Персональный месяц',
      day: 'Число сегодня',
      noDate: 'Добавьте дату в первом раскладе, чтобы здесь появились персональные циклы.',
    },
    latest: {
      title: 'Последний расклад',
      description: 'Ваш расклад сохранён в этом браузере.',
      continue: 'Открыть последний расклад',
      explore: 'Новый расклад',
      empty: 'Здесь появится ваш первый сохранённый результат.',
    },
    quick: {
      title: 'Другие действия',
      latestTitle: 'Открыть личный разбор',
      latestDescription: 'Вернуться к последнему личному разбору.',
      exploreTitle: 'Новый расклад',
      exploreDescription: 'Выбрать другую тему или период.',
      pathTitle: 'История',
      pathDescription: 'Посмотреть сохранённые результаты и закладки.',
    },
    upcoming: {
      title: 'Больше возможностей со временем',
      description: 'Новые способы сохранять и сравнивать результаты появятся здесь позже.',
      items: ['Недельный ритм', 'Личные коллекции', 'Новые темы для разбора'],
    },
    empty: {
      title: 'Здесь будут ваши результаты',
      description:
        'Начните расклад или личный разбор. Готовый результат сохранится в этом браузере.',
      primary: 'Начать расклад',
    },
    path: {
      eyebrow: 'Сохранено в этом браузере',
      title: 'История',
      lead: 'Ваши сохранённые расклады и личные разборы — от новых к старым.',
      back: 'К результатам',
      journeyMilestone: 'Расклад Таро',
      portraitMilestone: 'Личный разбор',
      preview: 'Скоро',
      open: 'Открыть',
      addBookmark: 'Добавить закладку',
      addedBookmark: 'Закладка добавлена',
      removeBookmark: 'Убрать закладку',
      removedBookmark: 'Закладка убрана',
      bookmark: 'С закладкой',
      empty: 'Здесь появится ваше первое чтение.',
      futureTitle: 'Новые результаты',
      futureDescription: 'Новые сохранённые расклады и разборы появятся здесь.',
    },
    yearBook: {
      eyebrow: 'Скоро',
      title: 'Итоги года',
      description: 'Сохранённые результаты можно будет собрать в один обзор за год.',
    },
  },
  en: {
    book: {
      title: 'My results',
      reader: 'Guest',
      firstChapter: 'First result',
      currentChapter: 'Latest result',
      noChapters: 'No results yet',
      openPath: 'All results',
      chapterNavigation: 'Saved results',
    },
    hero: {
      eyebrow: 'Saved in this browser',
      title: 'Your results',
      lead: 'Open your latest reading or see everything you saved before.',
      welcome: 'Welcome back',
    },
    card: {
      eyebrow: "Today's card",
      title: 'One symbol to focus the day',
      meaning: 'A short perspective',
      action: 'Try this today',
      open: "Open today's card",
      opened: "Saved as today's card",
    },
    numbers: {
      title: "Today's number context",
      description: 'Your personal cycles are calculated from your birth date and the current day.',
      year: 'Personal year',
      month: 'Personal month',
      day: "Today's number",
      noDate: 'Add your birth date in the first reading to see your personal cycles here.',
    },
    latest: {
      title: 'Latest reading',
      description: 'Your reading is saved in this browser.',
      continue: 'Open latest reading',
      explore: 'New reading',
      empty: 'Your first saved result will appear here.',
    },
    quick: {
      title: 'Other actions',
      latestTitle: 'Open personal reflection',
      latestDescription: 'Return to your latest interpretation.',
      exploreTitle: 'New spread',
      exploreDescription: 'Choose another theme or period.',
      pathTitle: 'History',
      pathDescription: 'See saved results and bookmarks.',
    },
    upcoming: {
      title: 'More options over time',
      description: 'New ways to save and compare results will appear here later.',
      items: ['Weekly rhythm', 'Personal collections', 'New interpretation themes'],
    },
    empty: {
      title: 'Your results will appear here',
      description:
        'Start a Tarot reading or personal reflection. Your result will be saved in this browser.',
      primary: 'Start a reading',
    },
    path: {
      eyebrow: 'Saved in this browser',
      title: 'History',
      lead: 'Your saved Tarot readings and personal reflections, newest first.',
      back: 'Back to results',
      journeyMilestone: 'Tarot reading',
      portraitMilestone: 'Personal reflection',
      preview: 'Coming next',
      open: 'Open',
      addBookmark: 'Add bookmark',
      addedBookmark: 'Bookmark added',
      removeBookmark: 'Remove bookmark',
      removedBookmark: 'Bookmark removed',
      bookmark: 'Bookmarked',
      empty: 'Your first reading will appear here.',
      futureTitle: 'New results',
      futureDescription: 'New saved readings and reflections will appear here.',
    },
    yearBook: {
      eyebrow: 'Coming later',
      title: 'Your year in review',
      description: 'You’ll be able to bring your saved results into one yearly overview.',
    },
  },
  uk: {
    book: {
      title: 'Мої результати',
      reader: 'Гість',
      firstChapter: 'Перший результат',
      currentChapter: 'Останній результат',
      noChapters: 'Поки порожньо',
      openPath: 'Усі результати',
      chapterNavigation: 'Збережені результати',
    },
    hero: {
      eyebrow: 'Збережено в цьому браузері',
      title: 'Ваші результати',
      lead: 'Відкрийте останній розбір або перегляньте все, що зберегли раніше.',
      welcome: 'З поверненням',
    },
    card: {
      eyebrow: 'Карта сьогодні',
      title: 'Один символ для фокуса дня',
      meaning: 'Коротка перспектива',
      action: 'Спробуйте сьогодні',
      open: 'Відкрити карту дня',
      opened: 'Карту збережено для сьогоднішнього дня',
    },
    numbers: {
      title: 'Числа сьогоднішнього контексту',
      description: 'Особисті цикли розраховані за вашою датою й поточним днем.',
      year: 'Персональний рік',
      month: 'Персональний місяць',
      day: 'Число сьогодні',
      noDate: 'Додайте дату в першому розкладі, щоб тут з’явилися персональні цикли.',
    },
    latest: {
      title: 'Останній розклад',
      description: 'Ваш розклад збережено в цьому браузері.',
      continue: 'Відкрити останній розклад',
      explore: 'Новий розклад',
      empty: 'Тут з’явиться ваш перший збережений результат.',
    },
    quick: {
      title: 'Інші дії',
      latestTitle: 'Відкрити особистий розбір',
      latestDescription: 'Повернутися до останнього особистого розбору.',
      exploreTitle: 'Новий розклад',
      exploreDescription: 'Обрати іншу тему або період.',
      pathTitle: 'Історія',
      pathDescription: 'Переглянути збережені результати та закладки.',
    },
    upcoming: {
      title: 'Більше можливостей згодом',
      description: 'Нові способи зберігати й порівнювати результати з’являться тут пізніше.',
      items: ['Тижневий ритм', 'Особисті колекції', 'Нові теми для розбору'],
    },
    empty: {
      title: 'Тут будуть ваші результати',
      description:
        'Почніть розклад або особистий розбір. Готовий результат збережеться в цьому браузері.',
      primary: 'Почати розклад',
    },
    path: {
      eyebrow: 'Збережено в цьому браузері',
      title: 'Історія',
      lead: 'Ваші збережені розклади й особисті розбори — від нових до старих.',
      back: 'До результатів',
      journeyMilestone: 'Розклад Таро',
      portraitMilestone: 'Особистий розбір',
      preview: 'Незабаром',
      open: 'Відкрити',
      addBookmark: 'Додати закладку',
      addedBookmark: 'Закладку додано',
      removeBookmark: 'Прибрати закладку',
      removedBookmark: 'Закладку прибрано',
      bookmark: 'Із закладкою',
      empty: 'Тут з’явиться ваше перше читання.',
      futureTitle: 'Нові результати',
      futureDescription: 'Нові збережені розклади й розбори з’являться тут.',
    },
    yearBook: {
      eyebrow: 'Згодом',
      title: 'Підсумки року',
      description: 'Збережені результати можна буде зібрати в один річний огляд.',
    },
  },
};
