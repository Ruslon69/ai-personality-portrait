import { PRODUCT_STORAGE_ENGINE_VERSION } from '../constants';
import { withEnvelopeChecksum } from '../serialization';
import type { ProductStorageData, ProductStorageEnvelope } from '../types';

export function createProductStorageEnvelope(input: {
  createdAt: string;
  data?: ProductStorageData;
  engineVersions?: Readonly<Record<string, string>>;
  locale: ProductStorageEnvelope['locale'];
  migrationHistory?: ProductStorageEnvelope['migrationHistory'];
  productVersion: string;
  recoveryMetadata?: ProductStorageEnvelope['recoveryMetadata'];
  revision?: number;
  updatedAt?: string;
}): ProductStorageEnvelope {
  return withEnvelopeChecksum({
    checksum: '',
    createdAt: input.createdAt,
    data: input.data ?? {},
    engineVersions: {
      productStorage: PRODUCT_STORAGE_ENGINE_VERSION,
      ...input.engineVersions,
    },
    locale: input.locale,
    migrationHistory: input.migrationHistory ?? [],
    productVersion: input.productVersion,
    recoveryMetadata: input.recoveryMetadata ?? {
      isolatedSections: [],
      lastRecoveredAt: null,
      source: 'new',
      strategy: null,
    },
    revision: input.revision ?? 0,
    schemaVersion: 'product-storage-v2',
    updatedAt: input.updatedAt ?? input.createdAt,
  });
}
