import { bootstrapProductStorage, type ProductStorageBootstrapInput } from '../activation';
import { journeySectionsFromState, reconcileJourneyStateAfterConflict } from '../compatibility';
import {
  createProductStorageDeletionPlan,
  applyProductStorageDeletionPlan,
  removeTarotReadingFromJourney,
} from '../model';
import { recoverProductStorage } from '../recovery';
import { writeEnvelopeTransactionally, writeRecoveredEnvelope } from '../repositories';
import { parseExternalStorageChange } from '../runtime/external-change';
import { cloneJson } from '../utils';
import { buildProductStorageExport, parseProductStorageImport } from '../export-import';
import { PRODUCT_STORAGE_KEYS } from '../constants';
import type {
  DeletionTarget,
  ProductStorageActivationResult,
  ProductStorageData,
  ProductStorageEnvelope,
  ProductStorageExportScope,
  ProductStorageExternalChangeListener,
  ProductStorageImportMode,
  ProductStorageImportResult,
  ProductStorageSection,
  ProductStorageSectionWriteResult,
  ProductStorageEventTarget,
  TransactionWriteResult,
} from '../types';
import { validateProductStorageEnvelope, validateProductStorageSection } from '../validation';

type TransactionWriter = typeof writeEnvelopeTransactionally;

export type ProductStorageServiceOptions = Omit<ProductStorageBootstrapInput, 'now'> & {
  eventTarget?: ProductStorageEventTarget | null;
  now: string | (() => string);
  transactionWriter?: TransactionWriter;
};

function result(
  status: ProductStorageSectionWriteResult['status'],
  options: Partial<Omit<ProductStorageSectionWriteResult, 'status'>> = {},
): ProductStorageSectionWriteResult {
  return {
    envelopeWritten: options.envelopeWritten ?? false,
    errors: options.errors ?? [],
    legacyWritten: options.legacyWritten ?? false,
    revision: options.revision ?? null,
    status,
    warnings: options.warnings ?? [],
  };
}

export class ProductStorageService {
  private activationResult: ProductStorageActivationResult | null = null;
  private disposed = false;
  private eventAttached = false;
  private readonly externalListeners = new Set<ProductStorageExternalChangeListener>();
  private latest: ProductStorageEnvelope | null = null;
  private readonly transactionWriter: TransactionWriter;

  private readonly storageListener = (event: { key: string | null; newValue: string | null }) => {
    if (!this.latest) return;
    const change = parseExternalStorageChange(event, this.latest.revision);
    if (!change || change.revision <= this.latest.revision) return;
    this.latest = change.envelope;
    this.options.diagnostics.emit({
      code: 'external-revision-observed',
      revision: change.revision,
      schemaVersion: change.envelope.schemaVersion,
      status: 'info',
    });
    this.externalListeners.forEach((listener) => listener(change));
  };

  constructor(private readonly options: ProductStorageServiceOptions) {
    this.transactionWriter = options.transactionWriter ?? writeEnvelopeTransactionally;
  }

  bootstrap() {
    if (this.disposed) return this.safeFailureActivation('service-disposed');
    const boot = bootstrapProductStorage({
      ...this.options,
      now: this.now(),
    });
    this.activationResult = boot.activation;
    this.latest = boot.envelope;
    if (boot.activation.safeToUseEnvelope) this.attachEventListener();
    return boot.activation;
  }

  getActivationResult() {
    return this.activationResult;
  }

  getCapability() {
    return this.options.repository.capability();
  }

  getSnapshot() {
    return this.latest ? cloneJson(this.latest) : null;
  }

  getSection<K extends keyof ProductStorageData>(section: K): ProductStorageData[K] | null {
    const value = this.latest?.data[section];
    return value ? cloneJson(value) : null;
  }

  readLegacyValues(keys: readonly string[]) {
    return this.options.legacy.readValues(keys);
  }

  updateSection<K extends keyof ProductStorageData>(
    section: K,
    value: NonNullable<ProductStorageData[K]>,
  ) {
    return this.updateSections({ [section]: value } as Pick<ProductStorageData, K>);
  }

