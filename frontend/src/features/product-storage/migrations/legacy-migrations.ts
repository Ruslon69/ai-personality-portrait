import { createEmptyDraftPortrait } from '@entities/personality-profile';
import type { JourneyMemorySnapshot } from '@features/journey-memory';
import type { JourneyState } from '@features/journey';

import { LEGACY_STORAGE_KEYS, PRODUCT_STORAGE_KEYS } from '../constants';
import { canonicalParse, parseProductStorageEnvelope } from '../serialization';
import { createProductStorageEnvelope } from '../schemas';
import type {
  DraftStorageSection,
  LegacyStorageInput,
  ProductStorageData,
  ProductStorageMigrationResult,
  ProductStorageSection,
  ProductStorageValidationError,
  TarotReadingsStorageSection,
} from '../types';
import { isRecord } from '../utils';
import { salvageProductStorageData, validateProductStorageEnvelope } from '../validation';

function issue(
  section: ProductStorageSection,
  code: string,
  path: string,
  message: string,
): ProductStorageValidationError {
  return { code, message, path, recoverable: true, section, severity: 'warning' };
}

function first(values: LegacyStorageInput['values'], aliases: readonly string[]) {
  for (const key of aliases) {
    const value = values[key];
    if (value !== null && value !== undefined) return value;
  }
  return null;
}

function safeParse(
  raw: string | null,
  section: ProductStorageSection,
  warnings: ProductStorageValidationError[],
) {
  if (!raw) return null;
  const parsed = canonicalParse(raw);
  if (parsed.status === 'syntax-error') {
    warnings.push(
      issue(
        section,
        'legacy-syntax-error',
        `legacy.${section}`,
        'Legacy JSON is corrupted and was skipped.',
      ),
    );
    return null;
  }
  return parsed.value;
}

export function migrateLegacyJourney(value: unknown) {
  if (isRecord(value) && value.schemaVersion === 'journey-storage-v1' && isRecord(value.data))
    return value as unknown as NonNullable<ProductStorageData['journey']>;
  if (!isRecord(value) || !Array.isArray(value.readings) || !isRecord(value.dailyCards))
    return null;
  return {
    data: {
      dailyCards: value.dailyCards,
      identity: typeof value.identity === 'string' ? value.identity : 'journey-preview',
      readings: value.readings,
    } as JourneyState,
    schemaVersion: 'journey-storage-v1' as const,
  };
}

export function migrateLegacyTarotReadings(value: unknown): TarotReadingsStorageSection | null {
  if (isRecord(value) && value.schemaVersion === 'tarot-storage-v1' && Array.isArray(value.data))
    return value as unknown as TarotReadingsStorageSection;
  if (!isRecord(value) || !Array.isArray(value.readings)) return null;
  const records = value.readings.flatMap((item) => {
    if (!isRecord(item) || !isRecord(item.reading) || typeof item.reading.id !== 'string')
      return [];
    return [
      {
        bookmarked: item.favorite === true,
        reading: item.reading,
        savedAt: typeof item.savedAt === 'string' ? item.savedAt : item.reading.createdAt,
      },
    ];
  });
  return records.length > 0
    ? {
        data: records as unknown as TarotReadingsStorageSection['data'],
        schemaVersion: 'tarot-storage-v1',
      }
    : null;
}

export function migrateLegacyDraft(value: unknown): DraftStorageSection | null {
  if (isRecord(value) && value.schemaVersion === 'draft-storage-v1' && isRecord(value.data))
    return value as unknown as DraftStorageSection;
  if (!isRecord(value)) return null;
  const draft = isRecord(value.draft) ? value.draft : value;
  if (!isRecord(draft.answers) || !Array.isArray(draft.interests)) return null;
  const profiles = Array.isArray(value.profiles) ? value.profiles : [];
  const currentProfileId =
    isRecord(value.currentProfile) && typeof value.currentProfile.id === 'string'
      ? value.currentProfile.id
      : null;
  return {
    data: {
      currentProfileId,
      draft: { ...createEmptyDraftPortrait(), ...draft } as DraftStorageSection['data']['draft'],
      profiles: profiles as DraftStorageSection['data']['profiles'],
    },
    schemaVersion: 'draft-storage-v1',
  };
}

function migrateTarotSession(value: unknown) {
  if (!isRecord(value) || typeof value.seed !== 'string' || typeof value.spreadId !== 'string')
    return null;
  return {
    data: value as unknown as ProductStorageData['tarotSession'] extends { data: infer T }
      ? T
      : never,
    schemaVersion: 'tarot-session-storage-v1' as const,
  };
}

function migrateJourneyMemory(snapshot: JourneyMemorySnapshot | undefined) {
  return snapshot ? { data: snapshot, schemaVersion: 'journey-memory-v1' as const } : undefined;
}

