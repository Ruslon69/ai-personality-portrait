export type TarotCardVisualFace = 'back' | 'flipping' | 'front';

export type TarotCardRevealStatus = 'locked' | 'ready' | 'revealing' | 'revealed';

export function resolveTarotCardVisualFace(
  isRevealed: boolean,
  revealStatus: TarotCardRevealStatus | undefined,
): TarotCardVisualFace {
  if (!isRevealed) return 'back';
  if (revealStatus === undefined || revealStatus === 'revealed') return 'front';
  return 'flipping';
}
