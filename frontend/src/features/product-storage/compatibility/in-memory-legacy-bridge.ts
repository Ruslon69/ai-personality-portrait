import { LEGACY_STORAGE_KEYS } from '../constants';
import type {
  ProductStorageLegacyBridge,
  ProductStorageLegacyWriteResult,
  StorageCapability,
} from '../types';

export class InMemoryProductStorageLegacyBridge implements ProductStorageLegacyBridge {
  readonly operations: string[] = [];
  private readonly local = new Map<string, string>();
  private readonly session = new Map<string, string>();

  constructor(
    initial: {
      local?: Readonly<Record<string, string>>;
      session?: Readonly<Record<string, string>>;
    } = {},
    private readonly failure: { journey?: boolean; numerology?: boolean } = {},
    private readonly operationLog?: string[],
  ) {
    Object.entries(initial.local ?? {}).forEach(([key, value]) => this.local.set(key, value));
    Object.entries(initial.session ?? {}).forEach(([key, value]) => this.session.set(key, value));
  }

  readValues(keys: readonly string[]) {
    return Object.fromEntries(
      keys.map((key) => [key, this.session.get(key) ?? this.local.get(key) ?? null]),
    );
  }

  writeJourney(state: Parameters<ProductStorageLegacyBridge['writeJourney']>[0]) {
    this.operations.push('legacy:journey');
    this.operationLog?.push('legacy:journey');
    if (this.failure.journey) return this.failed('Legacy Journey write failed.');
    this.local.set(LEGACY_STORAGE_KEYS.journey[0], JSON.stringify(state));
    return this.success();
  }

  writeNumerologyBirthDate(value: string) {
    this.operations.push('legacy:numerology');
    this.operationLog?.push('legacy:numerology');
    if (this.failure.numerology) return this.failed('Legacy Numerology write failed.');
    this.session.set(LEGACY_STORAGE_KEYS.numerologyBirthDate[0], value);
    return this.success();
  }

  snapshot() {
    return { local: Object.fromEntries(this.local), session: Object.fromEntries(this.session) };
  }

  private failed(error: string): ProductStorageLegacyWriteResult {
    return { capability: 'session-only', error, ok: false };
  }

  private success(capability: StorageCapability = 'persistent'): ProductStorageLegacyWriteResult {
    return { capability, ok: true };
  }
}
