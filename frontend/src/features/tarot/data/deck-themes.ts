import type { Locale } from '@shared/i18n';
import type { TarotDeckTheme } from '../types';
export const deckThemes: readonly {
  id: TarotDeckTheme;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
}[] = [
  {
    id: 'cosmic-minimal',
    name: { ru: 'Classic', en: 'Classic', uk: 'Classic' },
    description: {
      ru: 'Кремовая бумага, винтажный орнамент и сдержанные цвета.',
      en: 'Cream paper, vintage ornament and restrained colour.',
      uk: 'Кремовий папір, вінтажний орнамент і стримані кольори.',
    },
  },
  {
    id: 'solar-lines',
    name: { ru: 'Royal', en: 'Royal', uk: 'Royal' },
    description: {
      ru: 'Глубокий синий, строгая симметрия и золотой акцент.',
      en: 'Deep blue, composed symmetry and a gold accent.',
      uk: 'Глибокий синій, стримана симетрія й золотий акцент.',
    },
  },
  {
    id: 'midnight-geometry',
    name: { ru: 'Midnight', en: 'Midnight', uk: 'Midnight' },
    description: {
      ru: 'Графитовый тон и спокойная геометрия.',
      en: 'A charcoal tone with quiet geometry.',
      uk: 'Графітовий тон і спокійна геометрія.',
    },
  },
  {
    id: 'deep-water',
    name: { ru: 'Obsidian', en: 'Obsidian', uk: 'Obsidian' },
    description: {
      ru: 'Чёрный фон, тонкая гравюра и матовый блеск.',
      en: 'Black ground, fine engraving and a matte sheen.',
      uk: 'Чорне тло, тонке гравіювання й матовий блиск.',
    },
  },
];
