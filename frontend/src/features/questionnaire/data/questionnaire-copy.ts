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
  es: {
    back: 'Volver',
    category: {
      communication: 'comunicación',
      decisions: 'forma de decidir',
      energy: 'energía y descanso',
      motivation: 'motivación',
      openness: 'apertura a lo nuevo',
      pressure: 'respuesta a la presión',
      relationships: 'relaciones',
      uncertainty: 'respuesta a la incertidumbre',
    },
    building: (category) => `Explorando: ${category}`,
    remaining: (count) =>
      count === 0
        ? 'Última pregunta'
        : `${count === 1 ? 'Queda 1 pregunta' : `Quedan ${count} preguntas`}`,
    confirming: 'Añadiendo tu respuesta…',
    checkpointAria: 'Punto del recorrido del retrato',
    checkpoints: [
      'Tu forma de decidir empieza a tomar forma.',
      'Ya vemos varias preferencias que se repiten.',
      'Queda un poco de contexto sobre cómo te comunicas.',
      'La base de tu retrato está lista.',
    ],
    continue: 'Continuar',
    optional: 'Pregunta opcional',
    optionsLegend: (title) => `Opciones de respuesta para: ${title}`,
    progress: (current, total) => `Paso ${current} de ${total}`,
    reactions: [
      'Hemos añadido este contexto.',
      'Comprendemos mejor cómo sueles actuar aquí.',
      'Otra respuesta forma parte del retrato.',
    ],
    required: 'Pregunta obligatoria',
    selected: (count) => `${count} ${count === 1 ? 'seleccionada' : 'seleccionadas'}`,
    selectMultiple: 'Elige una o varias opciones',
    selectOne: 'Elige una opción',
    skip: 'Omitir',
  },
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
    building: (category) => `Exploring: ${category}`,
    remaining: (count) =>
      count === 0 ? 'Final question' : `${count} more ${count === 1 ? 'question' : 'questions'}`,
    confirming: 'Adding your answer…',
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
      'Another answer is now part of the portrait.',
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
      decisions: 'принятие решений',
      energy: 'энергия и восстановление',
      motivation: 'мотивация',
      openness: 'интерес к новому',
      pressure: 'реакция под давлением',
      relationships: 'отношения',
      uncertainty: 'неопределённость',
    },
    building: (category) => `Сейчас — ${category}`,
    remaining: (count) => (count === 0 ? 'Последний вопрос' : `Вопросов впереди: ${count}`),
    confirming: 'Добавляем ваш ответ…',
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
      'Ещё один ответ добавлен в портрет.',
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
      decisions: 'ухвалення рішень',
      energy: 'енергія та відновлення',
      motivation: 'мотивація',
      openness: 'інтерес до нового',
      pressure: 'реакція під тиском',
      relationships: 'стосунки',
      uncertainty: 'невизначеність',
    },
    building: (category) => `Зараз — ${category}`,
    remaining: (count) => (count === 0 ? 'Останнє запитання' : `Запитань попереду: ${count}`),
    confirming: 'Додаємо вашу відповідь…',
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
      'Ще одну відповідь додано до портрета.',
    ],
    required: 'Обов’язкове запитання',
    selected: (count) => `Обрано: ${count}`,
    selectMultiple: 'Оберіть один або кілька варіантів',
    selectOne: 'Оберіть один варіант',
    skip: 'Пропустити',
  },
};

export const interestCopy = {
  es: {
    eyebrow: 'Un detalle personal',
    title: '¿Qué despierta tu interés de verdad?',
    description:
      'Elige entre 3 y 6 temas. Nos ayudan a buscar ejemplos relevantes, no a definir tu carácter.',
    count: (count: number) => `${count} de 6 seleccionados`,
    continue: 'Añadir estos intereses',
    back: 'Volver a las preguntas',
    other: 'Otro tema',
    otherLabel: 'Otro interés (opcional)',
    otherPlaceholder: 'Por ejemplo, arquitectura',
    options: {
      technology: 'Tecnología',
      creativity: 'Creatividad',
      people: 'Personas y relaciones',
      movement: 'Deporte y movimiento',
      travel: 'Viajes',
      learning: 'Aprendizaje',
      business: 'Negocios',
      games: 'Juegos',
      music: 'Música',
      cinema: 'Cine',
      nature: 'Naturaleza',
      selfDevelopment: 'Desarrollo personal',
    },
  },
  en: {
    eyebrow: 'One personal step',
    title: 'What genuinely holds your attention?',
    description:
      'Choose 3–6 directions. They help us choose relevant examples without defining your character.',
    count: (count: number) => `${count} of 6 selected`,
    continue: 'Add these interests',
    back: 'Back to questions',
    other: 'Something else',
    otherLabel: 'Another interest (optional)',
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
    otherLabel: 'Другой интерес (необязательно)',
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
    otherLabel: 'Інший інтерес (необов’язково)',
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
