import { createLegacyCleanupPlan, InMemoryProductStorageLegacyBridge } from '../compatibility';
import {
  completionStorageAdapter,
  draftPortraitStorageAdapter,
  journeyStorageAdapter,
  numerologyStorageAdapter,
  tarotReadingsStorageAdapter,
  tarotSessionStorageAdapter,
} from '../adapters';
import { PRODUCT_STORAGE_KEYS } from '../constants';
import { buildProductStorageExport } from '../export-import';
import {
  BrowserProductStorageRepository,
  InMemoryProductStorageRepository,
  writeEnvelopeTransactionally,
} from '../repositories';
import { createProductStorageEnvelope } from '../schemas';
import { ProductStorageService, type ProductStorageServiceOptions } from '../service';
import { serializeProductStorageEnvelope, withEnvelopeChecksum } from '../serialization';
import type {
  ExternalStorageChangeEvent,
  ProductStorageDiagnosticEvent,
  ProductStorageActivationMode,
  ProductStorageEventTarget,
  ProductStorageFeatureFlag,
  ProductStorageRepository,
  TransactionWriteResult,
} from '../types';
import { cloneJson } from '../utils';
import { resolveProductStorageFeatureFlag } from '../runtime/feature-flag';
import {
  createFullStorageFixtureEnvelope,
  legacyFixtureValues,
  materializeProductStorageFixture,
  productStorageFixtures,
  storageFixtureReading,
} from './fixtures';
import { ACTIVATION_FIXTURE_TIME, productStorageActivationFixtures } from './activation-fixtures';

type Assert = (condition: boolean, message: string) => void;

export type ProductStorageActivationRuntimeReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  suites: Readonly<
    Record<
      | 'bootstrap'
      | 'conflicts'
      | 'deletion'
      | 'dualWrite'
      | 'fixtures'
      | 'importExport'
      | 'journeyMemory'
      | 'multiTab'
      | 'privacy'
      | 'recovery',
      boolean
    >
  >;
  valid: boolean;
};

const enabledFlag: ProductStorageFeatureFlag = {
  enabled: true,
  name: 'productStorageV2',
  source: 'environment',
};

function serialize(envelope = createFullStorageFixtureEnvelope()) {
  const serialized = serializeProductStorageEnvelope(envelope);
  if (serialized.status !== 'success') throw new Error(serialized.errors.join(' '));
  return serialized.json;
}

class DiagnosticCollector {
  readonly events: ProductStorageDiagnosticEvent[] = [];
  emit(event: ProductStorageDiagnosticEvent) {
    this.events.push(event);
  }
}

class FakeEventTarget implements ProductStorageEventTarget {
  addCount = 0;
  removeCount = 0;
  private listener: ((event: { key: string | null; newValue: string | null }) => void) | null =
    null;
  addEventListener(
    _type: 'storage',
    listener: (event: { key: string | null; newValue: string | null }) => void,
  ) {
    this.addCount += 1;
    this.listener = listener;
  }
  removeEventListener(
    _type: 'storage',
    listener: (event: { key: string | null; newValue: string | null }) => void,
  ) {
    if (this.listener === listener) this.listener = null;
    this.removeCount += 1;
  }
  emit(event: { key: string | null; newValue: string | null }) {
    this.listener?.(event);
  }
}

class FailingStorage implements Storage {
  private readonly values = new Map<string, string>();
  constructor(private readonly failure: 'quota' | 'security') {}
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    if (this.failure === 'security') throw new DOMException('Denied', 'SecurityError');
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    if (this.failure === 'security') throw new DOMException('Denied', 'SecurityError');
    throw new DOMException(`${key}:${value.length}`, 'QuotaExceededError');
  }
}

