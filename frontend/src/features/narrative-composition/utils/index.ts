export function narrativeStableHash(value: string): string {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function narrativeStableId(prefix: string, value: string): string {
  return `${prefix}:${narrativeStableHash(value)}`;
}

export function uniqueValues<T extends number | string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort((left, right) => String(left).localeCompare(String(right)));
}

export function stableNarrativeStringify(value: unknown): string {
  const canonicalize = (item: unknown, seen: Set<object>): unknown => {
    if (item === null || ['boolean', 'string'].includes(typeof item)) return item;
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) throw new Error('Narrative contains a non-finite number.');
      return item;
    }
    if (typeof item === 'undefined' || typeof item === 'function' || typeof item === 'symbol')
      throw new Error('Narrative contains a non-serializable value.');
    if (!item || typeof item !== 'object') throw new Error('Narrative contains an unknown value.');
    if (seen.has(item)) throw new Error('Narrative contains a circular reference.');
    seen.add(item);
    const result = Array.isArray(item)
      ? item.map((value) => canonicalize(value, seen))
      : Object.fromEntries(
          Object.entries(item)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, value]) => [key, canonicalize(value, seen)]),
        );
    seen.delete(item);
    return result;
  };
  return JSON.stringify(canonicalize(value, new Set()));
}