  updateSections(patches: Partial<ProductStorageData>): ProductStorageSectionWriteResult {
    try {
      if (this.disposed) return result('failed', { errors: ['service-disposed'] });
      if (!this.activationResult) this.bootstrap();
      if (!this.activationResult?.safeToUseEnvelope || !this.latest)
        return this.writeLegacyFallback(patches);
      if (patches.draftPortrait || patches.tarotSession)
        return result('failed', {
          errors: [
            patches.draftPortrait ? 'draft-portrait-volatile' : 'tarot-session-session-only',
          ],
        });
      const prepared = this.preparePatches(patches, this.latest);
      const invalid = Object.entries(prepared).flatMap(([section, value]) =>
        validateProductStorageSection(section as ProductStorageSection, value),
      );
      if (invalid.length > 0)
        return result('failed', { errors: invalid.map((item) => `${item.code}:${item.path}`) });
      const attempted = { ...this.latest, data: { ...this.latest.data, ...prepared } };
      const validation = validateProductStorageEnvelope(attempted);
      if (!validation.valid)
        return result('failed', {
          errors: validation.errors.map((item) => `${item.code}:${item.path}`),
        });
      const written = this.writeWithOneRetry(attempted, prepared);
      if (written.status !== 'success')
        return result(written.status === 'conflict' ? 'conflict' : 'failed', {
          errors: [written.status === 'failure' ? written.message : 'revision-conflict'],
          revision: this.latest?.revision ?? null,
        });
      this.latest = written.envelope;
      const legacy = this.writeLegacyAfterEnvelope(prepared);
      this.options.diagnostics.emit({
        code: legacy.errors.length > 0 ? 'envelope-write-legacy-failed' : 'dual-write-complete',
        revision: written.envelope.revision,
        schemaVersion: written.envelope.schemaVersion,
        status: legacy.errors.length > 0 ? 'warning' : 'info',
      });
      return result(legacy.errors.length > 0 ? 'envelope-only' : 'success', {
        envelopeWritten: true,
        errors: legacy.errors,
        legacyWritten: legacy.written,
        revision: written.envelope.revision,
      });
    } catch (caught) {
      return result('failed', {
        errors: [caught instanceof Error ? caught.name : 'unknown-write-error'],
      });
    }
  }

  deleteSection(target: DeletionTarget) {
    if (!this.latest) return result('failed', { errors: ['envelope-unavailable'] });
    const previousJourneyIdentity = this.latest.data.journey?.data.identity ?? 'journey-preview';
    const deleted = applyProductStorageDeletionPlan(
      this.latest,
      createProductStorageDeletionPlan(target),
      this.now(),
    );
    const write = this.transactionWriter(
      this.options.repository,
      { ...deleted, revision: this.latest.revision },
      {
        expectedRevision: this.latest.revision,
        now: this.now(),
      },
    );
    if (write.status !== 'success')
      return result(write.status === 'conflict' ? 'conflict' : 'failed', {
        errors: [write.status === 'failure' ? write.message : 'revision-conflict'],
      });
    this.latest = write.envelope;
    const legacyPatches: Partial<ProductStorageData> = { ...write.envelope.data };
    if ((target === 'journey' || target === 'all-personal-data') && !legacyPatches.journey) {
      legacyPatches.journey = {
        data: {
          dailyCards: {},
          identity: previousJourneyIdentity,
          readings: [],
        },
        schemaVersion: 'journey-storage-v1',
      };
    }
    if ((target === 'numerology' || target === 'all-personal-data') && !legacyPatches.numerology) {
      legacyPatches.numerology = {
        data: { birthDate: '', profile: null },
        schemaVersion: 'numerology-storage-v1',
      };
    }
    const legacy = this.writeLegacyAfterEnvelope(legacyPatches);
    return result(legacy.errors.length ? 'envelope-only' : 'success', {
      envelopeWritten: true,
      errors: legacy.errors,
      legacyWritten: legacy.written,
      revision: write.envelope.revision,
    });
  }

  deleteTarotReading(readingId: string) {
    const journey = this.latest?.data.journey;
    if (!journey) return result('failed', { errors: ['journey-unavailable'] });
    if (!journey.data.readings.some((record) => record.reading.id === readingId))
      return result('success', { revision: this.latest?.revision ?? null });
    return this.updateSection('journey', {
      ...journey,
      data: removeTarotReadingFromJourney(journey.data, readingId),
    });
  }

  createExport(scope: ProductStorageExportScope) {
    return this.latest
      ? buildProductStorageExport(this.latest, { exportedAt: this.now(), scope })
      : null;
  }

