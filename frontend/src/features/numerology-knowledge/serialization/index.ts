import type { AuthorNumerologyKnowledgeBase } from '../types';

function canonicalize(value: unknown, seen: Set<object>): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new Error('Numerology knowledge contains a non-finite number.');
    return value;
  }
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol')
    throw new Error('Numerology knowledge contains a non-serializable value.');
  if (!value || typeof value !== 'object')
    throw new Error('Numerology knowledge contains an unknown value.');
  if (seen.has(value)) throw new Error('Numerology knowledge contains a circular reference.');
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

export function serializeNumerologyKnowledgeBase(value: AuthorNumerologyKnowledgeBase): string {
  return JSON.stringify(canonicalize(value, new Set()));
}

export function deserializeNumerologyKnowledgeBase(
  serialized: string,
): AuthorNumerologyKnowledgeBase {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('Serialized numerology knowledge must contain an object.');
  return parsed as AuthorNumerologyKnowledgeBase;
}
