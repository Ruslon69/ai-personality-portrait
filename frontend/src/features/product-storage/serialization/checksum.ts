import type { ProductStorageEnvelope, ProductStorageExportPackage } from '../types';
import { stableHash } from '../utils';
import { canonicalSerialize } from './canonical';

function withoutChecksum<T extends { checksum: string }>(value: T): Omit<T, 'checksum'> {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'checksum')) as Omit<
    T,
    'checksum'
  >;
}

export function calculateChecksum(value: { checksum: string }): string {
  const serialized = canonicalSerialize(withoutChecksum(value));
  if (serialized.status === 'error') return 'invalid';
  return stableHash(serialized.json);
}

export function withEnvelopeChecksum(envelope: ProductStorageEnvelope): ProductStorageEnvelope {
  const next = { ...envelope, checksum: '' };
  return { ...next, checksum: calculateChecksum(next) };
}

export function withExportChecksum(
  exportPackage: ProductStorageExportPackage,
): ProductStorageExportPackage {
  const next = { ...exportPackage, checksum: '' };
  return { ...next, checksum: calculateChecksum(next) };
}
