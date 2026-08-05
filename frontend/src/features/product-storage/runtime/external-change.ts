import { PRODUCT_STORAGE_KEYS } from '../constants';
import { parseProductStorageEnvelope } from '../serialization';
import type { ExternalStorageChangeEvent } from '../types';

export function parseExternalStorageChange(
  input: { key: string | null; newValue: string | null },
  ownRevision: number,
): ExternalStorageChangeEvent | null {
  if (input.key !== PRODUCT_STORAGE_KEYS.activeEnvelope || !input.newValue) return null;
  const parsed = parseProductStorageEnvelope(input.newValue);
  if (parsed.status !== 'success' || parsed.envelope.revision === ownRevision) return null;
  return {
    envelope: parsed.envelope,
    previousRevision: ownRevision,
    revision: parsed.envelope.revision,
    type: 'external-envelope-change',
  };
}
