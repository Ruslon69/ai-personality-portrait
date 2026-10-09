import type { Locale } from '@shared/i18n';

export const assemblyCopy = {
  es: {
    answers: 'Respuestas',
    interests: 'Intereses',
    voice: 'Voz',
    date: 'Fecha de nacimiento',
    engine: 'Conexiones',
  },
  en: {
    answers: 'Answers',
    interests: 'Interests',
    voice: 'Voice',
    date: 'Birth date',
    engine: 'Connections',
  },
  ru: {
    answers: 'Ответы',
    interests: 'Интересы',
    voice: 'Голос',
    date: 'Дата рождения',
    engine: 'Связи',
  },
  uk: {
    answers: 'Відповіді',
    interests: 'Інтереси',
    voice: 'Голос',
    date: 'Дата народження',
    engine: 'Зв’язки',
  },
} as const satisfies Record<Locale, unknown>;
