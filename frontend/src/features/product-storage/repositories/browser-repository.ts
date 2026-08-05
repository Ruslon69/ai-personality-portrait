import type { ProductStorageRepository, StorageCapability, StorageOperationResult } from '../types';
import { InMemoryProductStorageRepository } from './in-memory-repository';

function storageFailure(error: unknown): StorageCapability {
  return error instanceof DOMException && error.name === 'QuotaExceededError'
    ? 'quota-limited'
    : 'unavailable';
}

export class BrowserProductStorageRepository implements ProductStorageRepository {
  private readonly fallback = new InMemoryProductStorageRepository();
  private status: StorageCapability;

  constructor(private readonly storage: Storage | null) {
    this.status = storage ? 'persistent' : 'session-only';
  }

  capability() {
    return this.status;
  }

  private fallbackResult<T>(result: StorageOperationResult<T>): StorageOperationResult<T> {
    return result.ok
      ? { ...result, capability: this.status }
      : { ...result, capability: this.status };
  }

  read(key: string): StorageOperationResult<string | null> {
    if (!this.storage || this.status !== 'persistent')
      return this.fallbackResult(this.fallback.read(key));
    try {
      return { capability: 'persistent', ok: true, value: this.storage.getItem(key) };
    } catch (error) {
      this.status = storageFailure(error);
      return this.fallbackResult(this.fallback.read(key));
    }
  }

  remove(key: string): StorageOperationResult<null> {
    if (!this.storage || this.status !== 'persistent')
      return this.fallbackResult(this.fallback.remove(key));
    try {
      this.storage.removeItem(key);
      return { capability: 'persistent', ok: true, value: null };
    } catch (error) {
      this.status = storageFailure(error);
      return this.fallbackResult(this.fallback.remove(key));
    }
  }

  write(key: string, value: string): StorageOperationResult<null> {
    if (!this.storage || this.status !== 'persistent')
      return this.fallbackResult(this.fallback.write(key, value));
    try {
      this.storage.setItem(key, value);
      return { capability: 'persistent', ok: true, value: null };
    } catch (error) {
      this.status = storageFailure(error);
      return this.fallbackResult(this.fallback.write(key, value));
    }
  }
}

export function createBrowserProductStorageRepository(): BrowserProductStorageRepository {
  if (typeof window === 'undefined') return new BrowserProductStorageRepository(null);
  try {
    return new BrowserProductStorageRepository(window.localStorage);
  } catch {
    return new BrowserProductStorageRepository(null);
  }
}
