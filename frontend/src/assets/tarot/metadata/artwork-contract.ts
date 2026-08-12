export const TAROT_ARTWORK_CONTRACT_VERSION = 1 as const;

export type TarotArtworkSourceKind = 'ai-painting' | 'animated' | 'manual' | 'scan';
export type TarotArtworkQuality = 'collector' | 'premium' | 'standard';
export type TarotArtworkRenderMode = 'layered' | 'static';
export type TarotArtworkLayerRole =
  'atmosphere' | 'background' | 'foreground' | 'light' | 'midground';

export type TarotArtworkLayer = {
  asset: string;
  blendMode?: 'normal' | 'screen' | 'soft-light';
  depth: number;
  id: string;
  opacity?: number;
  required?: boolean;
  role: TarotArtworkLayerRole;
};

export type TarotArtworkEffects = {
  fog: boolean;
  glow: boolean;
  lightRays: boolean;
  particles: boolean;
};

export type TarotArtworkVariant = {
  artworkVersion: string;
  editionId: string;
  effects: TarotArtworkEffects;
  faceAsset: string | null;
  layers: readonly TarotArtworkLayer[];
  quality: TarotArtworkQuality;
  renderMode: TarotArtworkRenderMode;
  sourceKind: TarotArtworkSourceKind;
};

export type TarotArtworkPreference = {
  quality?: TarotArtworkQuality;
  version?: string;
};

export type TarotArtworkProvider<TArtwork> = {
  contractVersion: typeof TAROT_ARTWORK_CONTRACT_VERSION;
  defaultQuality: TarotArtworkQuality;
  id: string;
  resolve: (cardId: string, preference?: TarotArtworkPreference) => TArtwork | undefined;
  supportedDeckIds: readonly string[];
};

export function selectTarotArtworkVariant(
  variants: readonly TarotArtworkVariant[],
  preference: TarotArtworkPreference = {},
) {
  if (preference.version) {
    const requestedVersion = variants.find(
      (variant) => variant.artworkVersion === preference.version,
    );
    if (requestedVersion) return requestedVersion;
  }

  if (preference.quality) {
    const requestedQuality = variants.find((variant) => variant.quality === preference.quality);
    if (requestedQuality) return requestedQuality;
  }

  return variants[0];
}

export function hasRequiredTarotArtworkLayers(
  layers: readonly TarotArtworkLayer[],
  failedAssets: readonly string[],
) {
  return layers.some((layer) => layer.required && !failedAssets.includes(layer.asset));
}
