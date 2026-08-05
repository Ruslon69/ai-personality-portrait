import { PRODUCT_STORAGE_VERSIONS } from '../constants';
import type { ProductStorageEnvelope, ProductStorageParseResult } from '../types';
import { isRecord } from '../utils';
import { validateProductStorageEnvelope } from '../validation/validate-storage';
import { calculateChecksum, withEnvelopeChecksum } from './checksum';
import { canonicalParse, canonicalSerialize } from './canonical';

export function serializeProductStorageEnvelope(
  envelope: ProductStorageEnvelope,
): { json: string; status: 'success' } | { errors: readonly string[]; status: 'validation-error' } {
  const checked = withEnvelopeChecksum(envelope);
  const validation = validateProductStorageEnvelope(checked);
  if (!validation.valid)
    return {
      errors: validation.errors.map((item) => `${item.path}: ${item.message}`),
      status: 'validation-error',
    };
  const serialized = canonicalSerialize(checked);
  return serialized.status === 'success'
    ? serialized
    : { errors: [serialized.message], status: 'validation-error' };
}

export function parseProductStorageEnvelope(serialized: string): ProductStorageParseResult {
  const parsed = canonicalParse(serialized);
  if (parsed.status === 'syntax-error') return parsed;
  if (!isRecord(parsed.value))
    return {
      errors: [
        {
          code: 'invalid-envelope',
          message: 'Envelope must be an object.',
          path: '$',
          recoverable: false,
          section: 'envelope',
          severity: 'error',
        },
      ],
      status: 'validation-error',
    };
  if (typeof parsed.value.schemaVersion !== 'string')
    return { foundVersion: 'missing', status: 'unsupported-version' };
  if (parsed.value.schemaVersion !== PRODUCT_STORAGE_VERSIONS.product)
    return { foundVersion: parsed.value.schemaVersion, status: 'unsupported-version' };
  const validation = validateProductStorageEnvelope(parsed.value);
  if (!validation.valid) return { errors: validation.errors, status: 'validation-error' };
  const envelope = parsed.value as ProductStorageEnvelope;
  const expected = calculateChecksum(envelope);
  if (envelope.checksum !== expected)
    return { actual: envelope.checksum, expected, status: 'checksum-error' };
  return {
    envelope,
    status: 'success',
    warnings: validation.errors.filter((item) => item.severity === 'warning'),
  };
}

export function deserializeProductStorageEnvelope(serialized: string) {
  return parseProductStorageEnvelope(serialized);
}
