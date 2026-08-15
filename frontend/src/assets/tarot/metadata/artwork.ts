import { RWS_CLASSIC_DECK_ID } from './deck';
import premiumReleaseManifest from './premium-release-manifest.json';
import {
  TAROT_ARTWORK_CONTRACT_VERSION,
  selectTarotArtworkVariant,
  type TarotArtworkEffects,
  type TarotArtworkLayer,
  type TarotArtworkPreference,
  type TarotArtworkProvider,
  type TarotArtworkQuality,
  type TarotArtworkRenderMode,
  type TarotArtworkSourceKind,
  type TarotArtworkVariant,
} from './artwork-contract';

type PremiumReleaseRecord = {
  artworkVersion: string;
  assetPath: string;
  cardId: string;
  checksum: string;
};
const premiumRelease = premiumReleaseManifest as {
  editionId: string;
  mode: 'classic' | 'premium-complete';
  records: PremiumReleaseRecord[];
  version: string;
};

export type TarotArtworkRightsStatus =
  'verified-public-domain' | 'licensed' | 'original' | 'placeholder' | 'unknown';
export type TarotArtworkDeckId = string;
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
  editionId: string;
  effects: TarotArtworkEffects;
  faceAsset: string | null;
  fallbackAsset: 'internal-symbolic-v1';
  height: number;
  isFallback: boolean;
  layers: readonly TarotArtworkLayer[];
  palette: TarotArtworkPalette;
  paletteFamily: TarotArtworkFamily;
  providerId: string;
  quality: TarotArtworkQuality;
  renderMode: TarotArtworkRenderMode;
  rightsStatus: TarotArtworkRightsStatus;
  sourceId?: string;
  sourceKind: TarotArtworkSourceKind;
  width: number;
};

type TarotArtworkDefinition = Omit<
  TarotCardArtwork,
  | 'artworkVersion'
  | 'editionId'
  | 'effects'
  | 'faceAsset'
  | 'isFallback'
  | 'layers'
  | 'providerId'
  | 'quality'
  | 'renderMode'
  | 'sourceKind'
> & {
  variants: readonly TarotArtworkVariant[];
};

const noArtworkEffects: TarotArtworkEffects = {
  fog: false,
  glow: false,
  lightRays: false,
  particles: false,
};
const RWS_CLASSIC_PROVIDER_ID = 'rws-classic-local';

const faceAssets = import.meta.glob('../cards/rws/**/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Readonly<Record<string, string>>;
const premiumFaceAssets = import.meta.glob('../cards/premium-rws-remastered/**/*.jpg', {
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
const canonicalArtworkIds = [
  ...majorArtworkSlugs.map((slug) => `major-${slug}`),
  ...minorSuits.flatMap((suit) => minorRanks.map((rank) => `${suit}-${rank}`)),
];
const premiumRecordIds = premiumRelease.records.map((record) => record.cardId);
const premiumReleaseIsAtomic =
  premiumRelease.mode === 'premium-complete' &&
  premiumRelease.records.length === 78 &&
  new Set(premiumRecordIds).size === 78 &&
  canonicalArtworkIds.every((cardId) => premiumRecordIds.includes(cardId)) &&
  premiumRecordIds.every((cardId) => canonicalArtworkIds.includes(cardId));
const premiumReleaseRecords = new Map(
  premiumReleaseIsAtomic
    ? premiumRelease.records.map((record) => [record.cardId, record] as const)
    : [],
);
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
    editionId: 'internal-symbolic',
    effects: noArtworkEffects,
    faceAsset: null,
    fallbackAsset: 'internal-symbolic-v1',
    height: 12,
    isFallback: true,
    layers: [],
    palette: tarotArtworkPalettes.major,
    paletteFamily: 'major',
    providerId: 'internal-symbolic',
    quality: 'standard',
    renderMode: 'static',
    rightsStatus: 'placeholder',
    sourceKind: 'manual',
    width: 7,
  };
}

const rwsArtworkDefinitions: ReadonlyMap<string, TarotArtworkDefinition> = new Map(
  [...verifiedAssetPaths].flatMap(([cardId, localAssetPath]) => {
    const faceAsset = faceAssets[localAssetPath];
    if (!faceAsset) return [];
    const premiumRecord = premiumReleaseRecords.get(cardId);
    const premiumFaceAsset = premiumRecord ? premiumFaceAssets[premiumRecord.assetPath] : undefined;
    const paletteFamily = minorSuits.find((suit) => cardId.startsWith(`${suit}-`)) ?? 'major';
    const artwork: TarotArtworkDefinition = {
      aspectRatio: '7 / 12',
      cardId,
      deckId: RWS_CLASSIC_DECK_ID,
      fallbackAsset: 'internal-symbolic-v1',
      height: 12,
      palette: tarotArtworkPalettes[paletteFamily],
      paletteFamily,
      rightsStatus: 'verified-public-domain',
      variants: [
        ...(premiumFaceAsset && premiumRecord
          ? [
              {
                artworkVersion: premiumRecord.artworkVersion,
                editionId: premiumRelease.editionId,
                effects: noArtworkEffects,
                faceAsset: premiumFaceAsset,
                layers: [
                  {
                    asset: premiumFaceAsset,
                    depth: 0,
                    id: 'illustration',
                    required: true,
                    role: 'midground' as const,
                  },
                ],
                quality: 'premium' as const,
                renderMode: 'static' as const,
                sourceKind: 'ai-painting' as const,
              },
            ]
          : []),
        {
          artworkVersion: 'rws-classic-public-domain-v1',
          editionId: 'rws-archival-classic',
          effects: noArtworkEffects,
          faceAsset,
          layers: [
            {
              asset: faceAsset,
              depth: 0,
              id: 'illustration',
              required: true,
              role: 'midground',
            },
          ],
          quality: 'standard',
          renderMode: 'static',
          sourceKind: 'scan',
        },
      ],
      width: 7,
    };
    return [[cardId, artwork] as const];
  }),
);

export const rwsClassicArtworkProvider: TarotArtworkProvider<TarotCardArtwork> = {
  contractVersion: TAROT_ARTWORK_CONTRACT_VERSION,
  defaultQuality: 'standard',
  id: RWS_CLASSIC_PROVIDER_ID,
  resolve(cardId, preference) {
    const definition = rwsArtworkDefinitions.get(cardId);
    if (!definition) return undefined;
    const variant = selectTarotArtworkVariant(definition.variants, preference);
    if (!variant) return undefined;
    return {
      ...definition,
      ...variant,
      isFallback: false,
      providerId: RWS_CLASSIC_PROVIDER_ID,
    };
  },
  supportedDeckIds: [RWS_CLASSIC_DECK_ID],
};

export const tarotArtworkProviders: readonly TarotArtworkProvider<TarotCardArtwork>[] = [
  rwsClassicArtworkProvider,
];

export const tarotArtworkManifest: ReadonlyMap<string, TarotCardArtwork> = new Map(
  [...rwsArtworkDefinitions].flatMap(([cardId]) => {
    const artwork = rwsClassicArtworkProvider.resolve(cardId);
    return artwork ? [[cardId, artwork] as const] : [];
  }),
);

export function getTarotArtwork(
  cardId: string,
  deckId: TarotArtworkDeckId = RWS_CLASSIC_DECK_ID,
  preference: TarotArtworkPreference = {},
): TarotCardArtwork {
  const provider = tarotArtworkProviders.find((candidate) =>
    candidate.supportedDeckIds.includes(deckId),
  );
  return provider?.resolve(cardId, preference) ?? fallbackArtwork(cardId);
}

export const getTarotCardArtwork = getTarotArtwork;
