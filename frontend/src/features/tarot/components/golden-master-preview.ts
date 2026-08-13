import type { TarotCardArtwork } from '@assets/tarot';

const GOLDEN_MASTER_CARD_ID = 'major-fool';
const GOLDEN_MASTER_PREVIEW_QUERY = 'tarotGoldenMaster';
const GOLDEN_MASTER_PREVIEW_ASSET =
  '/premium-production/generated/golden-master-runtime-preview.jpg';

export function withGoldenMasterDevelopmentPreview(
  cardId: string,
  artwork: TarotCardArtwork | undefined,
) {
  if (
    !import.meta.env.DEV ||
    typeof window === 'undefined' ||
    !artwork ||
    cardId !== GOLDEN_MASTER_CARD_ID
  )
    return artwork;
  const selectedCardId = new URLSearchParams(window.location.search).get(
    GOLDEN_MASTER_PREVIEW_QUERY,
  );
  if (selectedCardId !== GOLDEN_MASTER_CARD_ID) return artwork;

  return {
    ...artwork,
    artworkVersion: 'premium-tarot-golden-master-development-preview',
    editionId: 'premium-rws-remastered-golden-master-preview',
    faceAsset: GOLDEN_MASTER_PREVIEW_ASSET,
    layers: [
      ...artwork.layers,
      {
        asset: GOLDEN_MASTER_PREVIEW_ASSET,
        depth: 0.02,
        id: 'golden-master-development-preview',
        required: false,
        role: 'midground' as const,
      },
    ],
    quality: 'premium' as const,
    sourceKind: 'ai-painting' as const,
  };
}
