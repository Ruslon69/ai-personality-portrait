import type { Locale } from '@shared/i18n';
import type { TarotDeckTheme } from '../types';
export const deckThemes: readonly {
  id: TarotDeckTheme;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
}[] = [
  {
    id: 'midnight-geometry',
    name: { ru: 'Midnight', en: 'Midnight', uk: 'Midnight' },
    description: {
      ru: 'Глубокий тон и точная геометрия.',
      en: 'Deep tones and precise geometry.',
      uk: 'Глибокий тон і точна геометрія.',
    },
  },
  {
    id: 'cosmic-minimal',
    name: { ru: 'Cosmic', en: 'Cosmic', uk: 'Cosmic' },
    description: {
      ru: 'Тонкие орбиты и спокойное ядро.',
      en: 'Fine orbits and a calm centre.',
      uk: 'Тонкі орбіти й спокійне ядро.',
    },
  },
  {
    id: 'solar-lines',
    name: { ru: 'Royal', en: 'Royal', uk: 'Royal' },
    description: {
      ru: 'Строгая симметрия и тёплый акцент.',
      en: 'Composed symmetry with a warm accent.',
      uk: 'Стримана симетрія й теплий акцент.',
    },
  },
  {
    id: 'deep-water',
    name: { ru: 'Vintage', en: 'Vintage', uk: 'Vintage' },
    description: {
      ru: 'Тонкая гравюра и мягкая глубина.',
      en: 'Fine engraving and softened depth.',
      uk: 'Тонка гравюра й м’яка глибина.',
    },
  },
];