function createService(
  input: {
    eventTarget?: ProductStorageEventTarget;
    featureFlag?: ProductStorageFeatureFlag;
    legacy?: InMemoryProductStorageLegacyBridge;
    mode?: ProductStorageActivationMode;
    repository?: ProductStorageRepository;
    transactionWriter?: ProductStorageServiceOptions['transactionWriter'];
  } = {},
) {
  const diagnostics = new DiagnosticCollector();
  const legacy = input.legacy ?? new InMemoryProductStorageLegacyBridge();
  const repository = input.repository ?? new InMemoryProductStorageRepository();
  const service = new ProductStorageService({
    diagnostics,
    eventTarget: input.eventTarget,
    featureFlag: input.featureFlag ?? enabledFlag,
    legacy,
    locale: 'ru',
    mode: input.mode ?? 'envelope-primary',
    now: ACTIVATION_FIXTURE_TIME,
    productVersion: '5.5-fixture',
    repository,
    transactionWriter: input.transactionWriter,
  });
  return { diagnostics, legacy, repository, service };
}

function repositoryWithEnvelope() {
  return new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: serialize(),
  });
}

function runBootstrap(assert: Assert) {
  const empty = createService();
  const first = empty.service.bootstrap();
  assert(first.safeToUseEnvelope && first.migrated, 'First empty launch did not activate v2.');
  assert(first.activeRevision === 1, 'First launch revision is incorrect.');
  const firstRaw = empty.repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
  assert(
    firstRaw.ok && Boolean(firstRaw.value),
    'First launch did not persist an active envelope.',
  );

  const legacyValues = legacyFixtureValues();
  const mixedLegacy = new InMemoryProductStorageLegacyBridge({ local: legacyValues });
  const migrated = createService({ legacy: mixedLegacy });
  const migrationResult = migrated.service.bootstrap();
  assert(migrationResult.safeToUseEnvelope, 'Mixed legacy migration did not activate envelope.');
  assert(Boolean(migrated.service.getSection('journey')), 'Legacy Journey was not bridged.');
  assert(
    Boolean(migrated.service.getSection('tarotReadings')),
    'Legacy Tarot readings were not bridged.',
  );
  assert(Boolean(migrated.service.getSection('journeyMemory')), 'Journey Memory was not created.');
  assert(!migrated.service.getSection('tarotSession'), 'Session-only Tarot leaked into envelope.');
  assert(
    !migrated.service.getSection('draftPortrait'),
    'Volatile Draft Portrait leaked into envelope.',
  );
  assert(
    mixedLegacy.snapshot().local['app:personal-journey-v1'] ===
      legacyValues['app:personal-journey-v1'],
    'Bootstrap modified a legacy key.',
  );
  assert(
    mixedLegacy.snapshot().local['ui-theme'] === legacyValues['ui-theme'] &&
      mixedLegacy.snapshot().local['app:locale'] === legacyValues['app:locale'],
    'Theme or locale legacy value changed during activation.',
  );

  const journeyOnlyLegacy = new InMemoryProductStorageLegacyBridge({
    local: {
      'app:personal-journey-v1': legacyValues['app:personal-journey-v1']!,
    },
  });
  const journeyOnly = createService({ legacy: journeyOnlyLegacy });
  journeyOnly.service.bootstrap();
  assert(
    Boolean(journeyOnly.service.getSection('journey')),
    'Journey-only launch was not migrated.',
  );
  assert(
    Boolean(journeyOnly.service.getSection('tarotReadings')),
    'Legacy Tarot readings inside Journey were not migrated.',
  );

  const existingLegacy = new InMemoryProductStorageLegacyBridge({
    local: {
      ...legacyValues,
      'app:personal-journey-v1': JSON.stringify({
        dailyCards: {},
        identity: 'newer-legacy',
        readings: [],
      }),
    },
  });
  const existing = createService({ legacy: existingLegacy, repository: repositoryWithEnvelope() });
  const existingResult = existing.service.bootstrap();
  assert(existingResult.safeToUseEnvelope, 'Existing valid envelope was not primary.');
  assert(
    existing.service.getSection('journey')?.data.identity === 'journey-storage-fixture',
    'Newer legacy data incorrectly replaced a valid envelope.',
  );

  const disabledLegacy = new InMemoryProductStorageLegacyBridge({ local: legacyValues });
  const disabled = createService({
    featureFlag: { enabled: false, name: 'productStorageV2', source: 'environment' },
    legacy: disabledLegacy,
  });
  const disabledResult = disabled.service.bootstrap();
  assert(
    disabledResult.status === 'disabled' && disabledResult.usedLegacyFallback,
    'Disabled feature flag did not preserve legacy-only mode.',
  );
  const disabledActive = disabled.repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
  assert(disabledActive.ok && !disabledActive.value, 'Disabled feature flag wrote an envelope.');
  const fallbackWrite = disabled.service.updateSection('journey', {
    data: changedJourney(),
    schemaVersion: 'journey-storage-v1',
  });
  assert(
    fallbackWrite.status === 'legacy-only' && fallbackWrite.legacyWritten,
    'Disabled activation did not preserve legacy-only writes.',
  );
  assert(
    resolveProductStorageFeatureFlag({ environment: 'development' }).enabled,
    'Development feature flag default is not enabled.',
  );
  assert(
    !resolveProductStorageFeatureFlag({ environment: 'production' }).enabled,
    'Production feature flag default is not safely disabled.',
  );

  const repeat = createService();
  const initial = repeat.service.bootstrap();
  const again = repeat.service.bootstrap();
  assert(
    initial.activeRevision === again.activeRevision,
    'Repeated bootstrap changed revision or duplicated data.',
  );

  const shadow = createService({
    legacy: new InMemoryProductStorageLegacyBridge({ local: legacyValues }),
    mode: 'shadow',
  });
  const shadowResult = shadow.service.bootstrap();
  const shadowActive = shadow.repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
  assert(
    shadowResult.mode === 'shadow' &&
      !shadowResult.safeToUseEnvelope &&
      shadowActive.ok &&
      !shadowActive.value,
    'Shadow mode persisted or activated an envelope.',
  );
  const recoveryOnly = createService({ mode: 'recovery-only' });
  const recoveryOnlyResult = recoveryOnly.service.bootstrap();
  assert(
    recoveryOnlyResult.usedLegacyFallback && !recoveryOnlyResult.safeToUseEnvelope,
    'Recovery-only mode unexpectedly migrated empty legacy storage.',
  );
  const dualMode = createService({ mode: 'dual-write', repository: repositoryWithEnvelope() });
  assert(
    dualMode.service.bootstrap().mode === 'dual-write',
    'Dual-write activation mode was lost.',
  );
}

