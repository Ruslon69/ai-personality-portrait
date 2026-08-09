import type { DraftPortrait, PersonalityProfile } from '@entities/personality-profile';
import type { JourneyMemorySnapshot } from '@features/journey-memory';
import type { JourneyState } from '@features/journey';
import type { AdvancedNumerologyProfile, NumerologyProfile } from '@features/numerology';
import type {
  TarotCardSelection,
  TarotDeckTheme,
  TarotPsychologyAnswer,
  TarotReading,
  TarotSelectionMode,
} from '@features/tarot';
import type { Locale } from '@shared/i18n';

export type ProductStorageJsonPrimitive = boolean | null | number | string;
export type ProductStorageJsonValue =
  | ProductStorageJsonPrimitive
  | ProductStorageJsonValue[]
  | { [key: string]: ProductStorageJsonValue };

export type ProductStorageSchemaVersion = 'product-storage-v1' | 'product-storage-v2';
export type ProductStorageSection =
  | 'completionState'
  | 'draftPortrait'
  | 'envelope'
  | 'journey'
  | 'journeyMemory'
  | 'numerology'
  | 'preferences'
  | 'tarotReadings'
  | 'tarotSession';

export type PreferencesStorageSection = {
  data: { deckTheme?: TarotDeckTheme; locale?: Locale; theme?: 'dark' | 'light' | 'system' };
  schemaVersion: 'preferences-storage-v1';
};

export type DraftStorageSection = {
  data: {
    currentProfileId: string | null;
    draft: DraftPortrait;
    profiles: readonly PersonalityProfile[];
  };
  schemaVersion: 'draft-storage-v1';
};

export type TarotSessionStorageSection = {
  data: {
    answers: readonly TarotPsychologyAnswer[];
    birthDate: string;
    deckTheme: TarotDeckTheme;
    reading: TarotReading | null;
    reshuffled: boolean;
    seed: string;
    selections: readonly TarotCardSelection[];
    selectionMode: TarotSelectionMode;
    spreadId: string;
  };
  schemaVersion: 'tarot-session-storage-v1';
};

export type TarotReadingsStorageSection = {
  data: readonly { bookmarked: boolean; reading: TarotReading; savedAt: string }[];
  schemaVersion: 'tarot-storage-v1';
};

export type NumerologyStorageSection = {
  data: {
    advancedProfile?: AdvancedNumerologyProfile | null;
    birthDate: string;
    profile: NumerologyProfile | null;
  };
  schemaVersion: 'numerology-storage-v1';
};

export type JourneyStorageSection = {
  data: JourneyState;
  schemaVersion: 'journey-storage-v1';
};

export type JourneyMemoryStorageSection = {
  data: JourneyMemorySnapshot;
  schemaVersion: 'journey-memory-v1';
};

export type CompletionStateStorageSection = {
  data: { completedStages: readonly string[] };
  schemaVersion: 'completion-storage-v1';
};

export type ProductStorageData = {
  completionState?: CompletionStateStorageSection;
  draftPortrait?: DraftStorageSection;
  journey?: JourneyStorageSection;
  journeyMemory?: JourneyMemoryStorageSection;
  numerology?: NumerologyStorageSection;
  preferences?: PreferencesStorageSection;
  tarotReadings?: TarotReadingsStorageSection;
  tarotSession?: TarotSessionStorageSection;
};

export type MigrationHistoryEntry = {
  completedAt: string;
  fromVersion: string;
  id: string;
  sections: readonly ProductStorageSection[];
  toVersion: string;
  warnings: readonly string[];
};

export type RecoveryStrategy =
  'reset-all' | 'reset-single-section' | 'restore-backup' | 'salvage-valid-sections' | 'use-active';

export type ProductStorageRecoveryMetadata = {
  isolatedSections: readonly ProductStorageSection[];
  lastRecoveredAt: string | null;
  source: 'active' | 'backup' | 'legacy' | 'new' | 'temporary';
  strategy: RecoveryStrategy | null;
};

export type ProductStorageEnvelope = {
  checksum: string;
  createdAt: string;
  data: ProductStorageData;
  engineVersions: Readonly<Record<string, string>>;
  locale: Locale;
  migrationHistory: readonly MigrationHistoryEntry[];
  productVersion: string;
  recoveryMetadata: ProductStorageRecoveryMetadata;
  revision: number;
  schemaVersion: 'product-storage-v2';
  updatedAt: string;
};

