import type { AdvancedNumerologyProfile } from './types';

function canonicalize(value: unknown, seen: Set<object>): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new Error('Advanced numerology cannot serialize NaN or Infinity.');
    return value;
  }
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol')
    throw new Error('Advanced numerology contains a non-serializable value.');
  if (typeof value !== 'object') throw new Error('Advanced numerology contains an unknown value.');
  if (seen.has(value)) throw new Error('Advanced numerology contains a circular reference.');
  seen.add(value);
  const result = Array.isArray(value)
    ? value.map((item) => canonicalize(item, seen))
    : Object.fromEntries(
        Object.entries(value)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, item]) => [key, canonicalize(item, seen)]),
      );
  seen.delete(value);
  return result;
}

export function serializeAdvancedNumerologyProfile(profile: AdvancedNumerologyProfile) {
  return JSON.stringify(canonicalize(profile, new Set()));
}

export function deserializeAdvancedNumerologyProfile(serialized: string) {
  const parsed = JSON.parse(serialized) as AdvancedNumerologyProfile;
  const canonical = serializeAdvancedNumerologyProfile(parsed);
  if (canonical !== serialized)
    throw new Error('Advanced numerology payload is not in canonical serialized form.');
  return parsed;
}
