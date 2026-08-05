import type { ProductStorageJsonValue } from '../types';
import { isJsonValue } from '../utils';

export type CanonicalSerializationResult =
  { json: string; status: 'success' } | { message: string; path: string; status: 'error' };

function normalize(value: ProductStorageJsonValue): ProductStorageJsonValue {
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, ProductStorageJsonValue>>((result, key) => {
        result[key] = normalize(value[key] as ProductStorageJsonValue);
        return result;
      }, {});
  }
  return value;
}

export function canonicalSerialize(value: unknown): CanonicalSerializationResult {
  if (!isJsonValue(value)) {
    return {
      message: 'Value contains an unsupported, non-finite, undefined, or circular value.',
      path: '$',
      status: 'error',
    };
  }
  return { json: JSON.stringify(normalize(value)), status: 'success' };
}

export function canonicalParse(
  serialized: string,
): { status: 'success'; value: unknown } | { message: string; status: 'syntax-error' } {
  try {
    return { status: 'success', value: JSON.parse(serialized) as unknown };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Invalid JSON.',
      status: 'syntax-error',
    };
  }
}