function runRecovery(assert: Assert) {
  const backupRepository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: '{bad',
    [PRODUCT_STORAGE_KEYS.backupEnvelope]: serialize(),
  });
  const backup = createService({ repository: backupRepository });
  const result = backup.service.bootstrap();
  assert(result.recovered && result.usedBackup, 'Valid backup was not activated.');
  assert(result.safeToUseEnvelope, 'Recovered backup is not safe to use.');

  const temporaryRepository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.temporaryTransaction]: serialize(),
  });
  const temporary = createService({ repository: temporaryRepository });
  const temporaryResult = temporary.service.bootstrap();
  assert(temporaryResult.recovered, 'Interrupted temporary transaction was not recovered.');

  const activeEnvelope = createFullStorageFixtureEnvelope();
  const newerTemporary = withEnvelopeChecksum({
    ...activeEnvelope,
    data: {
      ...activeEnvelope.data,
      completionState: {
        data: { completedStages: ['newer-temporary'] },
        schemaVersion: 'completion-storage-v1',
      },
    },
    revision: activeEnvelope.revision + 1,
  });
  const partialRepository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: serialize(activeEnvelope),
    [PRODUCT_STORAGE_KEYS.temporaryTransaction]: serialize(newerTemporary),
  });
  const partialRuntime = createService({ repository: partialRepository });
  const partialResult = partialRuntime.service.bootstrap();
  assert(partialResult.recovered, 'Newer temporary transaction was ignored beside valid active.');
  assert(
    partialRuntime.service
      .getSection('completionState')
      ?.data.completedStages.includes('newer-temporary') === true,
    'Newer temporary transaction content was not promoted.',
  );

  for (const id of ['invalid-journey-section', 'invalid-tarot-section'] as const) {
    const fixture = productStorageFixtures.find((item) => item.id === id);
    if (!fixture) throw new Error(`Missing ${id}.`);
    const materialized = materializeProductStorageFixture(fixture);
    const repository = new InMemoryProductStorageRepository({
      [PRODUCT_STORAGE_KEYS.activeEnvelope]: materialized.activeRaw ?? '',
    });
    const recovered = createService({ repository });
    const activation = recovered.service.bootstrap();
    assert(activation.recovered, `${id}: corrupted section was not recovered.`);
    assert(activation.safeToUseEnvelope, `${id}: valid independent data was not preserved.`);
  }

  const futureRaw = JSON.stringify({ schemaVersion: 'product-storage-v99' });
  const futureRepository = new InMemoryProductStorageRepository({
    [PRODUCT_STORAGE_KEYS.activeEnvelope]: futureRaw,
  });
  const future = createService({ repository: futureRepository });
  const futureResult = future.service.bootstrap();
  assert(futureResult.usedLegacyFallback, 'Future schema did not enter fallback mode.');
  assert(
    futureRepository.snapshot()[PRODUCT_STORAGE_KEYS.activeEnvelope] === futureRaw,
    'Future schema was overwritten.',
  );

  const unavailable = createService({
    repository: new BrowserProductStorageRepository(new FailingStorage('security')),
  });
  const unavailableResult = unavailable.service.bootstrap();
  assert(
    unavailableResult.safeToUseEnvelope && unavailable.service.getCapability() === 'unavailable',
    'Unavailable browser storage did not use memory-only envelope mode.',
  );
  const quota = createService({
    repository: new BrowserProductStorageRepository(new FailingStorage('quota')),
  });
  const quotaResult = quota.service.bootstrap();
  assert(
    quotaResult.safeToUseEnvelope && quota.service.getCapability() === 'quota-limited',
    'Quota failure did not use memory fallback.',
  );
}

