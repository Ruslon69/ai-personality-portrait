export type TarotArtworkLoadingVariant =
  'assigned' | 'compact' | 'history' | 'leading' | 'revealing' | 'selectable' | 'supporting';

export function shouldLoadTarotFaceArtwork(
  isRevealed: boolean,
  variant: TarotArtworkLoadingVariant,
  preloadFace = false,
) {
  return isRevealed || preloadFace || variant === 'revealing';
}
