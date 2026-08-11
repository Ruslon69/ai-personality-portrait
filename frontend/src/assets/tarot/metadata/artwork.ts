export type TarotArtworkRightsStatus =
  'verified-public-domain' | 'licensed' | 'original' | 'placeholder' | 'unknown';

export type TarotCardArtwork = {
  artworkVersion: string;
  aspectRatio: '2 / 3';
  attributionId?: string;
  cardId: string;
  faceAsset: string | null;
  fallbackAsset: 'internal-symbolic-v1';
  rightsStatus: TarotArtworkRightsStatus;
  sourceId?: string;
};

const majorIds = [
  'fool',
  'magician',
  'high-priestess',
  'empress',
  'emperor',
  'hierophant',
  'lovers',
  'chariot',
  'strength',
  'hermit',
  'wheel',
  'justice',
  'hanged-man',
  'death',
  'temperance',
  'devil',
  'tower',
  'star',
  'moon',
  'sun',
  'judgement',
  'world',
] as const;

const suits = ['wands', 'cups', 'swords', 'pentacles'] as const;
const ranks = [
  'ace',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'page',
  'knight',
  'queen',
  'king',
] as const;

const cardIds = [
  ...majorIds.map((id) => `major-${id}`),
  ...suits.flatMap((suit) => ranks.map((rank) => `${suit}-${rank}`)),
];

export const tarotArtworkManifest: ReadonlyMap<string, TarotCardArtwork> = new Map(
  cardIds.map((cardId) => [
    cardId,
    {
      artworkVersion: 'tarot-artwork-placeholder-v1',
      aspectRatio: '2 / 3',
      cardId,
      faceAsset: null,
      fallbackAsset: 'internal-symbolic-v1',
      rightsStatus: 'placeholder',
    },
  ]),
);

export function getTarotCardArtwork(cardId: string): TarotCardArtwork {
  return (
    tarotArtworkManifest.get(cardId) ?? {
      artworkVersion: 'tarot-artwork-unknown-v1',
      aspectRatio: '2 / 3',
      cardId,
      faceAsset: null,
      fallbackAsset: 'internal-symbolic-v1',
      rightsStatus: 'unknown',
    }
  );
}
