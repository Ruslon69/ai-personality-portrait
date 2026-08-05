export const PRODUCT_STORAGE_VERSIONS = {
  draft: 'draft-storage-v1',
  journey: 'journey-storage-v1',
  numerology: 'numerology-storage-v1',
  productLegacy: 'product-storage-v1',
  product: 'product-storage-v2',
  tarot: 'tarot-storage-v1',
} as const;

export const KNOWN_PRODUCT_STORAGE_VERSIONS = new Set<string>([
  PRODUCT_STORAGE_VERSIONS.productLegacy,
  PRODUCT_STORAGE_VERSIONS.product,
]);

export const KNOWN_STORAGE_SCHEMA_VERSIONS = new Set<string>([
  'completion-storage-v1',
  PRODUCT_STORAGE_VERSIONS.draft,
  PRODUCT_STORAGE_VERSIONS.journey,
  'journey-memory-v1',
  PRODUCT_STORAGE_VERSIONS.numerology,
  'preferences-storage-v1',
  PRODUCT_STORAGE_VERSIONS.productLegacy,
  PRODUCT_STORAGE_VERSIONS.product,
  'tarot-session-storage-v1',
  PRODUCT_STORAGE_VERSIONS.tarot,
]);

export const PRODUCT_STORAGE_KEYS = {
  activeEnvelope: 'app:product-storage-v2',
  backupEnvelope: 'app:product-storage-v2:backup',
  migrationMarker: 'app:product-storage-v2:migration',
  recoveryMarker: 'app:product-storage-v2:recovery',
  sessionTarotState: 'app:tarot-reading-state',
  temporaryTransaction: 'app:product-storage-v2:temporary',
} as const;

export const LEGACY_STORAGE_KEYS = {
  draftPortrait: ['app:draft-portrait', 'app:draft-portrait-v1'],
  journey: ['app:personal-journey-v1'],
  locale: ['app:locale'],
  numerologyBirthDate: ['app:numerology-birth-date'],
  tarotDeckTheme: ['app:tarot-deck-theme'],
  tarotSessionSeed: ['app:tarot-session-seed'],
  tarotState: ['app:tarot-reading-state'],
  theme: ['ui-theme'],
} as const;

export const PRODUCT_STORAGE_ENGINE_VERSION = 'local-product-storage-v2' as const;
