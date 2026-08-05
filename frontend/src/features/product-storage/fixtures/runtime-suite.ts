import { PRODUCT_STORAGE_KEYS } from '../constants';
import {
  applyProductStorageDeletionPlan,
  createProductStorageDeletionPlan,
  updateProductStorageSection,
} from '../model';
import {
  migrateLegacyDraft,
  migrateLegacyJourney,
  migrateLegacyStorage,
  migrateLegacyTarotReadings,
} from '../migrations';
import { recoverProductStorage, resetSingleProductStorageSection } from '../recovery';
import {
  BrowserProductStorageRepository,
  InMemoryProductStorageRepository,
  writeEnvelopeTransactionally,
} from '../repositories';
import { parseExternalStorageChange } from '../runtime';
import {
  calculateChecksum,
  canonicalSerialize,
  parseProductStorageEnvelope,
  serializeProductStorageEnvelope,
  withEnvelopeChecksum,
} from '../serialization';
import { buildProductStorageExport, parseProductStorageImport } from '../export-import';
import { createProductStorageEnvelope } from '../schemas';
import { validateProductStorageEnvelope } from '../validation';
import {
  createFullStorageFixtureEnvelope,
  legacyFixtureValues,
  materializeProductStorageFixture,
  productStorageFixtures,
  STORAGE_FIXTURE_TIME,
} from './fixtures';

export type ProductStorageRuntimeReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  suites: Readonly<
    Record<
      | 'browser'
      | 'checksum'
      | 'deletion'
      | 'exportImport'
      | 'fixtures'
      | 'migration'
      | 'recovery'
      | 'serialization'
      | 'transaction',
      boolean
    >
  >;
  valid: boolean;
};

type Assert = (condition: boolean, message: string) => void;

function serialize(envelope = createFullStorageFixtureEnvelope()) {
  const result = serializeProductStorageEnvelope(envelope);
  if (result.status !== 'success') throw new Error(result.errors.join(' '));
  return result.json;
}

function runSerialization(assert: Assert) {
  const envelope = createFullStorageFixtureEnvelope();
  const first = serialize(envelope);
  const second = serialize({ ...envelope, data: { ...envelope.data } });
  assert(first === second, 'Canonical serialization changed for equivalent data.');
  const parsed = parseProductStorageEnvelope(first);
  assert(parsed.status === 'success', 'Envelope JSON round-trip failed.');
  assert(
    parsed.status === 'success' && parsed.envelope.checksum === envelope.checksum,
    'Stable ids or checksum changed during round-trip.',
  );
  assert(canonicalSerialize({ value: Number.NaN }).status === 'error', 'NaN was accepted.');
  assert(
    canonicalSerialize({ value: Number.POSITIVE_INFINITY }).status === 'error',
    'Infinity was accepted.',
  );
  assert(canonicalSerialize({ value: undefined }).status === 'error', 'Undefined was accepted.');
  const circular: { self?: unknown } = {};
  circular.self = circular;
  assert(canonicalSerialize(circular).status === 'error', 'Circular input was accepted.');
}

function runChecksum(assert: Assert) {
  const envelope = createFullStorageFixtureEnvelope();
  assert(calculateChecksum(envelope) === envelope.checksum, 'Checksum is not stable.');
  const corrupted = JSON.parse(serialize(envelope)) as Record<string, unknown>;
  corrupted.locale = 'en';
  const result = parseProductStorageEnvelope(JSON.stringify(corrupted));
  assert(result.status === 'checksum-error', 'Checksum mismatch was not detected.');
}

