import { RWS_CLASSIC_DECK_ID } from './deck';

export type TarotArtworkRightsStatus =
  'verified-public-domain' | 'licensed' | 'original' | 'placeholder' | 'unknown';
export type TarotArtworkDeckId = typeof RWS_CLASSIC_DECK_ID;
export type TarotArtworkFamily = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotArtworkPalette = {
  accentTone: string;
  dominantTone: string;
  frameTone: string;
  lightTone: string;
};

export type TarotCardArtwork = {
  artworkVersion: string;
  aspectRatio: '7 / 12';
  attributionId?: string;
  cardId: string;
  deckId: TarotArtworkDeckId;
  faceAsset: string | null;
  fallbackAsset: 'internal-symbolic-v1';
  height: number;
  isFallback: boolean;
  palette: TarotArtworkPalette;
  paletteFamily: TarotArtworkFamily;
  rightsStatus: TarotArtworkRightsStatus;
  sourceId?: string;
  width: number;
};

const faceAssets = import.meta.glob('../cards/rws/**/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Readonly<Record<string, string>>;

const majorArtworkSlugs = [
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
const minorRanks = [
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
const minorSuits = ['wands', 'cups', 'swords', 'pentacles'] as const;
export const tarotArtworkPalettes: Readonly<Record<TarotArtworkFamily, TarotArtworkPalette>> = {
  major: {
    accentTone: '#9b793e',
    dominantTone: '#e7dcc4',
    frameTone: '#77603d',
    lightTone: '#fff7df',
  },
  wands: {
    accentTone: '#a7613f',
    dominantTone: '#e5d4bb',
    frameTone: '#76503a',
    lightTone: '#fff0d6',
  },
  cups: {
    accentTone: '#4f7f83',
    dominantTone: '#d4ddda',
    frameTone: '#4e6867',
    lightTone: '#eef9f6',
  },
  swords: {
    accentTone: '#65737c',
    dominantTone: '#d8d9d5',
    frameTone: '#515c62',
    lightTone: '#f5f6f2',
  },
  pentacles: {
    accentTone: '#8a7941',
    dominantTone: '#dcd8bd',
    frameTone: '#60603b',
    lightTone: '#f7f0d1',
  },
};
const verifiedAssetPaths = new Map<string, string>([
  ...majorArtworkSlugs.map(
    (slug, index) =>
      [
        `major-${slug}`,
        `../cards/rws/major/${String(index).padStart(2, '0')}-${slug}.jpg`,
      ] as const,
  ),
  ...minorSuits.flatMap((suit) =>
    minorRanks.map(
      (rank) => [`${suit}-${rank}`, `../cards/rws/${suit}/${rank}-${suit}.jpg`] as const,
    ),
  ),
]);

function fallbackArtwork(cardId: string): TarotCardArtwork {
  return {
    artworkVersion: 'tarot-artwork-placeholder-v1',
    aspectRatio: '7 / 12',
    cardId,
    deckId: RWS_CLASSIC_DECK_ID,
    faceAsset: null,
    fallbackAsset: 'internal-symbolic-v1',
    height: 12,
    isFallback: true,
    palette: tarotArtworkPalettes.major,
    paletteFamily: 'major',
    rightsStatus: 'placeholder',
    width: 7,
  };
}

export const tarotArtworkManifest: ReadonlyMap<string, TarotCardArtwork> = new Map(
  [...verifiedAssetPaths].map(([cardId, localAssetPath]) => {
    const faceAsset = faceAssets[localAssetPath];
    const paletteFamily = minorSuits.find((suit) => cardId.startsWith(`${suit}-`)) ?? 'major';
    const artwork: TarotCardArtwork = faceAsset
      ? {
          artworkVersion: 'rws-classic-public-domain-v1',
          aspectRatio: '7 / 12',
          cardId,
          deckId: RWS_CLASSIC_DECK_ID,
          faceAsset,
          fallbackAsset: 'internal-symbolic-v1',
          height: 12,
          isFallback: false,
          palette: tarotArtworkPalettes[paletteFamily],
          paletteFamily,
          rightsStatus: 'verified-public-domain',
          width: 7,
        }
      : fallbackArtwork(cardId);
    return [cardId, artwork];
  }),
);

export function getTarotArtwork(
  cardId: string,
  deckId: TarotArtworkDeckId = RWS_CLASSIC_DECK_ID,
): TarotCardArtwork {
  if (deckId !== RWS_CLASSIC_DECK_ID) return fallbackArtwork(cardId);
  return tarotArtworkManifest.get(cardId) ?? fallbackArtwork(cardId);
}

export const getTarotCardArtwork = getTarotArtwork;
