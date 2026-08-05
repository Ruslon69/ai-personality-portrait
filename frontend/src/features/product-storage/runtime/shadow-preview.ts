import { LEGACY_STORAGE_KEYS, PRODUCT_STORAGE_KEYS } from '../constants';
import { migrateLegacyStorage } from '../migrations';
import type { LegacyStorageInput, ProductStorageReader } from '../types';

export const SHADOW_PREVIEW_KEYS = [
  PRODUCT_STORAGE_KEYS.activeEnvelope,
  ...Object.values(LEGACY_STORAGE_KEYS).flat(),
] as const;

export function readStorageForShadowPreview(reader: ProductStorageReader) {
  const values: Record<string, string | null> = {};
  const errors: string[] = [];
  SHADOW_PREVIEW_KEYS.forEach((key) => {
    const result = reader.read(key);
    if (result.ok) values[key] = result.value;
    else errors.push(`${key}: ${result.error}`);
  });
  return { errors, values };
}

export function buildProductStorageShadowPreview(input: LegacyStorageInput) {
  return migrateLegacyStorage(input);
}