export type ProductStorageValidationSeverity = 'error' | 'warning';
export type ProductStorageValidationError = {
  code: string;
  message: string;
  path: string;
  recoverable: boolean;
  section: ProductStorageSection;
  severity: ProductStorageValidationSeverity;
};

export type ProductStorageParseResult =
  | {
      envelope: ProductStorageEnvelope;
      status: 'success';
      warnings: readonly ProductStorageValidationError[];
    }
  | { errors: readonly ProductStorageValidationError[]; status: 'validation-error' }
  | { message: string; status: 'syntax-error' }
  | { foundVersion: string; status: 'unsupported-version' }
  | { actual: string; expected: string; status: 'checksum-error' };

export type StorageCapability =
  'corrupted' | 'persistent' | 'quota-limited' | 'recovered' | 'session-only' | 'unavailable';

export type StorageOperationResult<T> =
  | { capability: StorageCapability; ok: true; value: T }
  | { capability: StorageCapability; error: string; ok: false };

export interface ProductStorageReader {
  read(key: string): StorageOperationResult<string | null>;
}

export interface ProductStorageWriter {
  remove(key: string): StorageOperationResult<null>;
  write(key: string, value: string): StorageOperationResult<null>;
}

export interface ProductStorageRepository extends ProductStorageReader, ProductStorageWriter {
  capability(): StorageCapability;
}

export interface ProductStorageMigrator {
  migrate(input: LegacyStorageInput): ProductStorageMigrationResult;
}

export interface ProductStorageRecovery {
  recover(input: ProductStorageRecoveryInput): ProductStorageRecoveryResult;
}

export type LegacyStorageInput = {
  journeyMemorySnapshot?: JourneyMemorySnapshot;
  locale: Locale;
  now: string;
  productVersion: string;
  values: Readonly<Record<string, string | null | undefined>>;
};

export type ProductStorageMigrationResult = {
  envelope: ProductStorageEnvelope | null;
  errors: readonly ProductStorageValidationError[];
  sourceVersion: string;
  status: 'failed' | 'migrated' | 'ready' | 'unsupported-version';
  warnings: readonly ProductStorageValidationError[];
};

export type ProductStorageRecoveryInput = {
  activeRaw: string | null;
  backupRaw: string | null;
  now: string;
  temporaryRaw: string | null;
};

export type ProductStorageRecoveryReport = {
  errors: readonly ProductStorageValidationError[];
  isolatedSections: readonly ProductStorageSection[];
  strategy: RecoveryStrategy;
  warnings: readonly string[];
};

export type ProductStorageRecoveryResult = {
  capability: StorageCapability;
  envelope: ProductStorageEnvelope | null;
  report: ProductStorageRecoveryReport;
};

export type TransactionWriteResult =
  | { capability: StorageCapability; envelope: ProductStorageEnvelope; status: 'success' }
  | {
      attemptedEnvelope: ProductStorageEnvelope;
      latestEnvelope: ProductStorageEnvelope;
      status: 'conflict';
    }
  | { capability: StorageCapability; message: string; status: 'failure' };

export type ProductStorageExportScope = 'full' | 'journey' | 'numerology' | 'tarot-readings';
export type ProductStorageExportPackage = {
  checksum: string;
  data: ProductStorageData;
  engineVersions: Readonly<Record<string, string>>;
  exportVersion: 'product-export-v1';
  exportedAt: string;
  locale: Locale;
  scope: ProductStorageExportScope;
};

export type ProductStorageImportMode = 'merge' | 'preview' | 'replace';
export type ProductStorageImportConflict = {
  id: string;
  resolution: 'kept-current' | 'merged-bookmark' | 'requires-review';
  section: ProductStorageSection;
};

export type ProductStorageImportResult = {
  conflicts: readonly ProductStorageImportConflict[];
  envelope: ProductStorageEnvelope | null;
  errors: readonly ProductStorageValidationError[];
  importedSections: readonly ProductStorageSection[];
  mode: ProductStorageImportMode;
  status: 'invalid' | 'preview' | 'ready';
};

export type DeletionTarget =
  'all-personal-data' | 'draft-portrait' | 'journey' | 'numerology' | 'tarot-readings';
