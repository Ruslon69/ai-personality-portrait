export {
  stableHash,
  stableId,
  stableStringify,
  uniqueSorted,
} from '@features/expert-interpretation/utils';

export function daysBetween(left: string, right: string) {
  return Math.floor(Math.abs(Date.parse(right) - Date.parse(left)) / 86_400_000);
}

export function yearFromIso(value: string) {
  return Number(value.slice(0, 4));
}
