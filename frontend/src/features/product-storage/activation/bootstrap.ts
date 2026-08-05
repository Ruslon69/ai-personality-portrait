import { journeySectionsFromState } from '../compatibility';
import { LEGACY_STORAGE_KEYS, PRODUCT_STORAGE_KEYS } from '../constants';
import { migrateLegacyStorage } from '../migrations';
import { recoverProductStorage } from '../recovery';
import { writeEnvelopeTransactionally, writeRecoveredEnvelope } from '../repositories';
import { parseProductStorageEnvelope } from '../serialization';
import type {
  ProductStorageActivationMode,
  ProductStorageActivationResult,
  ProductStorageDiagnosticSink,
  ProductStorageEnvelope,
  ProductStorageFeatureFlag,
  ProductStorageLegacyBridge,
  ProductStorageRepository,
  ProductStorageSection,
  ProductStorageSectionActivationStatus,
  ProductStorageValidationError,
} from '../types';
import { validateProductStorageEnvelope } from '../validation';

export type ProductStorageBootstrapResult = {
  activation: ProductStorageActivationResult;
  envelope: ProductStorageEnvelope | null;
};

export type ProductStorageBootstrapInput = {
  diagnostics: ProductStorageDiagnosticSink;
  featureFlag: ProductStorageFeatureFlag;
  legacy: ProductStorageLegacyBridge;
  locale: ProductStorageEnvelope['locale'];
  mode?: ProductStorageActivationMode;
  now: string;
  productVersion: string;
  repository: ProductStorageRepository;
};

const envelopeSections: readonly (keyof ProductStorageEnvelope['data'])[] = [
  'completionState',
  'journey',
  'journeyMemory',
  'numerology',
  'tarotReadings',
];

function sectionStatuses(
  envelope: ProductStorageEnvelope | null,
  loadedStatus: ProductStorageSectionActivationStatus,
) {
  const statuses: Partial<Record<ProductStorageSection, ProductStorageSectionActivationStatus>> = {
    draftPortrait: 'volatile',
    preferences: 'legacy-preserved',
    tarotSession: 'session-only',
  };
  envelopeSections.forEach((section) => {
    statuses[section] =
      loadedStatus === 'fallback' ? 'fallback' : envelope?.data[section] ? loadedStatus : 'missing';
  });
  return statuses;
}

function activation(
  input: ProductStorageBootstrapInput,
  options: {
    envelope: ProductStorageEnvelope | null;
    errors?: readonly ProductStorageValidationError[];
    migrated?: boolean;
    mode: ProductStorageActivationMode;
    recovered?: boolean;
    safe: boolean;
    status: ProductStorageActivationResult['status'];
    usedBackup?: boolean;
    usedLegacyFallback?: boolean;
    warnings?: readonly string[];
  },
): ProductStorageBootstrapResult {
  const loadedStatus: ProductStorageSectionActivationStatus = options.recovered
    ? 'recovered'
    : options.migrated
      ? 'migrated'
      : options.safe
        ? 'primary'
        : 'fallback';
  return {
    activation: {
      activeRevision: options.envelope?.revision ?? null,
      capability: input.repository.capability(),
      errors: options.errors ?? [],
      legacyKeysPreserved: true,
      migrated: options.migrated ?? false,
      mode: options.mode,
      nextRecommendedAction: options.safe
        ? 'continue-envelope'
        : options.status === 'disabled'
          ? 'continue-legacy'
          : options.status === 'failed'
            ? 'recover-storage'
            : options.usedLegacyFallback
              ? 'retry-next-launch'
              : 'continue-legacy',
      recovered: options.recovered ?? false,
      safeToUseEnvelope: options.safe,
      sectionStatuses: sectionStatuses(options.envelope, loadedStatus),
      status: options.status,
      usedBackup: options.usedBackup ?? false,
      usedLegacyFallback: options.usedLegacyFallback ?? false,
      warnings: options.warnings ?? [],
    },
    envelope: options.envelope,
  };
}