export type ProductStorageDeletionPlan = {
  backupBehavior: 'preserve-last-valid-until-write' | 'replace-after-successful-write';
  dependentReferences: readonly string[];
  orphanHandling: readonly string[];
  revisionChange: 1;
  sectionsAffected: readonly ProductStorageSection[];
  target: DeletionTarget;
};

export type ExternalStorageChangeEvent = {
  envelope: ProductStorageEnvelope;
  previousRevision: number;
  revision: number;
  type: 'external-envelope-change';
};

export type ProductStorageActivationMode =
  'dual-write' | 'envelope-primary' | 'legacy-fallback' | 'recovery-only' | 'shadow';

export type ProductStorageActivationStatus =
  'disabled' | 'failed' | 'fallback' | 'ready' | 'recovered';

export type ProductStorageSectionActivationStatus =
  | 'fallback'
  | 'invalid'
  | 'legacy-preserved'
  | 'migrated'
  | 'missing'
  | 'primary'
  | 'recovered'
  | 'session-only'
  | 'volatile';

export type ProductStorageActivationResult = {
  activeRevision: number | null;
  capability: StorageCapability;
  errors: readonly ProductStorageValidationError[];
  legacyKeysPreserved: true;
  migrated: boolean;
  mode: ProductStorageActivationMode;
  nextRecommendedAction:
    | 'continue-envelope'
    | 'continue-legacy'
    | 'inspect-conflict'
    | 'recover-storage'
    | 'retry-next-launch';
  recovered: boolean;
  safeToUseEnvelope: boolean;
  sectionStatuses: Readonly<
    Partial<Record<ProductStorageSection, ProductStorageSectionActivationStatus>>
  >;
  status: ProductStorageActivationStatus;
  usedBackup: boolean;
  usedLegacyFallback: boolean;
  warnings: readonly string[];
};

export type ProductStorageFeatureFlag = {
  enabled: boolean;
  name: 'productStorageV2';
  source: 'default-development' | 'default-production' | 'environment';
};

export type ProductStorageDiagnosticEvent = {
  code: string;
  migrationId?: string;
  recoveryStrategy?: RecoveryStrategy;
  revision?: number;
  schemaVersion?: string;
  section?: ProductStorageSection;
  status: 'error' | 'info' | 'warning';
};

export interface ProductStorageDiagnosticSink {
  emit(event: ProductStorageDiagnosticEvent): void;
}

export type ProductStorageLegacyWriteResult = {
  capability: StorageCapability;
  error?: string;
  ok: boolean;
};

export interface ProductStorageLegacyBridge {
  readValues(keys: readonly string[]): Readonly<Record<string, string | null>>;
  writeJourney(state: JourneyState): ProductStorageLegacyWriteResult;
  writeNumerologyBirthDate(value: string): ProductStorageLegacyWriteResult;
}

export type ProductStorageSectionWriteStatus =
  'conflict' | 'envelope-only' | 'failed' | 'legacy-only' | 'success';

export type ProductStorageSectionWriteResult = {
  envelopeWritten: boolean;
  errors: readonly string[];
  legacyWritten: boolean;
  revision: number | null;
  status: ProductStorageSectionWriteStatus;
  warnings: readonly string[];
};

export type ProductStorageCleanupPlan = {
  blockers: readonly string[];
  eligible: boolean;
  keys: readonly string[];
  minimumSuccessfulBootstraps: number;
  prerequisites: readonly string[];
  requiresUserConfirmation: true;
};

export type ProductStorageAdapter<TState, TSection> = {
  fromEnvelope(section: TSection | undefined): TState | null;
  legacyFallback(raw: string | null): TState | null;
  mergeStrategy(current: TState, incoming: TState): TState;
  ownership: 'envelope-primary' | 'legacy-preserved' | 'session-only' | 'volatile';
  section: ProductStorageSection;
  toEnvelopeSection(state: TState): TSection | null;
  validation(state: TState): readonly ProductStorageValidationError[];
};

export type ProductStorageExternalChangeListener = (event: ExternalStorageChangeEvent) => void;

export interface ProductStorageEventTarget {
  addEventListener(
    type: 'storage',
    listener: (event: { key: string | null; newValue: string | null }) => void,
  ): void;
  removeEventListener(
    type: 'storage',
    listener: (event: { key: string | null; newValue: string | null }) => void,
  ): void;
}
