const STORAGE_KEY = 'app:numerology-birth-date';

export function loadNumerologyBirthDate() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
}

export function saveNumerologyBirthDate(value: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, value);
}
