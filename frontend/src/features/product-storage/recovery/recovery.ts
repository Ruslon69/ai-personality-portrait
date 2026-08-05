import { canonicalParse, parseProductStorageEnvelope } from '../serialization';
import { createProductStorageEnvelope } from '../schemas';
import type {
  ProductStorageEnvelope,
  ProductStorageRecoveryInput,
  ProductStorageRecoveryResult,
  ProductStorageSection,
  ProductStorageValidationError,
} from '../types';
import { isRecord } from '../utils';
import { salvageProductStorageData } from '../validation';

function recovered(
  envelope: ProductStorageEnvelope,
  input: ProductStorageRecoveryInput,
  source: 'active' | 'backup' | 'temporary',
  strategy: ProductStorageRecoveryResult['report']['strategy'],
): ProductStorageRecoveryResult {
  const next = createProductStorageEnvelope({
    createdAt: envelope.createdAt,
    data: envelope.data,
    engineVersions: envelope.engineVersions,
    locale: envelope.locale,
    migrationHistory: envelope.migrationHistory,
    productVersion: envelope.productVersion,
    recoveryMetadata: {
      isolatedSections: [],
      lastRecoveredAt:
        strategy === 'use-active' ? envelope.recoveryMetadata.lastRecoveredAt : input.now,
      source,
      strategy,
    },
    revision: envelope.revision,
    updatedAt: strategy === 'use-active' ? envelope.updatedAt : input.now,
  });
  return {
    capability: strategy === 'use-active' && source === 'active' ? 'persistent' : 'recovered',
    envelope: next,
    report: {
      errors: [],
      isolatedSections: [],
      strategy,
      warnings: source === 'temporary' ? ['A valid interrupted transaction was recovered.'] : [],
    },
  };
}

function salvage(
  raw: string,
  input: ProductStorageRecoveryInput,
): ProductStorageRecoveryResult | null {
  const parsed = canonicalParse(raw);
  if (parsed.status !== 'success' || !isRecord(parsed.value) || !isRecord(parsed.value.data))
    return null;
  const result = salvageProductStorageData(parsed.value.data);
  if (Object.keys(result.validData).length === 0) return null;
  const isolatedSections = result.errors
    .map((item) => item.section)
    .filter((section): section is ProductStorageSection => section !== 'envelope');
  const engineVersions = isRecord(parsed.value.engineVersions)
    ? Object.fromEntries(
        Object.entries(parsed.value.engineVersions).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0,
        ),
      )
    : {};
  const migrationHistory = Array.isArray(parsed.value.migrationHistory)
    ? parsed.value.migrationHistory.filter(
        (item) =>
          isRecord(item) &&
          typeof item.id === 'string' &&
          typeof item.completedAt === 'string' &&
          typeof item.fromVersion === 'string' &&
          typeof item.toVersion === 'string' &&
          Array.isArray(item.sections) &&
          Array.isArray(item.warnings),
      )
    : [];
  const envelope = createProductStorageEnvelope({
    createdAt: typeof parsed.value.createdAt === 'string' ? parsed.value.createdAt : input.now,
    data: result.validData,
    engineVersions,
    locale:
      parsed.value.locale === 'en' || parsed.value.locale === 'uk' ? parsed.value.locale : 'ru',
    migrationHistory: migrationHistory as never,
    productVersion:
      typeof parsed.value.productVersion === 'string' ? parsed.value.productVersion : 'unknown',
    recoveryMetadata: {
      isolatedSections,
      lastRecoveredAt: input.now,
      source: 'active',
      strategy: 'salvage-valid-sections',
    },
    revision: Number.isSafeInteger(parsed.value.revision) ? Number(parsed.value.revision) : 0,
    updatedAt: input.now,
  });
  return {
    capability: 'recovered',
    envelope,
    report: {
      errors: result.errors,
      isolatedSections,
      strategy: 'salvage-valid-sections',
      warnings: ['Invalid sections were isolated; valid independent sections were preserved.'],
    },
  };
}

export function recoverProductStorage(
  input: ProductStorageRecoveryInput,
): ProductStorageRecoveryResult {
  const active = input.activeRaw ? parseProductStorageEnvelope(input.activeRaw) : null;
  if (active?.status === 'success')
    return recovered(active.envelope, input, 'active', 'use-active');
  const backup = input.backupRaw ? parseProductStorageEnvelope(input.backupRaw) : null;
  if (backup?.status === 'success')
    return recovered(backup.envelope, input, 'backup', 'restore-backup');
  const temporary = input.temporaryRaw ? parseProductStorageEnvelope(input.temporaryRaw) : null;
  if (temporary?.status === 'success')
    return recovered(temporary.envelope, input, 'temporary', 'use-active');
  if (input.activeRaw) {
    const salvaged = salvage(input.activeRaw, input);
    if (salvaged) return salvaged;
  }
  return {
    capability: 'corrupted',
    envelope: null,
    report: {
      errors: [],
      isolatedSections: [],
      strategy: 'reset-all',
      warnings: ['No valid or salvageable local product data was found.'],
    },
  };
}

export function resetSingleProductStorageSection(
  envelope: ProductStorageEnvelope,
  section: Exclude<ProductStorageSection, 'envelope' | 'preferences'>,
  now: string,
  errors: readonly ProductStorageValidationError[] = [],
): ProductStorageRecoveryResult {
  const data = { ...envelope.data };
  delete data[section];
  const recoveredEnvelope = createProductStorageEnvelope({
    createdAt: envelope.createdAt,
    data,
    engineVersions: envelope.engineVersions,
    locale: envelope.locale,
    migrationHistory: envelope.migrationHistory,
    productVersion: envelope.productVersion,
    recoveryMetadata: {
      isolatedSections: [section],
      lastRecoveredAt: now,
      source: 'active',
      strategy: 'reset-single-section',
    },
    revision: envelope.revision,
    updatedAt: now,
  });
  return {
    capability: 'recovered',
    envelope: recoveredEnvelope,
    report: {
      errors,
      isolatedSections: [section],
      strategy: 'reset-single-section',
      warnings: [`Section ${section} was reset; independent sections were preserved.`],
    },
  };
}

export class LocalProductStorageRecovery {
  recover(input: ProductStorageRecoveryInput) {
    return recoverProductStorage(input);
  }
}
