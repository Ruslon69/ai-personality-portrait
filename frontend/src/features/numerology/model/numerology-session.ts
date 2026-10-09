import { createNumerologyResultSession } from './numerology-result-session';
import {
  getProductStorageService,
  persistNumerologyBirthDateToProductStorage,
  readNumerologyBirthDateFromProductStorage,
} from '@features/product-storage/runtime/browser-runtime';

import { isValidNumerologyDate } from '../lib/numerology-engine';

export function normalizeNumerologyBirthDate(value: unknown) {
  return typeof value === 'string' && isValidNumerologyDate(value) ? value : '';
}

function readSavedDate() {
  return normalizeNumerologyBirthDate(readNumerologyBirthDateFromProductStorage());
}

export const numerologyResultSession = createNumerologyResultSession({
  read: readSavedDate,
  write: saveNumerologyBirthDate,
});

export function loadNumerologyBirthDate() {
  return normalizeNumerologyBirthDate(numerologyResultSession.date());
}

export function saveNumerologyBirthDate(value: string) {
  const result = persistNumerologyBirthDateToProductStorage(value);
  return (
    result.legacyWritten ||
    (result.envelopeWritten && getProductStorageService().getCapability() === 'persistent')
  );
}
