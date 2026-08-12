import type { TarotCardSelection } from '../types';

export type TarotArtworkRotation = '0deg' | '180deg';

export function getTarotArtworkRotation(
  orientation: TarotCardSelection['orientation'] | undefined,
): TarotArtworkRotation {
  return orientation === 'reversed' ? '180deg' : '0deg';
}
