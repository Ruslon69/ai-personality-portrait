import type { Locale } from '@shared/i18n';
import type { TarotDeckTheme } from '../types';
export const deckThemes: readonly {
  id: TarotDeckTheme;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
}[] = [
  {
    id: 'cosmic-minimal',
    name: { ru: 'Classic Arcana', en: 'Classic Arcana', uk: 'Classic Arcana' },
    description: {
      ru: 'Старое золото, состаренный пергамент и символы солнца, луны и взгляда.',
      en: 'Old gold, aged parchment and the symbols of sun, moon and sight.',
      uk: 'Старе золото, зістарений пергамент і символи сонця, місяця та погляду.',
    },
  },
  {
    id: 'solar-lines',
    name: { ru: 'Lunar', en: 'Lunar', uk: 'Lunar' },
    description: {
      ru: 'Глубокий синий, серебряные фазы луны и тихое поле звёзд.',
      en: 'Deep navy, silver moon phases and a quiet field of stars.',
      uk: 'Глибокий синій, срібні фази місяця й тихе поле зірок.',
    },
  },
  {
    id: 'midnight-geometry',
    name: { ru: 'Celestial', en: 'Celestial', uk: 'Celestial' },
    description: {
      ru: 'Тёмно-синий фон, приглушённое золото и печать в духе астролябии.',
      en: 'Dark blue, muted gold geometry and an astrolabe-like seal.',
      uk: 'Темно-синє тло, приглушене золото й печатка в дусі астролябії.',
    },
  },
  {
    id: 'deep-water',
    name: { ru: 'Nocturne', en: 'Nocturne', uk: 'Nocturne' },
    description: {
      ru: 'Почти чёрная бумага, бронзовая гравюра и орнаментальная мистическая печать.',
      en: 'Near-black paper, bronze engraving and an ornamental mystic seal.',
      uk: 'Майже чорний папір, бронзове гравіювання й орнаментальна містична печатка.',
    },
  },
];
