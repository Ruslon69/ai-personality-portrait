import type { Locale } from '@shared/i18n';
import type { TarotDeckTheme } from '../types';
export const deckThemes: readonly {
  id: TarotDeckTheme;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
}[] = [
  {
    id: 'cosmic-minimal',
    name: {
      ru: 'Classic Arcana',
      es: 'Arcanos clásicos',
      en: 'Classic Arcana',
      uk: 'Classic Arcana',
    },
    description: {
      ru: 'Старое золото, состаренный пергамент и символы солнца, луны и взгляда.',
      es: 'Oro antiguo, pergamino envejecido y símbolos del sol, la luna y la mirada.',
      en: 'Old gold, aged parchment and the symbols of sun, moon and sight.',
      uk: 'Старе золото, зістарений пергамент і символи сонця, місяця та погляду.',
    },
  },
  {
    id: 'solar-lines',
    name: { ru: 'Lunar', es: 'Lunar', en: 'Lunar', uk: 'Lunar' },
    description: {
      ru: 'Глубокий синий, серебряные фазы луны и тихое поле звёзд.',
      es: 'Azul medianoche, fases lunares plateadas y un cielo de estrellas sereno.',
      en: 'Deep navy, silver moon phases and a quiet field of stars.',
      uk: 'Глибокий синій, срібні фази місяця й тихе поле зірок.',
    },
  },
  {
    id: 'midnight-geometry',
    name: { ru: 'Celestial', es: 'Celeste', en: 'Celestial', uk: 'Celestial' },
    description: {
      ru: 'Тёмно-синий фон, приглушённое золото и печать в духе астролябии.',
      es: 'Azul oscuro, geometría dorada tenue y un sello que evoca un astrolabio.',
      en: 'Dark blue, muted gold geometry and an astrolabe-like seal.',
      uk: 'Темно-синє тло, приглушене золото й печатка в дусі астролябії.',
    },
  },
  {
    id: 'deep-water',
    name: { ru: 'Nocturne', es: 'Nocturno', en: 'Nocturne', uk: 'Nocturne' },
    description: {
      ru: 'Почти чёрная бумага, бронзовая гравюра и орнаментальная мистическая печать.',
      es: 'Papel casi negro, grabado en bronce y un sello místico ornamental.',
      en: 'Near-black paper, bronze engraving and an ornamental mystic seal.',
      uk: 'Майже чорний папір, бронзове гравіювання й орнаментальна містична печатка.',
    },
  },
];
