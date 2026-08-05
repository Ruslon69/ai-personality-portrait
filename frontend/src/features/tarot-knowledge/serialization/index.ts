import type { AuthorTarotKnowledgeBase } from '../types';

function canonicalize(value: unknown, seen: Set<object>): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Tarot knowledge contains a non-finite number.');
    return value;
  }
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') {
    throw new Error('Tarot knowledge contains a non-serializable value.');
  }
  if (typeof value !== 'object') throw new Error('Tarot knowledge contains an unsupported value.');
  if (seen.has(value)) throw new Error('Tarot knowledge contains a circular reference.');
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

export function serializeTarotKnowledgeBase(value: AuthorTarotKnowledgeBase): string {
  return JSON.stringify(canonicalize(value, new Set()));
}

export function deserializeTarotKnowledgeBase(serialized: string): AuthorTarotKnowledgeBase {
  const value: unknown = JSON.parse(serialized);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Serialized Tarot knowledge must contain an object.');
  }
  return value as AuthorTarotKnowledgeBase;
}