function runMigration(assert: Assert) {
  const input = {
    locale: 'ru' as const,
    now: STORAGE_FIXTURE_TIME,
    productVersion: '5.4-fixture',
    values: legacyFixtureValues(),
  };
  const first = migrateLegacyStorage(input);
  const second = migrateLegacyStorage(input);
  assert(first.status === 'migrated' && first.envelope !== null, 'Legacy migration failed.');
  assert(
    first.envelope?.checksum === second.envelope?.checksum,
    'Legacy migration is not deterministic.',
  );
  assert(Boolean(first.envelope?.data.journey), 'Legacy Journey was not migrated.');
  assert(Boolean(first.envelope?.data.tarotReadings), 'Legacy Tarot readings were not migrated.');
  assert(Boolean(first.envelope?.data.draftPortrait), 'Legacy Draft Portrait was not migrated.');
  assert(
    Boolean(
      first.envelope &&
      migrateLegacyJourney(first.envelope.data.journey) === first.envelope.data.journey,
    ),
    'Journey section migration is not idempotent.',
  );
  assert(
    Boolean(
      first.envelope &&
      migrateLegacyTarotReadings(first.envelope.data.tarotReadings) ===
        first.envelope.data.tarotReadings,
    ),
    'Tarot section migration is not idempotent.',
  );
  assert(
    Boolean(
      first.envelope &&
      migrateLegacyDraft(first.envelope.data.draftPortrait) === first.envelope.data.draftPortrait,
    ),
    'Draft section migration is not idempotent.',
  );
  const invalidDraftValues = {
    ...legacyFixtureValues(),
    'app:draft-portrait': '{bad',
  };
  const partial = migrateLegacyStorage({ ...input, values: invalidDraftValues });
  assert(
    partial.status === 'migrated' && Boolean(partial.envelope?.data.journey),
    'One damaged legacy section destroyed independent valid sections.',
  );
  const withMemory = migrateLegacyStorage({
    ...input,
    journeyMemorySnapshot: createFullStorageFixtureEnvelope().data.journeyMemory?.data,
  });
  assert(
    Boolean(withMemory.envelope?.data.journeyMemory),
    'Journey Memory migration payload was not preserved.',
  );
  if (first.envelope) {
    const ready = migrateLegacyStorage({
      ...input,
      values: { [PRODUCT_STORAGE_KEYS.activeEnvelope]: serialize(first.envelope) },
    });
    assert(ready.status === 'ready', 'Migration pipeline is not idempotent for v2.');
    assert(
      ready.envelope?.checksum === first.envelope.checksum,
      'Idempotent migration changed data.',
    );
  }
  const future = migrateLegacyStorage({
    ...input,
    values: {
      [PRODUCT_STORAGE_KEYS.activeEnvelope]: JSON.stringify({
        schemaVersion: 'product-storage-v99',
      }),
    },
  });
  assert(future.status === 'unsupported-version', 'Future schema was not protected.');
}

function runTransaction(assert: Assert) {
  const original = createFullStorageFixtureEnvelope();
  const repository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: serialize(original),
  });
  const next = { ...original, locale: 'en' as const };
  const written = writeEnvelopeTransactionally(repository, next, {
    expectedRevision: original.revision,
    now: '2026-08-04T11:00:00.000Z',
  });
  assert(written.status === 'success', 'Transactional write failed.');
  assert(
    written.status === 'success' && written.envelope.revision === 1,
    'Revision did not increment.',
  );
  assert(
    Boolean(repository.snapshot()[PRODUCT_STORAGE_KEYS.backupEnvelope]),
    'Valid active envelope was not backed up.',
  );
  assert(
    !repository.snapshot()[PRODUCT_STORAGE_KEYS.temporaryTransaction],
    'Temporary key was not removed.',
  );
  const conflict = writeEnvelopeTransactionally(repository, next, {
    expectedRevision: 0,
    now: '2026-08-04T12:00:00.000Z',
  });
  assert(conflict.status === 'conflict', 'Revision conflict was overwritten.');

  const interrupted = new InMemoryProductStorageRepository(
    {},
    { failAfterOperation: 4, kind: 'unavailable' },
  );
  const failed = writeEnvelopeTransactionally(interrupted, original, { now: STORAGE_FIXTURE_TIME });
  assert(failed.status === 'failure', 'Interrupted transaction unexpectedly succeeded.');
  assert(
    !interrupted.snapshot()[PRODUCT_STORAGE_KEYS.activeEnvelope],
    'Interrupted write damaged active state.',
  );
  assert(
    Boolean(interrupted.snapshot()[PRODUCT_STORAGE_KEYS.temporaryTransaction]),
    'Interrupted transaction is not recoverable.',
  );
  const futureRaw = JSON.stringify({ schemaVersion: 'product-storage-v99' });
  const futureRepository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: futureRaw,
  });
  const futureWrite = writeEnvelopeTransactionally(futureRepository, original, {
    now: STORAGE_FIXTURE_TIME,
  });
  assert(futureWrite.status === 'failure', 'Future schema was overwritten by transactional write.');
  assert(
    futureRepository.snapshot()[PRODUCT_STORAGE_KEYS.activeEnvelope] === futureRaw,
    'Future active value changed after rejected write.',
  );
}