  previewImport(json: string) {
    return this.importData(json, 'preview');
  }

  applyImport(json: string, mode: Exclude<ProductStorageImportMode, 'preview'>) {
    const preview = this.importData(json, mode);
    if (preview.status !== 'ready' || !preview.envelope)
      return {
        importResult: preview,
        writeResult: result('failed', { errors: ['import-invalid'] }),
      };
    const write =
      mode === 'replace'
        ? this.replaceImportedEnvelope(preview.envelope)
        : this.updateSections(preview.envelope.data);
    return { importResult: preview, writeResult: write };
  }

  recover() {
    const active = this.options.repository.read(PRODUCT_STORAGE_KEYS.activeEnvelope);
    const backup = this.options.repository.read(PRODUCT_STORAGE_KEYS.backupEnvelope);
    const temporary = this.options.repository.read(PRODUCT_STORAGE_KEYS.temporaryTransaction);
    if (!active.ok || !backup.ok || !temporary.ok)
      return result('failed', { errors: ['recovery-read-failed'] });
    const recovery = recoverProductStorage({
      activeRaw: active.value,
      backupRaw: backup.value,
      now: this.now(),
      temporaryRaw: temporary.value,
    });
    if (!recovery.envelope) return result('failed', { errors: ['recovery-unavailable'] });
    const write = writeRecoveredEnvelope(this.options.repository, recovery.envelope, this.now());
    if (write.status !== 'success')
      return result('failed', {
        errors: [write.status === 'failure' ? write.message : 'recovery-conflict'],
      });
    this.latest = write.envelope;
    return result('success', { envelopeWritten: true, revision: write.envelope.revision });
  }

  subscribeExternalChanges(listener: ProductStorageExternalChangeListener) {
    if (this.disposed) return () => undefined;
    this.externalListeners.add(listener);
    this.attachEventListener();
    return () => this.externalListeners.delete(listener);
  }

  dispose() {
    if (this.eventAttached && this.options.eventTarget)
      this.options.eventTarget.removeEventListener('storage', this.storageListener);
    this.eventAttached = false;
    this.externalListeners.clear();
    this.disposed = true;
  }

  private importData(json: string, mode: ProductStorageImportMode): ProductStorageImportResult {
    if (!this.latest)
      return {
        conflicts: [],
        envelope: null,
        errors: [
          {
            code: 'envelope-unavailable',
            message: 'Envelope is unavailable.',
            path: '$',
            recoverable: true,
            section: 'envelope',
            severity: 'error',
          },
        ],
        importedSections: [],
        mode,
        status: 'invalid',
      };
    return parseProductStorageImport(json, this.latest, {
      mode,
      now: this.now(),
      productVersion: this.options.productVersion,
    });
  }

  private now() {
    return typeof this.options.now === 'function' ? this.options.now() : this.options.now;
  }

  private attachEventListener() {
    if (!this.eventAttached && this.options.eventTarget) {
      this.options.eventTarget.addEventListener('storage', this.storageListener);
      this.eventAttached = true;
    }
  }

  private preparePatches(
    patches: Partial<ProductStorageData>,
    envelope: ProductStorageEnvelope,
  ): Partial<ProductStorageData> {
    if (!patches.journey) return patches;
    return {
      ...patches,
      ...journeySectionsFromState(patches.journey.data, envelope, this.now()),
    };
  }

  private writeWithOneRetry(
    attempted: ProductStorageEnvelope,
    patches: Partial<ProductStorageData>,
  ): TransactionWriteResult {
    if (!this.latest)
      return {
        capability: this.options.repository.capability(),
        message: 'Envelope unavailable.',
        status: 'failure',
      };
    const first = this.transactionWriter(this.options.repository, attempted, {
      expectedRevision: this.latest.revision,
      now: this.now(),
    });
    if (first.status !== 'conflict') return first;
    this.latest = first.latestEnvelope;
    const reconciledPatches =
      patches.journey && first.latestEnvelope.data.journey
        ? {
            ...patches,
            journey: {
              ...patches.journey,
              data: reconcileJourneyStateAfterConflict(
                first.latestEnvelope.data.journey.data,
                patches.journey.data,
                this.now(),
              ),
            },
          }
        : patches;
    const retryPatches = this.preparePatches(reconciledPatches, first.latestEnvelope);
    const retryAttempt = {
      ...first.latestEnvelope,
      data: { ...first.latestEnvelope.data, ...retryPatches },
    };
    return this.transactionWriter(this.options.repository, retryAttempt, {
      expectedRevision: first.latestEnvelope.revision,
      now: this.now(),
    });
  }

