import type { Locale } from '@shared/i18n';

export const revealCopy = {
  es: {
    eyebrow: 'Tu retrato está listo',
    symbol: 'El símbolo abstracto de tu retrato personal',
    open: 'Abrir mi retrato',
  },
  en: {
    eyebrow: 'Your portrait is ready',
    symbol: 'Your personal abstract portrait mark',
    open: 'Open my portrait',
  },
  ru: {
    eyebrow: 'Ваш портрет готов',
    symbol: 'Ваш персональный абстрактный знак портрета',
    open: 'Открыть мой портрет',
  },
  uk: {
    eyebrow: 'Ваш портрет готовий',
    symbol: 'Ваш персональний абстрактний знак портрета',
    open: 'Відкрити мій портрет',
  },
} as const satisfies Record<Locale, unknown>;