function changedJourney() {
  const envelope = createFullStorageFixtureEnvelope();
  const journey = cloneJson(envelope.data.journey!.data);
  const first = journey.readings[0]!;
  journey.readings = [
    { ...first, reading: { ...first.reading, id: `${first.reading.id}:second` } },
    ...journey.readings,
  ];
  return journey;
}

function runDualWrite(assert: Assert) {
  const order: string[] = [];
  const repository = new InMemoryProductStorageRepository(
    { [PRODUCT_STORAGE_KEYS.activeEnvelope]: serialize() },
    {},
    order,
  );
  const legacy = new InMemoryProductStorageLegacyBridge({}, {}, order);
  const runtime = createService({ legacy, repository });
  runtime.service.bootstrap();
  order.length = 0;
  const journey = changedJourney();
  const write = runtime.service.updateSection('journey', {
    data: journey,
    schemaVersion: 'journey-storage-v1',
  });
  assert(write.status === 'success', 'Safe Journey dual-write failed.');
  const envelopePromotion = order.lastIndexOf(
    `envelope:write:${PRODUCT_STORAGE_KEYS.activeEnvelope}`,
  );
  const legacyWrite = order.indexOf('legacy:journey');
  assert(
    envelopePromotion >= 0 && legacyWrite > envelopePromotion,
    'Legacy was written before the validated envelope.',
  );

  const failingLegacy = new InMemoryProductStorageLegacyBridge({}, { journey: true });
  const envelopeFirst = createService({
    legacy: failingLegacy,
    repository: repositoryWithEnvelope(),
  });
  envelopeFirst.service.bootstrap();
  const partial = envelopeFirst.service.updateSection('journey', {
    data: changedJourney(),
    schemaVersion: 'journey-storage-v1',
  });
  assert(
    partial.status === 'envelope-only' && partial.envelopeWritten,
    'Legacy failure incorrectly rolled back a valid envelope.',
  );

  const numerologyOrder: string[] = [];
  const numerologyRepository = new InMemoryProductStorageRepository(
    { [PRODUCT_STORAGE_KEYS.activeEnvelope]: serialize() },
    {},
    numerologyOrder,
  );
  const numerologyLegacy = new InMemoryProductStorageLegacyBridge({}, {}, numerologyOrder);
  const numerologyRuntime = createService({
    legacy: numerologyLegacy,
    repository: numerologyRepository,
  });
  numerologyRuntime.service.bootstrap();
  numerologyOrder.length = 0;
  const numerologyWrite = numerologyRuntime.service.updateSection('numerology', {
    data: { birthDate: '1991-02-03', profile: null },
    schemaVersion: 'numerology-storage-v1',
  });
  assert(numerologyWrite.status === 'success', 'Numerology dual-write failed.');
  assert(
    numerologyOrder.indexOf('legacy:numerology') >
      numerologyOrder.lastIndexOf(`envelope:write:${PRODUCT_STORAGE_KEYS.activeEnvelope}`),
    'Numerology legacy mirror was written before envelope promotion.',
  );

  const before = serializeProductStorageEnvelope(envelopeFirst.service.getSnapshot()!);
  const sessionAttempt = envelopeFirst.service.updateSection('tarotSession', {
    data: createFullStorageFixtureEnvelope().data.tarotSession!.data,
    schemaVersion: 'tarot-session-storage-v1',
  });
  const after = serializeProductStorageEnvelope(envelopeFirst.service.getSnapshot()!);
  assert(sessionAttempt.status === 'failed', 'Session-only Tarot was accepted for persistence.');
  assert(
    before.status === 'success' && after.status === 'success' && before.json === after.json,
    'Session-only Tarot changed the persistent envelope.',
  );
}