export function migrateLegacyStorage(input: LegacyStorageInput): ProductStorageMigrationResult {
  const activeRaw = input.values[PRODUCT_STORAGE_KEYS.activeEnvelope];
  if (activeRaw) {
    const parsed = parseProductStorageEnvelope(activeRaw);
    if (parsed.status === 'success')
      return {
        envelope: parsed.envelope,
        errors: [],
        sourceVersion: 'product-storage-v2',
        status: 'ready',
        warnings: parsed.warnings,
      };
    if (parsed.status === 'unsupported-version')
      return {
        envelope: null,
        errors: [],
        sourceVersion: parsed.foundVersion,
        status: 'unsupported-version',
        warnings: [],
      };
  }

  const warnings: ProductStorageValidationError[] = [];
  const journeyValue = safeParse(
    first(input.values, LEGACY_STORAGE_KEYS.journey),
    'journey',
    warnings,
  );
  const draftValue = safeParse(
    first(input.values, LEGACY_STORAGE_KEYS.draftPortrait),
    'draftPortrait',
    warnings,
  );
  const tarotValue = safeParse(
    first(input.values, LEGACY_STORAGE_KEYS.tarotState),
    'tarotSession',
    warnings,
  );
  const journey = migrateLegacyJourney(journeyValue);
  const tarotReadings = migrateLegacyTarotReadings(journeyValue);
  const draftPortrait = migrateLegacyDraft(draftValue);
  const tarotSession = migrateTarotSession(tarotValue);
  const theme = first(input.values, LEGACY_STORAGE_KEYS.theme);
  const localeRaw = first(input.values, LEGACY_STORAGE_KEYS.locale);
  const deckTheme = first(input.values, LEGACY_STORAGE_KEYS.tarotDeckTheme);
  const birthDate = first(input.values, LEGACY_STORAGE_KEYS.numerologyBirthDate) ?? '';
  const locale =
    localeRaw === 'en' || localeRaw === 'ru' || localeRaw === 'uk' ? localeRaw : input.locale;
  const validDeckTheme =
    deckTheme === 'cosmic-minimal' ||
    deckTheme === 'deep-water' ||
    deckTheme === 'midnight-geometry' ||
    deckTheme === 'solar-lines'
      ? deckTheme
      : undefined;
  const preferences: NonNullable<ProductStorageData['preferences']> = {
    data: {
      ...(validDeckTheme ? { deckTheme: validDeckTheme } : {}),
      locale,
      ...(theme === 'dark' || theme === 'light' || theme === 'system' ? { theme } : {}),
    },
    schemaVersion: 'preferences-storage-v1' as const,
  };
  const data: ProductStorageData = {
    preferences,
    ...(draftPortrait ? { draftPortrait } : {}),
    ...(tarotSession ? { tarotSession } : {}),
    ...(tarotReadings ? { tarotReadings } : {}),
    ...(birthDate
      ? {
          numerology: {
            data: { birthDate, profile: null },
            schemaVersion: 'numerology-storage-v1' as const,
          },
        }
      : {}),
    ...(journey ? { journey } : {}),
    ...(input.journeyMemorySnapshot
      ? { journeyMemory: migrateJourneyMemory(input.journeyMemorySnapshot) }
      : {}),
  };
  const migratedSections = Object.keys(data) as ProductStorageSection[];
  const salvaged = salvageProductStorageData(data);
  warnings.push(...salvaged.errors.map((item) => ({ ...item, severity: 'warning' as const })));
  const envelope = createProductStorageEnvelope({
    createdAt: input.now,
    data: salvaged.validData,
    engineVersions: input.journeyMemorySnapshot?.metadata.versions,
    locale,
    migrationHistory: [
      {
        completedAt: input.now,
        fromVersion: 'product-storage-v1',
        id: `migration:product-storage-v1:product-storage-v2:${input.now}`,
        sections: migratedSections,
        toVersion: 'product-storage-v2',
        warnings: warnings.map((item) => item.code),
      },
    ],
    productVersion: input.productVersion,
    recoveryMetadata: {
      isolatedSections: [],
      lastRecoveredAt: null,
      source: 'legacy',
      strategy: null,
    },
  });
  const validation = validateProductStorageEnvelope(envelope);
  const errors = validation.errors.filter((item) => item.severity === 'error');
  return {
    envelope: errors.length === 0 ? envelope : null,
    errors,
    sourceVersion: 'product-storage-v1',
    status: errors.length === 0 ? 'migrated' : 'failed',
    warnings: [...warnings, ...validation.errors.filter((item) => item.severity === 'warning')],
  };
}

export class LocalProductStorageMigrator {
  migrate(input: LegacyStorageInput) {
    return migrateLegacyStorage(input);
  }
}
