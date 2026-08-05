import { LEGACY_STORAGE_KEYS } from '../constants';
import type {
  ProductStorageLegacyBridge,
  ProductStorageLegacyWriteResult,
  StorageCapability,
} from '../types';

const sessionKeys = new Set<string>([
  ...LEGACY_STORAGE_KEYS.numerologyBirthDate,
  ...LEGACY_STORAGE_KEYS.tarotSessionSeed,
  ...LEGACY_STORAGE_KEYS.tarotState,
]);

function failure(error: unknown): ProductStorageLegacyWriteResult {
  const capability: StorageCapability =
    error instanceof DOMException && error.name === 'QuotaExceededError'
      ? 'quota-limited'
      : 'unavailable';
  return {
    capability,
    error: error instanceof Error ? error.name : 'StorageError',
    ok: false,
  };
}

export class BrowserProductStorageLegacyBridge implements ProductStorageLegacyBridge {
  constructor(
    private readonly local: Storage | null,
    private readonly session: Storage | null,
  ) {}

  readValues(keys: readonly string[]) {
    return Object.fromEntries(
      keys.map((key) => {
        try {
          const storage = sessionKeys.has(key) ? this.session : this.local;
          return [key, storage?.getItem(key) ?? null];
        } catch {
          return [key, null];
        }
      }),
    );
  }

  writeJourney(
    state: Parameters<ProductStorageLegacyBridge['writeJourney']>[0],
  ): ProductStorageLegacyWriteResult {
    try {
      if (!this.local) return { capability: 'unavailable', error: 'StorageUnavailable', ok: false };
      this.local.setItem(LEGACY_STORAGE_KEYS.journey[0], JSON.stringify(state));
      return { capability: 'persistent', ok: true };
    } catch (error) {
      return failure(error);
    }
  }

  writeNumerologyBirthDate(value: string): ProductStorageLegacyWriteResult {
    try {
      if (!this.session)
        return { capability: 'unavailable', error: 'StorageUnavailable', ok: false };
      this.session.setItem(LEGACY_STORAGE_KEYS.numerologyBirthDate[0], value);
      return { capability: 'session-only', ok: true };
    } catch (error) {
      return failure(error);
    }
  }
}

export function createBrowserProductStorageLegacyBridge() {
  if (typeof window === 'undefined') return new BrowserProductStorageLegacyBridge(null, null);
  try {
    return new BrowserProductStorageLegacyBridge(window.localStorage, window.sessionStorage);
  } catch {
    return new BrowserProductStorageLegacyBridge(null, null);
  }
}