function synchronizeDerivedSections(envelope: ProductStorageEnvelope, now: string) {
  const data = { ...envelope.data };
  const privacyScopeChanged = Boolean(data.draftPortrait || data.tarotSession);
  delete data.draftPortrait;
  delete data.tarotSession;
  const scopedEnvelope = privacyScopeChanged ? { ...envelope, data } : envelope;
  if (!scopedEnvelope.data.journey)
    return { changed: privacyScopeChanged, envelope: scopedEnvelope };
  const sections = journeySectionsFromState(scopedEnvelope.data.journey.data, scopedEnvelope, now);
  const changed =
    privacyScopeChanged ||
    sections.journeyMemory !== scopedEnvelope.data.journeyMemory ||
    !scopedEnvelope.data.tarotReadings;
  return {
    changed,
    envelope: changed
      ? { ...scopedEnvelope, data: { ...scopedEnvelope.data, ...sections } }
      : scopedEnvelope,
  };
}

function verifiedActive(repository: ProductStorageRepository) {
  const value = repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
  if (!value.ok || !value.value) return null;
  const parsed = parseProductStorageEnvelope(value.value);
  return parsed.status === 'success' ? parsed.envelope : null;
}

function fallback(
  input: ProductStorageBootstrapInput,
  errors: readonly ProductStorageValidationError[] = [],
  warnings: readonly string[] = [],
) {
  return activation(input, {
    envelope: null,
    errors,
    mode: 'legacy-fallback',
    safe: false,
    status: 'fallback',
    usedLegacyFallback: true,
    warnings,
  });
}

