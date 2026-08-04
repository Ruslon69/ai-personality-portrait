import type { Locale } from '@shared/i18n';

export const questionnaireCopy: Record<
  Locale,
  {
    back: string;
    checkpointAria: string;
    category: Record<string, string>;
    building: (category: string) => string;
    remaining: (count: number) => string;
    confirming: string;
    checkpoints: readonly string[];
    continue: string;
    optional: string;
    optionsLegend: (title: string) => string;
    progress: (current: number, total: number) => string;
    reactions: readonly string[];
    required: string;
    selected: (count: number) => string;
    selectMultiple: string;
    selectOne: string;
    skip: string;
  }
> = {
  en: {
    back: 'Back',
    category: {
      communication: 'communication',
      decisions: 'decision style',
      energy: 'energy and recovery',
      motivation: 'motivation',
      openness: 'openness to new things',
      pressure: 'response under pressure',
      relationships: 'relationships',
      uncertainty: 'response to uncertainty',
    },
    building: (category) => `Now assembling: ${category}`,
    remaining: (count) => `${count} situations left`,
    confirming: 'Adding this facet…',
    checkpointAria: 'Portrait checkpoint',
    checkpoints: [
      'Your decision style is beginning to take shape.',
      'We can already see several recurring preferences.',
      'A little more context about communication remains.',
      'The foundation of your portrait is ready.',
    ],
    continue: 'Continue',
    optional: 'Optional question',
    optionsLegend: (title) => `Answer options for: ${title}`,
    progress: (current, total) => `Step ${current} of ${total}`,
    reactions: [
      'This context has been added.',
      'We understand how you tend to act here.',
      'Another facet is now part of the portrait.',
    ],
    required: 'Required question',
    selected: (count) => `${count} selected`,
    selectMultiple: 'Choose one or more options',
    selectOne: 'Choose one option',
    skip: 'Skip',
  },
  ru: {
    back: 'Назад',
    category: {
      communication: 'стиль общения',
      decisions: 'способ решений',
      energy: 'энергия и восстановление',
      motivation: 'мотивация',
      openness: 'интерес к новому',
      pressure: 'реакция под давлением',
      relationships: 'отношения',
      uncertainty: 'неопределённость',
    },
    building: (category) => `Сейчас собираем: ${category}`,
    remaining: (count) => `Осталось ситуаций: ${count}`,
    confirming: 'Добавляем эту грань…',
    checkpointAria: 'Промежуточный результат',
    checkpoints: [
      'Ваш стиль решений начинает проявляться.',
      'Мы уже видим несколько повторяющихся предпочтений.',
      'Осталось добавить немного контекста общения.',
      'Основа портрета готова.',
    ],
    continue: 'Продолжить',
    optional: 'Можно пропустить',
    optionsLegend: (title) => `Варианты ответа на вопрос: ${title}`,
    progress: (current, total) => `Шаг ${current} из ${total}`,
    reactions: [
      'Этот контекст добавлен.',
      'Поняли, как вы чаще действуете в такой ситуации.',
      'Ещё одна грань портрета готова.',
    ],
    required: 'Обязательный вопрос',
    selected: (count) => `Выбрано: ${count}`,
    selectMultiple: 'Выберите один или несколько вариантов',
    selectOne: 'Выберите один вариант',
    skip: 'Пропустить',
  },
  uk: {
    back: 'Назад',
    category: {
      communication: 'стиль спілкування',
      decisions: 'спосіб рішень',
      energy: 'енергія та відновлення',
      motivation: 'мотивація',
      openness: 'інтерес до нового',
      pressure: 'реакція під тиском',
      relationships: 'стосунки',
      uncertainty: 'невизначеність',
    },
    building: (category) => `Зараз збираємо: ${category}`,
    remaining: (count) => `Залишилося ситуацій: ${count}`,
    confirming: 'Додаємо цю грань…',
    checkpointAria: 'Проміжний результат',
    checkpoints: [
      'Ваш стиль рішень починає проявлятися.',
      'Ми вже бачимо кілька повторюваних уподобань.',
      'Залишилося додати трохи контексту спілкування.',
      'Основа портрета готова.',
    ],
    continue: 'Продовжити',
    optional: 'Можна пропустити',
    optionsLegend: (title) => `Варіанти відповіді на запитання: ${title}`,
    progress: (current, total) => `Крок ${current} із ${total}`,
    reactions: [
      'Цей контекст додано.',
      'Зрозуміли, як ви частіше дієте в такій ситуації.',
      'Ще одна грань портрета готова.',
    ],
    required: 'Обов’язкове запитання',
    selected: (count) => `Обрано: ${count}`,
    selectMultiple: 'Оберіть один або кілька варіантів',
    selectOne: 'Оберіть один варіант',
    skip: 'Пропустити',
  },
};

export const interestCopy = {
  en: {
    eyebrow: 'One personal step',
    title: 'What genuinely holds your attention?',
    description: 'Choose 3–6 directions. They personalize examples, not define your character.',
    count: (count: number) => `${count} of 6 selected`,
    continue: 'Add these interests',
    back: 'Back to questions',
    other: 'Something else',
    otherLabel: 'Optional short interest',
    otherPlaceholder: 'For example, architecture',
    options: {
      technology: 'Technology',
      creativity: 'Creativity',
      people: 'People & relationships',
      movement: 'Sport & movement',
      travel: 'Travel',
      learning: 'Learning',
      business: 'Business',
      games: 'Games',
      music: 'Music',
      cinema: 'Film',
      nature: 'Nature',
      selfDevelopment: 'Self-development',
    },
  },
  ru: {
    eyebrow: 'Один личный шаг',
    title: 'Что действительно удерживает ваше внимание?',
    description:
      'Выберите 3–6 направлений. Они персонализируют примеры, но не определяют характер.',
    count: (count: number) => `Выбрано ${count} из 6`,
    continue: 'Добавить интересы',
    back: 'Назад к вопросам',
    other: 'Другое',
    otherLabel: 'Необязательный короткий интерес',
    otherPlaceholder: 'Например, архитектура',
    options: {
      technology: 'Технологии',
      creativity: 'Творчество',
      people: 'Люди и отношения',
      movement: 'Спорт и движение',
      travel: 'Путешествия',
      learning: 'Обучение',
      business: 'Бизнес',
      games: 'Игры',
      music: 'Музыка',
      cinema: 'Кино',
      nature: 'Природа',
      selfDevelopment: 'Саморазвитие',
    },
  },
  uk: {
    eyebrow: 'Один особистий крок',
    title: 'Що справді утримує вашу увагу?',
    description: 'Оберіть 3–6 напрямів. Вони персоналізують приклади, але не визначають характер.',
    count: (count: number) => `Обрано ${count} із 6`,
    continue: 'Додати інтереси',
    back: 'Назад до запитань',
    other: 'Інше',
    otherLabel: 'Необов’язковий короткий інтерес',
    otherPlaceholder: 'Наприклад, архітектура',
    options: {
      technology: 'Технології',
      creativity: 'Творчість',
      people: 'Люди та стосунки',
      movement: 'Спорт і рух',
      travel: 'Подорожі',
      learning: 'Навчання',
      business: 'Бізнес',
      games: 'Ігри',
      music: 'Музика',
      cinema: 'Кіно',
      nature: 'Природа',
      selfDevelopment: 'Саморозвиток',
    },
  },
} as const;
