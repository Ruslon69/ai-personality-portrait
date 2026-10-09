import { productContractCopy } from '@shared/i18n/product-contract-copy';
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
    secondary: string;
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
    details: string;
    manage: string;
    session: string;
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
    numerologyContinue: string;
    numerologySession: string;
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
      eyebrow: 'Личное пространство',
      title: 'Ваши результаты',
      lead: 'Откройте последний разбор или посмотрите всё, что сохранили раньше.',
      welcome: 'С возвращением',
    },
    card: {
      eyebrow: productContractCopy.ru.dailyTitle,
      title: 'Один символ для размышления сегодня',
      meaning: 'Короткая мысль',
      action: 'Попробуйте сегодня',
      open: productContractCopy.ru.dailyOpen,
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
      numerologyContinue: 'Вернуться к Нумерологии',
      numerologySession: 'Можно снова открыть разбор в этой вкладке',
      title: 'Продолжить исследование',
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
        'Начните с расклада или личного разбора. Здесь вы сможете вернуться к тому, что открыли для себя.',
      primary: 'Начать расклад',
      secondary: 'Исследовать свой портрет',
    },
    path: {
      details: 'Краткий итог',
      manage: 'Управлять сохранёнными раскладами',
      session: 'Доступно до перезагрузки страницы',
      eyebrow: 'Личный архив',
      title: 'История',
      lead: 'Расклады и личные разборы — от новых к старым.',
      back: 'К результатам',
      journeyMilestone: 'Расклад Таро',
      portraitMilestone: 'Портрет',
      preview: 'Скоро',
      open: 'Открыть',
      addBookmark: 'Добавить закладку',
      addedBookmark: 'Закладка добавлена',
      removeBookmark: 'Убрать закладку',
      removedBookmark: 'Закладка убрана',
      bookmark: 'С закладкой',
      empty:
        'Завершённые расклады останутся в этом браузере. Личные разборы доступны до обновления или закрытия страницы.',
      futureTitle: 'Новые результаты',
      futureDescription: 'Новые сохранённые расклады и разборы появятся здесь.',
    },
    yearBook: {
      eyebrow: 'Скоро',
      title: 'Итоги года',
      description: 'Сохранённые результаты можно будет собрать в один обзор за год.',
    },
  },
  es: {
    book: {
      title: 'Mis resultados',
      reader: 'Visitante',
      firstChapter: 'Primer resultado',
      currentChapter: 'Último resultado',
      noChapters: 'Aún no hay resultados',
      openPath: 'Todos los resultados',
      chapterNavigation: 'Resultados guardados',
    },
    hero: {
      eyebrow: 'Espacio personal',
      title: 'Tus resultados',
      lead: 'Abre tu última lectura o revisa todo lo que has guardado.',
      welcome: 'Qué bueno tenerte de vuelta',
    },
    card: {
      eyebrow: productContractCopy.es.dailyTitle,
      title: 'Un símbolo para reflexionar hoy',
      meaning: 'Una idea para considerar',
      action: 'Pruébalo hoy',
      open: productContractCopy.es.dailyOpen,
      opened: 'Guardada como carta de hoy',
    },
    numbers: {
      title: 'El contexto numérico de hoy',
      description:
        'Tus ciclos personales se calculan a partir de tu fecha de nacimiento y del día actual.',
      year: 'Año personal',
      month: 'Mes personal',
      day: 'Número de hoy',
      noDate:
        'Añade tu fecha de nacimiento en la primera lectura para ver tus ciclos personales aquí.',
    },
    latest: {
      title: 'Última lectura',
      description: 'Tu lectura está guardada en este navegador.',
      continue: 'Abrir la última lectura',
      explore: 'Nueva lectura',
      empty: 'Tu primer resultado guardado aparecerá aquí.',
    },
    quick: {
      numerologyContinue: 'Volver a Numerología',
      numerologySession: 'Puedes volver a abrir la lectura en esta pestaña',
      title: 'Sigue explorando',
      latestTitle: 'Abrir mi retrato',
      latestDescription: 'Vuelve a tu último retrato.',
      exploreTitle: 'Nueva lectura',
      exploreDescription: 'Elige otro tema o periodo.',
      pathTitle: 'Historial',
      pathDescription: 'Consulta tus resultados guardados y favoritos.',
    },
    upcoming: {
      title: 'Más posibilidades con el tiempo',
      description: 'Más adelante encontrarás nuevas formas de guardar y comparar resultados.',
      items: ['Ritmo semanal', 'Colecciones personales', 'Nuevos temas de interpretación'],
    },
    empty: {
      title: 'Tus resultados aparecerán aquí',
      description:
        'Empieza con una lectura o una reflexión personal. Vuelve aquí para revisar lo que has descubierto.',
      primary: 'Empezar una lectura',
      secondary: 'Explorar tu retrato',
    },
    path: {
      details: 'Resumen de la lectura',
      manage: 'Gestionar lecturas guardadas',
      session: 'Disponible hasta que recargues la página',
      eyebrow: 'Archivo personal',
      title: 'Historial',
      lead: 'Lecturas de Tarot y reflexiones personales, de la más reciente a la más antigua.',
      back: 'Volver a los resultados',
      journeyMilestone: 'Lectura de Tarot',
      portraitMilestone: 'Retrato',
      preview: 'Próximamente',
      open: 'Abrir',
      addBookmark: 'Añadir a favoritos',
      addedBookmark: 'Añadido a favoritos',
      removeBookmark: 'Quitar de favoritos',
      removedBookmark: 'Quitado de favoritos',
      bookmark: 'En favoritos',
      empty:
        'Las lecturas de Tarot completadas se conservan en este navegador. Los retratos están disponibles hasta que recargues o cierres la página.',
      futureTitle: 'Nuevos resultados',
      futureDescription: 'Aquí aparecerán las nuevas lecturas y reflexiones guardadas.',
    },
    yearBook: {
      eyebrow: 'Más adelante',
      title: 'Tu año en perspectiva',
      description: 'Podrás reunir tus resultados guardados en una mirada al año.',
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
      eyebrow: 'Personal space',
      title: 'Your results',
      lead: 'Open your latest reading or see everything you saved before.',
      welcome: 'Welcome back',
    },
    card: {
      eyebrow: productContractCopy.en.dailyTitle,
      title: 'One symbol to reflect on today',
      meaning: 'A thought to consider',
      action: 'Try this today',
      open: productContractCopy.en.dailyOpen,
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
      numerologyContinue: 'Return to Numerology',
      numerologySession: 'You can reopen the reading in this tab',
      title: 'Keep exploring',
      latestTitle: 'Open my portrait',
      latestDescription: 'Return to your latest portrait.',
      exploreTitle: 'New reading',
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
        'Begin with a reading or personal reflection. Return here to revisit what you discovered.',
      primary: 'Start a reading',
      secondary: 'Explore your portrait',
    },
    path: {
      details: 'Reading summary',
      manage: 'Manage saved readings',
      session: 'Available until you reload the page',
      eyebrow: 'Personal archive',
      title: 'History',
      lead: 'Tarot readings and personal reflections, newest first.',
      back: 'Back to results',
      journeyMilestone: 'Tarot reading',
      portraitMilestone: 'Portrait',
      preview: 'Coming next',
      open: 'Open',
      addBookmark: 'Add bookmark',
      addedBookmark: 'Bookmark added',
      removeBookmark: 'Remove bookmark',
      removedBookmark: 'Bookmark removed',
      bookmark: 'Bookmarked',
      empty:
        'Completed Tarot readings stay in this browser. Portraits stay available until you reload or close the page.',
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
      eyebrow: 'Особистий простір',
      title: 'Ваші результати',
      lead: 'Відкрийте останній розбір або перегляньте все, що зберегли раніше.',
      welcome: 'З поверненням',
    },
    card: {
      eyebrow: productContractCopy.uk.dailyTitle,
      title: 'Один символ для роздумів сьогодні',
      meaning: 'Короткий погляд',
      action: 'Спробуйте сьогодні',
      open: productContractCopy.uk.dailyOpen,
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
      numerologyContinue: 'Повернутися до Нумерології',
      numerologySession: 'Можна знову відкрити розбір у цій вкладці',
      title: 'Продовжити дослідження',
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
        'Почніть із розкладу або особистого розбору. Тут ви зможете повернутися до того, що відкрили для себе.',
      primary: 'Почати розклад',
      secondary: 'Дослідити свій портрет',
    },
    path: {
      details: 'Короткий підсумок',
      manage: 'Керувати збереженими розкладами',
      session: 'Доступно до перезавантаження сторінки',
      eyebrow: 'Особистий архів',
      title: 'Історія',
      lead: 'Розклади й особисті розбори — від нових до старих.',
      back: 'До результатів',
      journeyMilestone: 'Розклад Таро',
      portraitMilestone: 'Портрет',
      preview: 'Незабаром',
      open: 'Відкрити',
      addBookmark: 'Додати закладку',
      addedBookmark: 'Закладку додано',
      removeBookmark: 'Прибрати закладку',
      removedBookmark: 'Закладку прибрано',
      bookmark: 'Із закладкою',
      empty:
        'Завершені розклади залишаться в цьому браузері. Особисті розбори доступні до оновлення або закриття сторінки.',
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
