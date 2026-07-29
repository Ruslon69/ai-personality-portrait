import { isNonEmptyString, isPositiveNumber } from '../validation';

export function readStringEnv(
  source: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = source[key];
  return isNonEmptyString(value) ? value.trim() : fallback;
}

export function readNumberEnv(
  source: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = Number(source[key]);
  return isPositiveNumber(value) ? value : fallback;
}

export function readEnumEnv<const T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  fallback: T,
): T {
  const value = source[key];
  return typeof value === 'string' && allowedValues.includes(value as T) ? (value as T) : fallback;
}