function runRecovery(assert: Assert) {
  const valid = serialize();
  const active = recoverProductStorage({
    activeRaw: valid,
    backupRaw: null,
    now: STORAGE_FIXTURE_TIME,
    temporaryRaw: null,
  });
  assert(active.report.strategy === 'use-active', 'Valid active envelope was not used.');
  const backup = recoverProductStorage({
    activeRaw: '{bad',
    backupRaw: valid,
    now: STORAGE_FIXTURE_TIME,
    temporaryRaw: null,
  });
  assert(backup.report.strategy === 'restore-backup', 'Valid backup was not restored.');
  const temporary = recoverProductStorage({
    activeRaw: '{bad',
    backupRaw: '{bad',
    now: STORAGE_FIXTURE_TIME,
    temporaryRaw: valid,
  });
  assert(
    temporary.envelope !== null && temporary.envelope.recoveryMetadata.source === 'temporary',
    'Interrupted temporary transaction was not recovered.',
  );

  const damaged = JSON.parse(valid) as Record<string, unknown>;
  const data = damaged.data as Record<string, unknown>;
  data.journey = { data: { broken: true }, schemaVersion: 'journey-storage-v1' };
  const salvage = recoverProductStorage({
    activeRaw: JSON.stringify(damaged),
    backupRaw: null,
    now: STORAGE_FIXTURE_TIME,
    temporaryRaw: null,
  });
  assert(
    salvage.report.strategy === 'salvage-valid-sections',
    'Partial recovery did not salvage valid sections.',
  );
  const corruptedActive = JSON.parse(valid) as Record<string, unknown>;
  corruptedActive.locale = 'en';
  const protectedBackupRepository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: JSON.stringify(corruptedActive),
    [PRODUCT_STORAGE_KEYS.backupEnvelope]: valid,
  });
  const rejected = writeEnvelopeTransactionally(
    protectedBackupRepository,
    createFullStorageFixtureEnvelope(),
    { now: STORAGE_FIXTURE_TIME },
  );
  assert(
    rejected.status === 'failure',
    'Corrupted active envelope was overwritten without recovery.',
  );
  assert(
    protectedBackupRepository.snapshot()[PRODUCT_STORAGE_KEYS.backupEnvelope] === valid,
    'Valid backup was replaced by corrupted active data.',
  );
  assert(!salvage.envelope?.data.journey, 'Corrupted Journey section was retained.');
  assert(
    Boolean(salvage.envelope?.data.preferences),
    'Valid independent preference section was lost.',
  );
  const none = recoverProductStorage({
    activeRaw: '{bad',
    backupRaw: '{also-bad',
    now: STORAGE_FIXTURE_TIME,
    temporaryRaw: null,
  });
  assert(
    none.report.strategy === 'reset-all' && none.envelope === null,
    'Unrecoverable data did not return explicit reset-all plan.',
  );
  const single = resetSingleProductStorageSection(
    createFullStorageFixtureEnvelope(),
    'numerology',
    STORAGE_FIXTURE_TIME,
  );
  assert(
    single.report.strategy === 'reset-single-section' &&
      !single.envelope?.data.numerology &&
      Boolean(single.envelope?.data.preferences),
    'Single-section recovery did not preserve independent data.',
  );
}

