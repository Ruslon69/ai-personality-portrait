function sortValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) throw new Error('Cross-system values cannot contain circular references.');
  seen.add(value);
  if (Array.isArray(value)) {
    const result = value.map((item) => sortValue(item, seen));
    seen.delete(value);
    return result;
  }
  const result = Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => {
        if (item === undefined) throw new Error(`Undefined value at ${key}.`);
        return [key, sortValue(item, seen)];
      }),
  );
  seen.delete(value);
  return result;
}

export function stableCrossSystemStringify(value: unknown): string {
  return JSON.stringify(sortValue(value, new WeakSet()));
}

export function crossSystemStableId(namespace: string, value: unknown): string {
  const input = stableCrossSystemStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${namespace}-${(hash >>> 0).toString(36)}`;
}

export function uniqueSorted<T extends number | string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort((left, right) =>
    typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right)),
  );
}

export function canonicalTheme(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/^(card|context|semantic|theme)[.:]/u, '')
    .split(/[.:/_-]/u)
    .filter((part) => part.length > 2);
  const aliases: Readonly<Record<string, string>> = {
    adaptation: 'change',
    choice: 'decision',
    completion: 'transition',
    discipline: 'structure',
    energy: 'movement',
    intuition: 'reflection',
    momentum: 'movement',
    patience: 'pause',
    planning: 'structure',
    reciprocity: 'connection',
    recovery: 'support',
    relationship: 'connection',
    rest: 'pause',
    responsibility: 'structure',
    truth: 'clarity',
  };
  const candidate = normalized.at(-1) ?? value.toLowerCase();
  return aliases[candidate] ?? candidate;
}

export function canonicalThemes(values: readonly string[]): readonly string[] {
  return uniqueSorted(values.map(canonicalTheme).filter((value) => value.length > 2));
}