function runConflicts(assert: Assert) {
  let resolvedCalls = 0;
  const repository = repositoryWithEnvelope();
  const resolvedWriter: ProductStorageServiceOptions['transactionWriter'] = (
    target,
    attempted,
    options,
  ): TransactionWriteResult => {
    resolvedCalls += 1;
    if (resolvedCalls === 1) {
      const external = withEnvelopeChecksum({
        ...attempted,
        revision: attempted.revision + 1,
        updatedAt: ACTIVATION_FIXTURE_TIME,
      });
      target.write(PRODUCT_STORAGE_KEYS.activeEnvelope, serialize(external));
      return { attemptedEnvelope: attempted, latestEnvelope: external, status: 'conflict' };
    }
    return writeEnvelopeTransactionally(target, attempted, options);
  };
  const resolved = createService({ repository, transactionWriter: resolvedWriter });
  resolved.service.bootstrap();
  const resolvedResult = resolved.service.updateSection('completionState', {
    data: { completedStages: ['reading'] },
    schemaVersion: 'completion-storage-v1',
  });
  assert(resolvedResult.status === 'success', 'Controlled conflict retry did not succeed.');
  assert(resolvedCalls === 2, 'Conflict retry count was not exactly one.');

  let unresolvedCalls = 0;
  const unresolvedWriter: ProductStorageServiceOptions['transactionWriter'] = (
    _target,
    attempted,
  ) => {
    unresolvedCalls += 1;
    const latest = withEnvelopeChecksum({ ...attempted, revision: attempted.revision + 1 });
    return { attemptedEnvelope: attempted, latestEnvelope: latest, status: 'conflict' };
  };
  const unresolved = createService({
    repository: repositoryWithEnvelope(),
    transactionWriter: unresolvedWriter,
  });
  unresolved.service.bootstrap();
  const conflict = unresolved.service.updateSection('completionState', {
    data: { completedStages: ['reading'] },
    schemaVersion: 'completion-storage-v1',
  });
  assert(conflict.status === 'conflict', 'Unresolved revision conflict was overwritten.');
  assert(unresolvedCalls === 2, 'Unresolved conflict retried more than once.');
}