function runExportImport(assert: Assert) {
  const envelope = createFullStorageFixtureEnvelope();
  const full = buildProductStorageExport(envelope, {
    exportedAt: STORAGE_FIXTURE_TIME,
    scope: 'full',
  });
  assert(
    !full.json.includes('tarot-session-storage-v1'),
    'Temporary Tarot session leaked into export.',
  );
  assert(!/audio|microphone|blob/i.test(full.json), 'Raw voice/audio data leaked into export.');
  const partial = buildProductStorageExport(envelope, {
    exportedAt: STORAGE_FIXTURE_TIME,
    scope: 'numerology',
  });
  assert(
    partial.metadata.sections.length === 1 && partial.metadata.sections[0] === 'numerology',
    'Partial export included unrelated data.',
  );
  const preview = parseProductStorageImport(full.json, envelope, {
    mode: 'preview',
    now: STORAGE_FIXTURE_TIME,
    productVersion: '5.4-fixture',
  });
  assert(
    preview.status === 'preview' && preview.envelope === null,
    'Import preview attempted to apply data.',
  );
  const replacement = parseProductStorageImport(full.json, envelope, {
    mode: 'replace',
    now: STORAGE_FIXTURE_TIME,
    productVersion: '5.4-fixture',
  });
  assert(replacement.status === 'ready' && replacement.envelope !== null, 'Replace import failed.');
  const merged = parseProductStorageImport(full.json, envelope, {
    mode: 'merge',
    now: STORAGE_FIXTURE_TIME,
    productVersion: '5.4-fixture',
  });
  assert(merged.status === 'ready', 'Merge import failed.');
  assert(
    merged.envelope?.data.tarotReadings?.data.length === 1,
    'Duplicate reading was not deduplicated.',
  );
  const incompatibleEnvelope = createProductStorageEnvelope({
    createdAt: envelope.createdAt,
    data: envelope.data,
    engineVersions: { ...envelope.engineVersions, productStorage: 'local-product-storage-v1' },
    locale: envelope.locale,
    productVersion: envelope.productVersion,
  });
  const incompatibleExport = buildProductStorageExport(incompatibleEnvelope, {
    exportedAt: STORAGE_FIXTURE_TIME,
    scope: 'full',
  });
  const lineage = parseProductStorageImport(incompatibleExport.json, envelope, {
    mode: 'merge',
    now: STORAGE_FIXTURE_TIME,
    productVersion: '5.4-fixture',
  });
  assert(
    Object.keys(lineage.envelope?.engineVersions ?? {}).some((key) =>
      key.startsWith('lineage.import.productStorage'),
    ),
    'Incompatible engine version was not preserved as a separate lineage.',
  );
  assert(
    merged.conflicts.some((item) => item.section === 'tarotReadings'),
    'Import conflict was not reported.',
  );
  const corrupted = JSON.parse(full.json) as Record<string, unknown>;
  corrupted.locale = 'en';
  const invalid = parseProductStorageImport(JSON.stringify(corrupted), envelope, {
    mode: 'preview',
    now: STORAGE_FIXTURE_TIME,
    productVersion: '5.4-fixture',
  });
  assert(invalid.status === 'invalid', 'Corrupted export was accepted.');
}

