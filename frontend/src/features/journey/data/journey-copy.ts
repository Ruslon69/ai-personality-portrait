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
      title: 'Book of Journey',
      reader: 'Гость',
      firstChapter: 'Первая глава',
      currentChapter: 'Текущая глава',
      noChapters: 'Пролог',
      openPath: 'Открыть содержание',
      chapterNavigation: 'Навигация по главам',
    },
    hero: {
      eyebrow: 'ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО',
      title: 'Ваш путь продолжается сегодня',
      lead: 'Возвращайтесь к важным трактовкам, открывайте карту дня и замечайте, как меняется ваш личный контекст.',
      welcome: 'С возвращением',
    },
    card: {
      eyebrow: 'КАРТА СЕГОДНЯ',
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
      title: 'Продолжить последнее чтение',
      description: 'Ваш расклад сохранён локально и открыт с того же места.',
      continue: 'Продолжить путь',
      explore: 'Исследовать новый расклад',
      empty: 'Первое чтение станет началом вашей личной линии.',
    },
    quick: {
      title: 'Один шаг дальше',
      latestTitle: 'Ваше чтение',
      latestDescription: 'Вернуться к последней интерпретации.',
      exploreTitle: 'Новый расклад',
      exploreDescription: 'Выбрать другую тему или период.',
      pathTitle: 'Мой путь',
      pathDescription: 'Посмотреть сохранённые главы и закладки.',
    },
    upcoming: {
      title: 'Путь будет становиться глубже',
      description:
        'Будущие возможности появятся здесь как продолжение вашего опыта, а не отдельный каталог.',
      items: ['Недельный ритм', 'Личные коллекции', 'Новые интерпретационные темы'],
    },
    empty: {
      title: 'Ваш путь начинается с первого чтения',
      description:
        'Выберите тему, добавьте короткий контекст и откройте расклад, к которому можно будет вернуться.',
      primary: 'Открыть первое чтение',
    },
    path: {
      eyebrow: 'ВАША ЛИЧНАЯ ХРОНОЛОГИЯ',
      title: 'Мой путь',
      lead: 'Не архив результатов, а линия чтений и наблюдений, к которым хочется возвращаться.',
      back: 'Вернуться в Journey',
      journeyMilestone: 'Чтение',
      portraitMilestone: 'Личный портрет',
      preview: 'Скоро',
      open: 'Открыть',
      addBookmark: 'Добавить закладку',
      addedBookmark: 'Закладка добавлена',
      removeBookmark: 'Убрать закладку',
      removedBookmark: 'Закладка убрана',
      bookmark: 'С закладкой',
      empty: 'Здесь появится ваше первое чтение.',
      futureTitle: 'Следующая глава',
      futureDescription: 'Будущие этапы, серии чтений и личные достижения появятся здесь позже.',
    },
    yearBook: {
      eyebrow: 'БУДУЩЕЕ ИЗДАНИЕ',
      title: 'Создать мою книгу года',
      description:
        'Годовая книга объединит главы, повторяющиеся темы и выбранные вами цитаты. Архитектура подготовлена; создание появится позже.',
    },
  },
  en: {
    book: {
      title: 'Book of Journey',
      reader: 'Guest',
      firstChapter: 'First chapter',
      currentChapter: 'Current chapter',
      noChapters: 'Prologue',
      openPath: 'Open the contents',
      chapterNavigation: 'Chapter navigation',
    },
    hero: {
      eyebrow: 'YOUR PERSONAL SPACE',
      title: 'Your journey continues today',
      lead: 'Return to meaningful readings, reveal a card for today and notice how your personal context evolves.',
      welcome: 'Welcome back',
    },
    card: {
      eyebrow: "TODAY'S CARD",
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
      title: 'Continue your latest reading',
      description: 'Your reading is saved locally and opens where you left it.',
      continue: 'Continue the journey',
      explore: 'Explore a new spread',
      empty: 'Your first reading will become the beginning of your personal timeline.',
    },
    quick: {
      title: 'One step further',
      latestTitle: 'Your reading',
      latestDescription: 'Return to your latest interpretation.',
      exploreTitle: 'New spread',
      exploreDescription: 'Choose another theme or period.',
      pathTitle: 'My Path',
      pathDescription: 'See saved chapters and bookmarks.',
    },
    upcoming: {
      title: 'Your path will grow deeper',
      description:
        'Future capabilities will appear here as a continuation of your experience, not a separate catalogue.',
      items: ['Weekly rhythm', 'Personal collections', 'New interpretation themes'],
    },
    empty: {
      title: 'Your journey begins with a first reading',
      description: 'Choose a theme, add a short context and open a reading you can return to.',
      primary: 'Open your first reading',
    },
    path: {
      eyebrow: 'YOUR PERSONAL TIMELINE',
      title: 'My Path',
      lead: 'Not an archive of results, but a line of readings and observations worth returning to.',
      back: 'Return to Journey',
      journeyMilestone: 'Reading',
      portraitMilestone: 'Personal portrait',
      preview: 'Coming next',
      open: 'Open',
      addBookmark: 'Add bookmark',
      addedBookmark: 'Bookmark added',
      removeBookmark: 'Remove bookmark',
      removedBookmark: 'Bookmark removed',
      bookmark: 'Bookmarked',
      empty: 'Your first reading will appear here.',
      futureTitle: 'The next chapter',
      futureDescription:
        'Future milestones, reading series and personal achievements will appear here later.',
    },
    yearBook: {
      eyebrow: 'A FUTURE EDITION',
      title: 'Create My Year Book',
      description:
        'Your Year Book will bring together chapters, recurring themes and the quotations you keep. The structure is ready; creation will come later.',
    },
  },
  uk: {
    book: {
      title: 'Book of Journey',
      reader: 'Гість',
      firstChapter: 'Перший розділ',
      currentChapter: 'Поточний розділ',
      noChapters: 'Пролог',
      openPath: 'Відкрити зміст',
      chapterNavigation: 'Навігація за розділами',
    },
    hero: {
      eyebrow: 'ВАШ ОСОБИСТИЙ ПРОСТІР',
      title: 'Ваш шлях триває сьогодні',
      lead: 'Повертайтеся до важливих трактувань, відкривайте карту дня й помічайте, як змінюється ваш особистий контекст.',
      welcome: 'З поверненням',
    },
    card: {
      eyebrow: 'КАРТА СЬОГОДНІ',
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
      title: 'Продовжити останнє читання',
      description: 'Ваш розклад збережено локально й відкриється з того самого місця.',
      continue: 'Продовжити шлях',
      explore: 'Дослідити новий розклад',
      empty: 'Перше читання стане початком вашої особистої лінії.',
    },
    quick: {
      title: 'Ще один крок',
      latestTitle: 'Ваше читання',
      latestDescription: 'Повернутися до останнього трактування.',
      exploreTitle: 'Новий розклад',
      exploreDescription: 'Обрати іншу тему або період.',
      pathTitle: 'Мій шлях',
      pathDescription: 'Переглянути збережені розділи та закладки.',
    },
    upcoming: {
      title: 'Ваш шлях ставатиме глибшим',
      description:
        'Майбутні можливості з’являться тут як продовження вашого досвіду, а не окремий каталог.',
      items: ['Тижневий ритм', 'Особисті колекції', 'Нові теми трактувань'],
    },
    empty: {
      title: 'Ваш шлях починається з першого читання',
      description:
        'Оберіть тему, додайте короткий контекст і відкрийте розклад, до якого можна буде повернутися.',
      primary: 'Відкрити перше читання',
    },
    path: {
      eyebrow: 'ВАША ОСОБИСТА ХРОНОЛОГІЯ',
      title: 'Мій шлях',
      lead: 'Не архів результатів, а лінія читань і спостережень, до яких хочеться повертатися.',
      back: 'Повернутися в Journey',
      journeyMilestone: 'Читання',
      portraitMilestone: 'Особистий портрет',
      preview: 'Незабаром',
      open: 'Відкрити',
      addBookmark: 'Додати закладку',
      addedBookmark: 'Закладку додано',
      removeBookmark: 'Прибрати закладку',
      removedBookmark: 'Закладку прибрано',
      bookmark: 'Із закладкою',
      empty: 'Тут з’явиться ваше перше читання.',
      futureTitle: 'Наступний розділ',
      futureDescription:
        'Майбутні етапи, серії читань і особисті досягнення з’являться тут пізніше.',
    },
    yearBook: {
      eyebrow: 'МАЙБУТНЄ ВИДАННЯ',
      title: 'Створити мою книгу року',
      description:
        'Книга року об’єднає розділи, повторювані теми й обрані вами цитати. Архітектура готова; створення з’явиться пізніше.',
    },
  },
};
