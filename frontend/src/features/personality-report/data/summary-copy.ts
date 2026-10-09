import type { Locale } from '@shared/i18n';

export const summaryCopy = {
  es: {
    eyebrow: 'De un vistazo',
    title: '¿Cómo eres?',
    recommendation: 'Un siguiente paso útil',
    bridgeLead: 'Convierte esta primera observación en un pequeño experimento que puedas probar.',
    open: 'Explorar este paso práctico',
  },
  en: {
    eyebrow: 'At a glance',
    title: 'What are you like?',
    recommendation: 'One useful next step',
    bridgeLead: 'Turn this first insight into a small experiment you can actually try.',
    open: 'Explore this practical step',
  },
  ru: {
    eyebrow: 'Коротко о вас',
    title: 'Какой вы человек?',
    recommendation: 'Один полезный шаг',
    bridgeLead: 'Превратите первое наблюдение в небольшой шаг, который можно попробовать.',
    open: 'Перейти к практическому шагу',
  },
  uk: {
    eyebrow: 'Коротко про вас',
    title: 'Яка ви людина?',
    recommendation: 'Один корисний крок',
    bridgeLead: 'Перетворіть перше спостереження на невеликий крок, який можна спробувати.',
    open: 'Перейти до практичного кроку',
  },
} as const satisfies Record<Locale, unknown>;
