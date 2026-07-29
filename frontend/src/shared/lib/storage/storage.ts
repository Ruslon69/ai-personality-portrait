import type { StorageAdapter } from './storage.types';

export function createStorage(namespace: string): StorageAdapter {
  const getKey = (key: string) => `${namespace}:${key}`;

  return {
    get(key) {
      try {
        return window.localStorage.getItem(getKey(key));
      } catch {
        return null;
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(getKey(key));
      } catch {
        // Storage may be unavailable; callers should remain functional.
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(getKey(key), value);
        return true;
      } catch {
        return false;
      }
    },
  };
}

export const appStorage = createStorage('app');
