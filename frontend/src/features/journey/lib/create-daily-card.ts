import { stableHash, standardTarotDeck } from '@features/tarot';

import type { JourneyDailyCard } from '../types';

export function createDailyCard(identity: string, dateKey: string): JourneyDailyCard {
  const cardHash = stableHash(`${identity}:${dateKey}:card`);
  const orientationHash = stableHash(`${identity}:${dateKey}:orientation`);
  const card = standardTarotDeck.cards[cardHash % standardTarotDeck.cards.length]!;

  return {
    dateKey,
    openedAt: null,
    selection: {
      cardId: card.id,
      orientation: orientationHash % 5 === 0 ? 'reversed' : 'upright',
      positionId: 'daily-focus',
    },
  };
}
