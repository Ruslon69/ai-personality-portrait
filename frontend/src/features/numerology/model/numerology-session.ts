import {
  persistNumerologyBirthDateToProductStorage,
  readNumerologyBirthDateFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';

export function loadNumerologyBirthDate() {
  return readNumerologyBirthDateFromProductStorage();
}

export function saveNumerologyBirthDate(value: string) {
  persistNumerologyBirthDateToProductStorage(value);
}
