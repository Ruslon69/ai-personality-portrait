import type { JsonPrimitive } from '../types';

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalize(item)]),
    );
  }
  return value;
}

export function stableStringify(value: unknown) {
  return JSON.stringify(normalize(value));
}

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function stableId(prefix: string, value: unknown) {
  return `${prefix}:${stableHash(stableStringify(value))}`;
}

export function uniqueSorted<T extends number | string>(items: readonly T[]): readonly T[] {
  return [...new Set(items)].sort((left, right) =>
    typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right)),
  );
}

export function compactParams(values: Record<string, JsonPrimitive | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, JsonPrimitive] => entry[1] !== undefined,
    ),
  );
}