function runDeletion(assert: Assert) {
  const envelope = createFullStorageFixtureEnvelope();
  const partial = updateProductStorageSection(
    envelope,
    'preferences',
    {
      data: { ...envelope.data.preferences?.data, theme: 'light' },
      schemaVersion: 'preferences-storage-v1',
    },
    '2026-08-04T10:30:00.000Z',
  );
  assert(partial.status === 'success', 'Independent section update failed validation.');
  assert(
    partial.status === 'success' &&
      partial.envelope.data.tarotReadings === envelope.data.tarotReadings,
    'Independent section update changed unrelated data.',
  );
  const one = createProductStorageDeletionPlan('numerology');
  const withoutNumber = applyProductStorageDeletionPlan(envelope, one, '2026-08-04T11:00:00.000Z');
  assert(!withoutNumber.data.numerology, 'Numerology deletion plan did not remove its section.');
  assert(Boolean(withoutNumber.data.preferences), 'Single-section deletion removed preferences.');
  const all = applyProductStorageDeletionPlan(
    envelope,
    createProductStorageDeletionPlan('all-personal-data'),
    '2026-08-04T12:00:00.000Z',
  );
  assert(
    Object.keys(all.data).length === 1 && Boolean(all.data.preferences),
    'Delete-all did not preserve preferences only.',
  );
  assert(all.revision === envelope.revision + 1, 'Deletion did not increment revision.');
  const withoutTarot = applyProductStorageDeletionPlan(
    envelope,
    createProductStorageDeletionPlan('tarot-readings'),
    '2026-08-04T13:00:00.000Z',
  );
  assert(
    withoutTarot.data.journey?.data.readings.length === 0 && !withoutTarot.data.journeyMemory,
    'Tarot deletion left orphan Journey references.',
  );
}

class FakeStorage implements Storage {
  readonly values = new Map<string, string>();
  constructor(private readonly failure: 'none' | 'quota' | 'unavailable') {}
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    if (this.failure === 'unavailable') throw new DOMException('Denied', 'SecurityError');
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    if (this.failure === 'quota') throw new DOMException('Full', 'QuotaExceededError');
    if (this.failure === 'unavailable') throw new DOMException('Denied', 'SecurityError');
    this.values.set(key, value);
  }
}

function runBrowser(assert: Assert) {
  const persistent = new BrowserProductStorageRepository(new FakeStorage('none'));
  assert(
    persistent.write('key', 'value').ok && persistent.read('key').ok,
    'Browser repository failed with available storage.',
  );
  const quota = new BrowserProductStorageRepository(new FakeStorage('quota'));
  const quotaWrite = quota.write('key', 'value');
  assert(
    quotaWrite.ok && quota.capability() === 'quota-limited',
    'Quota fallback did not preserve session data/status.',
  );
  const unavailable = new BrowserProductStorageRepository(new FakeStorage('unavailable'));
  unavailable.read('key');
  assert(unavailable.capability() === 'unavailable', 'SecurityError was not classified.');
  const sessionOnly = new BrowserProductStorageRepository(null);
  assert(
    sessionOnly.write('key', 'value').ok && sessionOnly.read('key').ok,
    'Memory fallback is unavailable.',
  );
  const envelope = withEnvelopeChecksum({ ...createFullStorageFixtureEnvelope(), revision: 2 });
  const event = parseExternalStorageChange(
    { key: PRODUCT_STORAGE_KEYS.activeEnvelope, newValue: serialize(envelope) },
    1,
  );
  assert(event?.revision === 2, 'External storage event was not parsed.');
  assert(
    parseExternalStorageChange(
      { key: PRODUCT_STORAGE_KEYS.activeEnvelope, newValue: serialize(envelope) },
      2,
    ) === null,
    'Own revision was not ignored.',
  );
}

