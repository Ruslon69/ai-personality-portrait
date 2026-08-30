import {
  persistNumerologyBirthDateToProductStorage,
  readNumerologyBirthDateFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';

import { isValidNumerologyDate } from '../lib/numerology-engine';

export function normalizeNumerologyBirthDate(value: unknown) {
  return typeof value === 'string' && isValidNumerologyDate(value) ? value : '';
}

export function loadNumerologyBirthDate() {
  return normalizeNumerologyBirthDate(readNumerologyBirthDateFromProductStorage());
}

export function saveNumerologyBirthDate(value: string) {
  persistNumerologyBirthDateToProductStorage(value);
}
