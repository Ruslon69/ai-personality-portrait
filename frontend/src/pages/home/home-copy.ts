import type { Locale } from '@shared/i18n';

export const homeCopy = {
  ru: {
    eyebrow: 'Soul Arkana',
    title: 'Узнайте больше о себе',
    lead: 'Посмотрите на свою ситуацию через карты Таро. Другие способы узнать о себе можно выбрать ниже.',
    primary: 'Начать расклад',
    trust: ['3–5 минут', 'Понятный результат', 'Сохраняется в браузере'],
    directionsTitle: 'Другие способы узнать о себе',
    note: 'Результаты помогают поразмышлять о себе и не заменяют профессиональную консультацию.',
    directions: [
      {
        id: 'numerology',
        badge: 'По дате рождения',
        title: 'Что говорит дата рождения?',
        description: 'Узнайте основные черты и тему текущего периода.',
        cta: 'Узнать',
      },
      {
        id: 'portrait',
        badge: 'Вопросы о себе',
        title: 'Какой я человек?',
        description: 'Ответьте на несколько вопросов и получите понятное описание себя.',
        cta: 'Начать разбор',
      },
    ],
  },
  es: {
    eyebrow: 'Soul Arkana',
    title: 'Descubre más sobre ti',
    lead: 'Mira tu situación desde una lectura de Tarot. Más abajo encontrarás otras formas de reflexionar.',
    primary: 'Empezar una lectura de Tarot',
    trust: ['3–5 minutos', 'Ideas claras', 'Guardado en tu navegador'],
    directionsTitle: 'Otras formas de conocerte',
    note: 'Los resultados están pensados para la reflexión personal y no sustituyen el asesoramiento profesional.',
    directions: [
      {
        id: 'numerology',
        badge: 'Por fecha de nacimiento',
        title: '¿Qué cuenta tu fecha de nacimiento?',
        description: 'Explora tus rasgos principales y el tema de tu periodo actual.',
        cta: 'Descubrirlo',
      },
      {
        id: 'portrait',
        badge: 'Preguntas sobre ti',
        title: '¿Cómo soy?',
        description: 'Responde unas preguntas y recibe una descripción clara de ti.',
        cta: 'Crear mi retrato',
      },
    ],
  },
  en: {
    eyebrow: 'Soul Arkana',
    title: 'Learn more about yourself',
    lead: 'See your situation through a Tarot reading. You can explore other ways to reflect below.',
    primary: 'Start a Tarot reading',
    trust: ['3–5 minutes', 'Clear takeaways', 'Saved in your browser'],
    directionsTitle: 'Other ways to learn about yourself',
    note: 'Results are designed for personal reflection and do not replace professional advice.',
    directions: [
      {
        id: 'numerology',
        badge: 'By birth date',
        title: 'What does your birth date say?',
        description: 'See your key traits and the theme of your current period.',
        cta: 'Find out',
      },
      {
        id: 'portrait',
        badge: 'Questions about you',
        title: 'What am I like?',
        description: 'Answer a few questions and get a clear description of yourself.',
        cta: 'Create my portrait',
      },
    ],
  },
  uk: {
    eyebrow: 'Soul Arkana',
    title: 'Дізнайтеся більше про себе',
    lead: 'Погляньте на свою ситуацію через карти Таро. Інші способи дізнатися про себе можна обрати нижче.',
    primary: 'Почати розклад',
    trust: ['3–5 хвилин', 'Зрозумілий результат', 'Зберігається у браузері'],
    directionsTitle: 'Інші способи дізнатися про себе',
    note: 'Результати допомагають поміркувати про себе й не замінюють професійної консультації.',
    directions: [
      {
        id: 'numerology',
        badge: 'За датою народження',
        title: 'Що говорить дата народження?',
        description: 'Дізнайтеся про основні риси й тему поточного періоду.',
        cta: 'Дізнатися',
      },
      {
        id: 'portrait',
        badge: 'Запитання про себе',
        title: 'Яка я людина?',
        description: 'Дайте відповідь на кілька запитань і отримайте зрозумілий опис себе.',
        cta: 'Почати розбір',
      },
    ],
  },
} as const satisfies Record<Locale, unknown>;