  private writeLegacyAfterEnvelope(patches: Partial<ProductStorageData>) {
    const errors: string[] = [];
    let written = false;
    if (patches.journey) {
      const legacy = this.options.legacy.writeJourney(patches.journey.data);
      written = written || legacy.ok;
      if (!legacy.ok) errors.push(legacy.error ?? 'legacy-journey-write-failed');
    }
    if (patches.numerology) {
      const legacy = this.options.legacy.writeNumerologyBirthDate(
        patches.numerology.data.birthDate,
      );
      written = written || legacy.ok;
      if (!legacy.ok) errors.push(legacy.error ?? 'legacy-numerology-write-failed');
    }
    return { errors, written };
  }

  private replaceImportedEnvelope(imported: ProductStorageEnvelope) {
    if (!this.latest) return result('failed', { errors: ['envelope-unavailable'] });
    const previousJourneyIdentity = this.latest.data.journey?.data.identity ?? 'journey-preview';
    const hadJourney = Boolean(this.latest.data.journey);
    const hadNumerology = Boolean(this.latest.data.numerology);
    const importedData = { ...imported.data };
    delete importedData.draftPortrait;
    delete importedData.tarotSession;
    const attempted = {
      ...imported,
      data: importedData,
      revision: this.latest.revision,
    };
    const validation = validateProductStorageEnvelope(attempted);
    if (!validation.valid)
      return result('failed', {
        errors: validation.errors.map((item) => `${item.code}:${item.path}`),
      });
    const written = this.writeReplacementWithOneRetry(attempted);
    if (written.status !== 'success')
      return result(written.status === 'conflict' ? 'conflict' : 'failed', {
        errors: [written.status === 'failure' ? written.message : 'revision-conflict'],
      });
    this.latest = written.envelope;
    const legacyPatches: Partial<ProductStorageData> = { ...written.envelope.data };
    if (hadJourney && !legacyPatches.journey)
      legacyPatches.journey = {
        data: { dailyCards: {}, identity: previousJourneyIdentity, readings: [] },
        schemaVersion: 'journey-storage-v1',
      };
    if (hadNumerology && !legacyPatches.numerology)
      legacyPatches.numerology = {
        data: { birthDate: '', profile: null },
        schemaVersion: 'numerology-storage-v1',
      };
    const legacy = this.writeLegacyAfterEnvelope(legacyPatches);
    return result(legacy.errors.length ? 'envelope-only' : 'success', {
      envelopeWritten: true,
      errors: legacy.errors,
      legacyWritten: legacy.written,
      revision: written.envelope.revision,
    });
  }

  private writeReplacementWithOneRetry(attempted: ProductStorageEnvelope): TransactionWriteResult {
    if (!this.latest)
      return {
        capability: this.options.repository.capability(),
        message: 'Envelope unavailable.',
        status: 'failure',
      };
    const first = this.transactionWriter(this.options.repository, attempted, {
      expectedRevision: this.latest.revision,
      now: this.now(),
    });
    if (first.status !== 'conflict') return first;
    this.latest = first.latestEnvelope;
    return this.transactionWriter(
      this.options.repository,
      { ...attempted, revision: first.latestEnvelope.revision },
      {
        expectedRevision: first.latestEnvelope.revision,
        now: this.now(),
      },
    );
  }

  private writeLegacyFallback(patches: Partial<ProductStorageData>) {
    const legacy = this.writeLegacyAfterEnvelope(patches);
    return result(legacy.errors.length ? 'failed' : 'legacy-only', {
      errors: legacy.errors,
      legacyWritten: legacy.written,
    });
  }

  private safeFailureActivation(code: string): ProductStorageActivationResult {
    return {
      activeRevision: this.latest?.revision ?? null,
      capability: this.options.repository.capability(),
      errors: [],
      legacyKeysPreserved: true,
      migrated: false,
      mode: 'legacy-fallback',
      nextRecommendedAction: 'continue-legacy',
      recovered: false,
      safeToUseEnvelope: false,
      sectionStatuses: {},
      status: 'failed',
      usedBackup: false,
      usedLegacyFallback: true,
      warnings: [code],
    };
  }
}