function runMultiTab(assert: Assert) {
  const eventTarget = new FakeEventTarget();
  const runtime = createService({ eventTarget, repository: repositoryWithEnvelope() });
  runtime.service.bootstrap();
  const events: ExternalStorageChangeEvent[] = [];
  const firstDispose = runtime.service.subscribeExternalChanges((event) => events.push(event));
  runtime.service.subscribeExternalChanges((event) => events.push(event));
  assert(eventTarget.addCount === 1, 'Storage listener was registered more than once.');
  const current = runtime.service.getSnapshot()!;
  const external = withEnvelopeChecksum({ ...current, revision: current.revision + 1 });
  eventTarget.emit({
    key: PRODUCT_STORAGE_KEYS.activeEnvelope,
    newValue: serialize(external),
  });
  assert(events.length === 2, 'External change was not delivered to subscribers.');
  const older = withEnvelopeChecksum({ ...external, revision: current.revision });
  eventTarget.emit({ key: PRODUCT_STORAGE_KEYS.activeEnvelope, newValue: serialize(older) });
  assert(events.length === 2, 'Older external revision was not ignored.');
  firstDispose();
  runtime.service.dispose();
  assert(eventTarget.removeCount === 1, 'Service dispose did not remove storage listener.');
}

function runJourneyMemory(assert: Assert) {
  const runtime = createService({ repository: repositoryWithEnvelope() });
  runtime.service.bootstrap();
  const before = runtime.service.getSection('journeyMemory')!;
  const sameJourney = runtime.service.getSection('journey')!.data;
  runtime.service.updateSection('journey', {
    data: sameJourney,
    schemaVersion: 'journey-storage-v1',
  });
  const reused = runtime.service.getSection('journeyMemory')!;
  assert(
    before.data.metadata.entryFingerprint === reused.data.metadata.entryFingerprint &&
      before.data.metadata.generatedAt === reused.data.metadata.generatedAt,
    'Unchanged Journey readings rebuilt Journey Memory.',
  );
  runtime.service.updateSection('journey', {
    data: changedJourney(),
    schemaVersion: 'journey-storage-v1',
  });
  const rebuilt = runtime.service.getSection('journeyMemory')!;
  assert(
    rebuilt.data.metadata.entryFingerprint !== reused.data.metadata.entryFingerprint,
    'Changed Journey readings did not rebuild Journey Memory.',
  );
}