function runFixtureChecks(assert: Assert) {
  assert(
    productStorageFixtures.length === 36,
    'Storage fixture suite must contain exactly 36 required fixtures.',
  );
  const ids = new Set(productStorageFixtures.map((fixture) => fixture.id));
  assert(ids.size === productStorageFixtures.length, 'Fixture ids are not unique.');
  productStorageFixtures.forEach((fixture) => {
    assert(
      fixture.timestamp === STORAGE_FIXTURE_TIME,
      `${fixture.id}: timestamp is not deterministic.`,
    );
    assert(fixture.seed.endsWith(fixture.id), `${fixture.id}: seed is not stable.`);
    const materialized = materializeProductStorageFixture(fixture);
    if (fixture.expected === 'success' && materialized.envelope)
      assert(
        validateProductStorageEnvelope(materialized.envelope).valid,
        `${fixture.id}: materialized envelope is invalid.`,
      );
    if (fixture.id === 'multi-year-journey')
      assert(
        materialized.envelope?.data.journeyMemory?.data.yearSummaries.length === 3,
        'multi-year-journey: year summaries were not materialized.',
      );
    if (fixture.id === 'master-number-data')
      assert(
        materialized.envelope?.data.numerology?.data.profile?.lifePath.value === 11,
        'master-number-data: master number 11 was not preserved.',
      );
    if (fixture.expected === 'migration') {
      const migrated = migrateLegacyStorage({
        locale: fixture.input.locale,
        now: fixture.timestamp,
        productVersion: '5.4-fixture',
        values: materialized.legacyValues,
      });
      assert(
        migrated.envelope !== null,
        `${fixture.id}: materialized legacy input did not migrate.`,
      );
    }
    if (fixture.expected === 'recovery') {
      const recovery = recoverProductStorage({
        activeRaw: materialized.activeRaw,
        backupRaw: materialized.backupRaw,
        now: fixture.timestamp,
        temporaryRaw: materialized.temporaryRaw,
      });
      assert(
        recovery.capability === 'recovered' ||
          recovery.capability === 'corrupted' ||
          recovery.capability === 'persistent',
        `${fixture.id}: materialized recovery input has no structured capability.`,
      );
    }
  });
  const envelope = createFullStorageFixtureEnvelope();
  assert(validateProductStorageEnvelope(envelope).valid, 'Full fixture envelope is invalid.');
  const privacyViolation = createProductStorageEnvelope({
    createdAt: STORAGE_FIXTURE_TIME,
    data: {
      completionState: {
        data: { completedStages: ['rawAudio'] },
        schemaVersion: 'completion-storage-v1',
      },
    },
    locale: 'ru',
    productVersion: '5.4-fixture',
  });
  assert(
    validateProductStorageEnvelope(privacyViolation).valid,
    'Semantic stage name was incorrectly treated as raw audio data.',
  );
  const rawAudioViolation = withEnvelopeChecksum({
    ...privacyViolation,
    data: {
      ...privacyViolation.data,
      completionState: {
        data: { completedStages: [], rawAudio: 'forbidden' },
        schemaVersion: 'completion-storage-v1',
      } as never,
    },
  });
  assert(
    validateProductStorageEnvelope(rawAudioViolation).errors.some(
      (item) => item.code === 'privacy-boundary',
    ),
    'Raw audio privacy boundary was not enforced.',
  );
}

export function runProductStorageRuntimeSuite(): ProductStorageRuntimeReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert: Assert = (condition, message) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const suites = {
    browser: true,
    checksum: true,
    deletion: true,
    exportImport: true,
    fixtures: true,
    migration: true,
    recovery: true,
    serialization: true,
    transaction: true,
  };
  const run = (name: keyof typeof suites, test: (assertion: Assert) => void) => {
    const before = errors.length;
    try {
      test(assert);
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
    suites[name] = errors.length === before;
  };
  run('serialization', runSerialization);
  run('checksum', runChecksum);
  run('migration', runMigration);
  run('transaction', runTransaction);
  run('recovery', runRecovery);
  run('exportImport', runExportImport);
  run('deletion', runDeletion);
  run('browser', runBrowser);
  run('fixtures', runFixtureChecks);
  return {
    assertionCount,
    errors,
    fixtureCount: productStorageFixtures.length,
    suites,
    valid: errors.length === 0,
  };
}
