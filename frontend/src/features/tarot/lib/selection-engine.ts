import type { TarotCard, TarotCardSelection, TarotSpread } from '../types';
import { seededShuffle, stableHash } from './seeded-shuffle';

function orientation(seed: string, cardId: string, index: number) {
  return stableHash(`${seed}:${cardId}:${index}:orientation`) % 5 === 0 ? 'reversed' : 'upright';
}

export function createAutomaticSelections(
  cards: readonly TarotCard[],
  spread: TarotSpread,
  seed: string,
): readonly TarotCardSelection[] {
  return seededShuffle(cards, `${seed}:${spread.id}:automatic`)
    .slice(0, spread.positions.length)
    .map((card, index) => ({
      cardId: card.id,
      orientation: orientation(seed, card.id, index),
      positionId: spread.positions[index]?.id ?? `position-${index}`,
    }));
}

export function createManualCandidates(
  cards: readonly TarotCard[],
  spread: TarotSpread,
  seed: string,
) {
  const count = Math.max(12, spread.positions.length * 2);
  return seededShuffle(cards, `${seed}:${spread.id}:manual-candidates`).slice(0, count);
}

export function createManualSelections(
  cardIds: readonly string[],
  spread: TarotSpread,
  seed: string,
): readonly TarotCardSelection[] {
  return cardIds.slice(0, spread.positions.length).map((cardId, index) => ({
    cardId,
    orientation: orientation(seed, cardId, index),
    positionId: spread.positions[index]?.id ?? `position-${index}`,
  }));
}