function bootstrapInternal(input: ProductStorageBootstrapInput): ProductStorageBootstrapResult {
  const requestedMode = input.mode ?? 'envelope-primary';
  if (!input.featureFlag.enabled) {
    input.diagnostics.emit({ code: 'activation-disabled', status: 'info' });
    return activation(input, {
      envelope: null,
      mode: 'legacy-fallback',
      safe: false,
      status: 'disabled',
      usedLegacyFallback: true,
    });
  }

  const activeRead = input.repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
  const backupRead = input.repository.read(PRODUCT_STORAGE_KEYS.backupEnvelope);
  const temporaryRead = input.repository.read(PRODUCT_STORAGE_KEYS.temporaryTransaction);
  if (!activeRead.ok || !backupRead.ok || !temporaryRead.ok)
    return fallback(input, [], ['storage-read-failed']);
  const activeParsed = activeRead.value ? parseProductStorageEnvelope(activeRead.value) : null;
  if (activeParsed?.status === 'unsupported-version') {
    input.diagnostics.emit({
      code: 'unsupported-future-version',
      schemaVersion: activeParsed.foundVersion,
      status: 'warning',
    });
    return fallback(input, [], ['unsupported-future-version-preserved']);
  }

  if (activeParsed?.status === 'success') {
    const temporaryParsed = temporaryRead.value
      ? parseProductStorageEnvelope(temporaryRead.value)
      : null;
    if (
      temporaryParsed?.status === 'success' &&
      temporaryParsed.envelope.revision > activeParsed.envelope.revision
    ) {
      if (requestedMode === 'shadow')
        return activation(input, {
          envelope: null,
          mode: 'shadow',
          recovered: true,
          safe: false,
          status: 'recovered',
          warnings: ['newer-temporary-transaction-detected'],
        });
      const promoted = writeEnvelopeTransactionally(
        input.repository,
        synchronizeDerivedSections(temporaryParsed.envelope, input.now).envelope,
        { expectedRevision: activeParsed.envelope.revision, now: input.now },
      );
      if (promoted.status === 'success')
        return activation(input, {
          envelope: promoted.envelope,
          mode: requestedMode,
          recovered: true,
          safe: true,
          status: 'recovered',
          warnings: ['newer-temporary-transaction-promoted'],
        });
      return activation(input, {
        envelope: synchronizeDerivedSections(activeParsed.envelope, input.now).envelope,
        mode: requestedMode,
        safe: true,
        status: 'ready',
        warnings: ['temporary-transaction-promotion-deferred'],
      });
    }
    if (temporaryRead.value && temporaryParsed?.status === 'success')
      input.repository.remove(PRODUCT_STORAGE_KEYS.temporaryTransaction);
    const synchronized = synchronizeDerivedSections(activeParsed.envelope, input.now);
    if (!synchronized.changed || requestedMode === 'shadow')
      return activation(input, {
        envelope: requestedMode === 'shadow' ? null : activeParsed.envelope,
        mode: requestedMode,
        safe: requestedMode !== 'shadow',
        status: 'ready',
      });
    const written = writeEnvelopeTransactionally(input.repository, synchronized.envelope, {
      expectedRevision: activeParsed.envelope.revision,
      now: input.now,
    });
    if (written.status === 'success')
      return activation(input, {
        envelope: written.envelope,
        mode: requestedMode,
        safe: true,
        status: 'ready',
        warnings: ['journey-memory-rebuilt'],
      });
    return activation(input, {
      envelope: synchronized.envelope,
      mode: requestedMode,
      safe: true,
      status: 'ready',
      warnings: ['derived-section-refresh-deferred'],
    });
  }

  const recovery = recoverProductStorage({
    activeRaw: activeRead.value,
    backupRaw: backupRead.value,
    now: input.now,
    temporaryRaw: temporaryRead.value,
  });
  if (recovery.envelope) {
    const synchronized = synchronizeDerivedSections(recovery.envelope, input.now).envelope;
    if (requestedMode === 'shadow')
      return activation(input, {
        envelope: null,
        mode: 'shadow',
        recovered: true,
        safe: false,
        status: 'recovered',
        usedBackup: recovery.report.strategy === 'restore-backup',
        warnings: recovery.report.warnings,
      });
    const promoted = writeRecoveredEnvelope(input.repository, synchronized, input.now);
    if (promoted.status !== 'success')
      return fallback(input, recovery.report.errors, [
        ...recovery.report.warnings,
        'recovery-promotion-failed',
      ]);
    const verified = verifiedActive(input.repository);
    if (!verified) return fallback(input, [], ['recovery-verification-failed']);
    input.diagnostics.emit({
      code: 'storage-recovered',
      recoveryStrategy: recovery.report.strategy,
      revision: verified.revision,
      schemaVersion: verified.schemaVersion,
      status: 'warning',
    });
    return activation(input, {
      envelope: verified,
      mode: requestedMode,
      recovered: true,
      safe: true,
      status: 'recovered',
      usedBackup: recovery.report.strategy === 'restore-backup',
      warnings: recovery.report.warnings,
    });
  }

  if (requestedMode === 'recovery-only')
    return fallback(input, recovery.report.errors, recovery.report.warnings);

  const legacyKeys = Object.values(LEGACY_STORAGE_KEYS).flat();
  const migration = migrateLegacyStorage({
    locale: input.locale,
    now: input.now,
    productVersion: input.productVersion,
    values: input.legacy.readValues(legacyKeys),
  });
  if (!migration.envelope || migration.status === 'failed')
    return fallback(
      input,
      migration.errors,
      migration.warnings.map((warning) => warning.code),
    );

  const synchronized = synchronizeDerivedSections(migration.envelope, input.now).envelope;
  const validation = validateProductStorageEnvelope(synchronized);
  if (!validation.valid) return fallback(input, validation.errors, ['migration-validation-failed']);
  if (requestedMode === 'shadow')
    return activation(input, {
      envelope: null,
      migrated: true,
      mode: 'shadow',
      safe: false,
      status: 'ready',
      warnings: migration.warnings.map((warning) => warning.code),
    });
  const write = activeRead.value
    ? writeRecoveredEnvelope(input.repository, synchronized, input.now)
    : writeEnvelopeTransactionally(input.repository, synchronized, { now: input.now });
  if (write.status !== 'success')
    return fallback(input, migration.errors, ['migration-write-failed']);
  const verified = verifiedActive(input.repository);
  if (!verified) return fallback(input, [], ['migration-round-trip-failed']);
  input.diagnostics.emit({
    code: 'migration-activated',
    migrationId: verified.migrationHistory.at(-1)?.id,
    revision: verified.revision,
    schemaVersion: verified.schemaVersion,
    status: 'info',
  });
  return activation(input, {
    envelope: verified,
    migrated: true,
    mode: requestedMode,
    safe: true,
    status: 'ready',
    warnings: migration.warnings.map((warning) => warning.code),
  });
}

export function bootstrapProductStorage(
  input: ProductStorageBootstrapInput,
): ProductStorageBootstrapResult {
  try {
    return bootstrapInternal(input);
  } catch (caught) {
    input.diagnostics.emit({ code: 'bootstrap-unhandled-isolated', status: 'error' });
    return activation(input, {
      envelope: null,
      mode: 'legacy-fallback',
      safe: false,
      status: 'failed',
      usedLegacyFallback: true,
      warnings: [caught instanceof Error ? caught.name : 'unknown-bootstrap-error'],
    });
  }
}