function runImportExport(assert: Assert) {
  const runtime = createService({ repository: repositoryWithEnvelope() });
  runtime.service.bootstrap();
  const full = runtime.service.createExport('full');
  const tarot = runtime.service.createExport('tarot-readings');
  assert(Boolean(full && tarot), 'Runtime exports were not created.');
  assert(!full?.json.includes('tarot-session-storage-v1'), 'Export included Tarot session.');
  assert(!full?.json.includes('draft-storage-v1'), 'Export included volatile Draft Portrait.');
  const preview = runtime.service.previewImport(full!.json);
  assert(preview.status === 'preview', 'Import preview was not non-mutating.');
  const beforeRevision = runtime.service.getSnapshot()!.revision;
  const merged = runtime.service.applyImport(full!.json, 'merge');
  assert(merged.writeResult.envelopeWritten, 'Merge import was not applied transactionally.');
  assert(
    runtime.service.getSnapshot()!.revision === beforeRevision + 1,
    'Import did not increment revision.',
  );

  const replacementRepository = repositoryWithEnvelope();
  const replacement = createService({ repository: replacementRepository });
  replacement.service.bootstrap();
  const sourceEnvelope = createProductStorageEnvelope({
    createdAt: ACTIVATION_FIXTURE_TIME,
    data: {
      preferences: replacement.service.getSnapshot()!.data.preferences,
    },
    engineVersions: replacement.service.getSnapshot()!.engineVersions,
    locale: 'en',
    productVersion: '5.5.0',
    updatedAt: ACTIVATION_FIXTURE_TIME,
  });
  const replacementExport = buildProductStorageExport(sourceEnvelope, {
    exportedAt: ACTIVATION_FIXTURE_TIME,
    scope: 'full',
  });
  const applied = replacement.service.applyImport(replacementExport.json, 'replace');
  assert(applied.writeResult.envelopeWritten, 'Replace import failed.');
  assert(
    Boolean(replacementRepository.snapshot()[PRODUCT_STORAGE_KEYS.backupEnvelope]),
    'Replace import did not preserve a backup.',
  );
  assert(
    !replacement.service.getSection('journey') && !replacement.service.getSection('tarotReadings'),
    'Full replace import retained sections absent from the package.',
  );
}

function runDeletion(assert: Assert) {
  const tarot = createService({ repository: repositoryWithEnvelope() });
  tarot.service.bootstrap();
  const deleteTarot = tarot.service.deleteSection('tarot-readings');
  assert(deleteTarot.envelopeWritten, 'Tarot deletion was not transactional.');
  assert(!tarot.service.getSection('tarotReadings'), 'Tarot readings remain after deletion.');
  assert(
    tarot.service.getSection('journey')?.data.readings.length === 0 &&
      !tarot.service.getSection('journeyMemory'),
    'Tarot deletion left dependent Journey references.',
  );

  const journey = createService({ repository: repositoryWithEnvelope() });
  journey.service.bootstrap();
  journey.service.deleteSection('journey');
  assert(
    !journey.service.getSection('journey') && !journey.service.getSection('journeyMemory'),
    'Journey deletion left Journey Memory.',
  );

  const all = createService({ repository: repositoryWithEnvelope() });
  all.service.bootstrap();
  all.service.deleteSection('all-personal-data');
  const data = all.service.getSnapshot()!.data;
  assert(
    Object.keys(data).length === 1 && Boolean(data.preferences),
    'Delete-all did not preserve preferences only.',
  );
  const deletionBackup = all.repository.read(PRODUCT_STORAGE_KEYS.backupEnvelope);
  assert(deletionBackup.ok && Boolean(deletionBackup.value), 'Deletion did not create a backup.');
}

function runPrivacy(assert: Assert) {
  const runtime = createService({ repository: repositoryWithEnvelope() });
  runtime.service.bootstrap();
  const serialized = serialize(runtime.service.getSnapshot()!);
  assert(
    !/audioBlob|rawAudio|microphoneData|authToken|apiKey/i.test(serialized),
    'Persistent envelope contains prohibited private data.',
  );
  const full = runtime.service.createExport('full')!;
  assert(
    !/audioBlob|rawAudio|microphoneData|authToken|apiKey/i.test(full.json),
    'Export contains prohibited private data.',
  );
  const diagnostics = JSON.stringify(runtime.diagnostics.events);
  assert(
    !diagnostics.includes(storageFixtureReading.headline) && !diagnostics.includes('1990-01-01'),
    'Diagnostic logging contains personal content.',
  );
  assert(
    runtime.diagnostics.events.every((event) =>
      Object.keys(event).every((key) =>
        [
          'code',
          'migrationId',
          'recoveryStrategy',
          'revision',
          'schemaVersion',
          'section',
          'status',
        ].includes(key),
      ),
    ),
    'Diagnostic event contains a non-allowlisted field.',
  );
  const migratedRuntime = createService();
  migratedRuntime.service.bootstrap();
  const cleanup = createLegacyCleanupPlan({
    backupValid: true,
    envelope: migratedRuntime.service.getSnapshot(),
    exportReady: true,
    successfulBootstraps: 3,
    unsupportedDataDetected: false,
  });
  assert(
    cleanup.eligible && cleanup.requiresUserConfirmation,
    'Eligible cleanup plan is incomplete.',
  );
  const blocked = createLegacyCleanupPlan({
    backupValid: false,
    envelope: migratedRuntime.service.getSnapshot(),
    exportReady: false,
    successfulBootstraps: 1,
    unsupportedDataDetected: true,
  });
  assert(
    !blocked.eligible && blocked.blockers.length === 4,
    'Unsafe cleanup plan was marked eligible.',
  );
}

