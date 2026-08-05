import type { ProductStorageRepository, StorageCapability, StorageOperationResult } from '../types';

export type InMemoryFailureMode = {
  failAfterOperation?: number;
  kind?: 'quota' | 'unavailable';
};

export class InMemoryProductStorageRepository implements ProductStorageRepository {
  readonly operations: string[] = [];
  private readonly values = new Map<string, string>();
  private operationCount = 0;

  constructor(
    initial: Readonly<Record<string, string>> = {},
    private readonly failure: InMemoryFailureMode = {},
    private readonly operationLog?: string[],
  ) {
    Object.entries(initial).forEach(([key, value]) => this.values.set(key, value));
  }

  capability(): StorageCapability {
    if (this.failure.kind === 'quota') return 'quota-limited';
    if (this.failure.kind === 'unavailable') return 'unavailable';
    return 'persistent';
  }

  private shouldFail() {
    this.operationCount += 1;
    return (
      this.failure.failAfterOperation !== undefined &&
      this.operationCount >= this.failure.failAfterOperation
    );
  }

  read(key: string): StorageOperationResult<string | null> {
    this.operations.push(`read:${key}`);
    this.operationLog?.push(`envelope:read:${key}`);
    if (this.shouldFail())
      return { capability: this.capability(), error: 'Simulated storage read failure.', ok: false };
    return { capability: this.capability(), ok: true, value: this.values.get(key) ?? null };
  }

  remove(key: string): StorageOperationResult<null> {
    this.operations.push(`remove:${key}`);
    this.operationLog?.push(`envelope:remove:${key}`);
    if (this.shouldFail())
      return {
        capability: this.capability(),
        error: 'Simulated storage remove failure.',
        ok: false,
      };
    this.values.delete(key);
    return { capability: this.capability(), ok: true, value: null };
  }

  write(key: string, value: string): StorageOperationResult<null> {
    this.operations.push(`write:${key}`);
    this.operationLog?.push(`envelope:write:${key}`);
    if (this.shouldFail())
      return {
        capability: this.capability(),
        error: 'Simulated storage write failure.',
        ok: false,
      };
    this.values.set(key, value);
    return { capability: this.capability(), ok: true, value: null };
  }

  snapshot(): Readonly<Record<string, string>> {
    return Object.fromEntries(this.values);
  }
}
