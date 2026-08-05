import { withEnvelopeChecksum } from '../serialization';
import type {
  ProductStorageData,
  ProductStorageEnvelope,
  ProductStorageValidationError,
} from '../types';
import { validateProductStorageSection } from '../validation';

export function updateProductStorageSection<K extends keyof ProductStorageData>(
  envelope: ProductStorageEnvelope,
  section: K,
  value: NonNullable<ProductStorageData[K]>,
  now: string,
):
  | { envelope: ProductStorageEnvelope; status: 'success' }
  | { errors: readonly ProductStorageValidationError[]; status: 'validation-error' } {
  const errors = validateProductStorageSection(section, value);
  if (errors.length > 0) return { errors, status: 'validation-error' };
  return {
    envelope: withEnvelopeChecksum({
      ...envelope,
      data: { ...envelope.data, [section]: value },
      revision: envelope.revision + 1,
      updatedAt: now,
    }),
    status: 'success',
  };
}