function runFixtures(assert: Assert) {
  assert(
    productStorageActivationFixtures.length === 32,
    'Activation fixture suite must contain 32 required fixtures.',
  );
  const ids = new Set(productStorageActivationFixtures.map((fixture) => fixture.id));
  assert(ids.size === 32, 'Activation fixture ids are not unique.');
  productStorageActivationFixtures.forEach((fixture) => {
    assert(fixture.timestamp === ACTIVATION_FIXTURE_TIME, `${fixture.id}: timestamp is unstable.`);
    assert(fixture.seed.endsWith(fixture.id), `${fixture.id}: seed is unstable.`);
  });
  const adapters = [
    journeyStorageAdapter,
    tarotReadingsStorageAdapter,
    numerologyStorageAdapter,
    draftPortraitStorageAdapter,
    completionStorageAdapter,
    tarotSessionStorageAdapter,
  ];
  assert(
    adapters.every(
      (adapter) =>
        typeof adapter.fromEnvelope === 'function' &&
        typeof adapter.toEnvelopeSection === 'function' &&
        typeof adapter.mergeStrategy === 'function' &&
        typeof adapter.validation === 'function' &&
        typeof adapter.legacyFallback === 'function',
    ),
    'One or more store adapters are missing a compatibility contract method.',
  );
  assert(
    journeyStorageAdapter.ownership === 'envelope-primary' &&
      tarotReadingsStorageAdapter.ownership === 'envelope-primary' &&
      numerologyStorageAdapter.ownership === 'envelope-primary' &&
      tarotSessionStorageAdapter.ownership === 'session-only' &&
      draftPortraitStorageAdapter.ownership === 'volatile',
    'Section ownership does not match the controlled activation policy.',
  );
}

export function runProductStorageActivationRuntimeSuite(): ProductStorageActivationRuntimeReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert: Assert = (condition, message) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const suites = {
    bootstrap: true,
    conflicts: true,
    deletion: true,
    dualWrite: true,
    fixtures: true,
    importExport: true,
    journeyMemory: true,
    multiTab: true,
    privacy: true,
    recovery: true,
  };
  const run = (name: keyof typeof suites, suite: (assertion: Assert) => void) => {
    const before = errors.length;
    try {
      suite(assert);
    } catch (caught) {
      errors.push(`${name}: ${caught instanceof Error ? caught.message : String(caught)}`);
    }
    suites[name] = errors.length === before;
  };
  run('bootstrap', runBootstrap);
  run('recovery', runRecovery);
  run('dualWrite', runDualWrite);
  run('conflicts', runConflicts);
  run('multiTab', runMultiTab);
  run('journeyMemory', runJourneyMemory);
  run('importExport', runImportExport);
  run('deletion', runDeletion);
  run('privacy', runPrivacy);
  run('fixtures', runFixtures);
  return {
    assertionCount,
    errors,
    fixtureCount: productStorageActivationFixtures.length,
    suites,
    valid: errors.length === 0,
  };
}
