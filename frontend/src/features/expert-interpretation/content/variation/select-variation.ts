import { stableHash } from '../../utils';

export function selectVariation<T>(values: readonly T[], fingerprint: string, offset = 0): T {
  if (!values.length) throw new Error('Variation set cannot be empty.');
  const index = (Number.parseInt(stableHash(fingerprint), 36) + offset) % values.length;
  return values[index] as T;
}
