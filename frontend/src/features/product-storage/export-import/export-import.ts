import { createProductStorageEnvelope } from '../schemas';
import {
  calculateChecksum,
  canonicalParse,
  canonicalSerialize,
  withExportChecksum,
} from '../serialization';
import type {
  ProductStorageData,
  ProductStorageEnvelope,
  ProductStorageExportPackage,
  ProductStorageExportScope,
  ProductStorageImportConflict,
  ProductStorageImportMode,
  ProductStorageImportResult,
  ProductStorageSection,
} from '../types';
import { isRecord } from '../utils';
import { salvageProductStorageData } from '../validation';

function selectData(
  data: ProductStorageData,
  scope: ProductStorageExportScope,
): ProductStorageData {
  if (scope === 'journey')
    return {
      ...(data.journey ? { journey: data.journey } : {}),
      ...(data.journeyMemory ? { journeyMemory: data.journeyMemory } : {}),
    };
  if (scope === 'tarot-readings')
    return data.tarotReadings ? { tarotReadings: data.tarotReadings } : {};
  if (scope === 'numerology') return data.numerology ? { numerology: data.numerology } : {};
  const exportable = { ...data };
  delete exportable.draftPortrait;
  delete exportable.tarotSession;
  return exportable;
}

export function buildProductStorageExport(
  envelope: ProductStorageEnvelope,
  options: { exportedAt: string; scope: ProductStorageExportScope },
): { json: string; metadata: { checksum: string; sections: readonly ProductStorageSection[] } } {
  const exportPackage = withExportChecksum({
    checksum: '',
    data: selectData(envelope.data, options.scope),
    engineVersions: envelope.engineVersions,
    exportedAt: options.exportedAt,
    exportVersion: 'product-export-v1',
    locale: envelope.locale,
    scope: options.scope,
  });
  const serialized = canonicalSerialize(exportPackage);
  if (serialized.status !== 'success') throw new Error(serialized.message);
  return {
    json: serialized.json,
    metadata: {
      checksum: exportPackage.checksum,
      sections: Object.keys(exportPackage.data) as ProductStorageSection[],
    },
  };
}

function parseExport(
  json: string,
):
  | { package: ProductStorageExportPackage; status: 'success' }
  | { message: string; status: 'error' } {
  const parsed = canonicalParse(json);
  if (parsed.status !== 'success') return { message: parsed.message, status: 'error' };
  if (
    !isRecord(parsed.value) ||
    parsed.value.exportVersion !== 'product-export-v1' ||
    !isRecord(parsed.value.data)
  )
    return { message: 'Unsupported or malformed export package.', status: 'error' };
  const exportPackage = parsed.value as ProductStorageExportPackage;
  if (calculateChecksum(exportPackage) !== exportPackage.checksum)
    return { message: 'Export checksum mismatch.', status: 'error' };
  const salvaged = salvageProductStorageData(exportPackage.data);
  if (
    salvaged.errors.length > 0 ||
    Object.keys(salvaged.validData).length !== Object.keys(exportPackage.data).length
  )
    return { message: 'Export contains invalid sections.', status: 'error' };
  return { package: exportPackage, status: 'success' };
}

function mergeReadings(
  current: ProductStorageData['tarotReadings'],
  incoming: ProductStorageData['tarotReadings'],
  conflicts: ProductStorageImportConflict[],
) {
  if (!current) return incoming;
  if (!incoming) return current;
  const records = new Map(current.data.map((record) => [record.reading.id, record]));
  incoming.data.forEach((record) => {
    const existing = records.get(record.reading.id);
    if (!existing) records.set(record.reading.id, record);
    else {
      records.set(record.reading.id, {
        ...existing,
        bookmarked: existing.bookmarked || record.bookmarked,
      });
      conflicts.push({
        id: record.reading.id,
        resolution: existing.bookmarked === record.bookmarked ? 'kept-current' : 'merged-bookmark',
        section: 'tarotReadings',
      });
    }
  });
  return {
    data: [...records.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    schemaVersion: 'tarot-storage-v1' as const,
  };
}

function mergeJourney(
  current: ProductStorageData['journey'],
  incoming: ProductStorageData['journey'],
) {
  if (!current) return incoming;
  if (!incoming) return current;
  const records = new Map(current.data.readings.map((record) => [record.reading.id, record]));
  incoming.data.readings.forEach((record) => {
    const existing = records.get(record.reading.id);
    records.set(
      record.reading.id,
      existing ? { ...existing, favorite: existing.favorite || record.favorite } : record,
    );
  });
  return {
    data: {
      dailyCards: { ...incoming.data.dailyCards, ...current.data.dailyCards },
      identity: current.data.identity,
      readings: [...records.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    },
    schemaVersion: 'journey-storage-v1' as const,
  };
}

function mergeData(
  current: ProductStorageData,
  incoming: ProductStorageData,
  currentVersions: Readonly<Record<string, string>>,
  incomingVersions: Readonly<Record<string, string>>,
) {
  const conflicts: ProductStorageImportConflict[] = [];
  const data: ProductStorageData = {
    ...current,
    ...incoming,
    preferences: current.preferences
      ? {
          ...current.preferences,
          data: { ...incoming.preferences?.data, ...current.preferences.data },
        }
      : incoming.preferences,
    journey: mergeJourney(current.journey, incoming.journey),
    tarotReadings: mergeReadings(current.tarotReadings, incoming.tarotReadings, conflicts),
  };
  if (current.journeyMemory && incoming.journeyMemory) {
    data.journeyMemory = current.journeyMemory;
    conflicts.push({
      id: 'journey-memory-rebuild',
      resolution: 'requires-review',
      section: 'journeyMemory',
    });
  }
  const engineVersions: Record<string, string> = { ...currentVersions };
  Object.entries(incomingVersions).forEach(([key, value]) => {
    const existing = currentVersions[key];
    if (existing && existing !== value) {
      engineVersions[`lineage.import.${key}.${value}`] = value;
      conflicts.push({
        id: `engine:${key}:${value}`,
        resolution: 'requires-review',
        section: 'envelope',
      });
    } else engineVersions[key] = value;
  });
  return { conflicts, data, engineVersions };
}

export function parseProductStorageImport(
  json: string,
  current: ProductStorageEnvelope,
  options: { mode: ProductStorageImportMode; now: string; productVersion: string },
): ProductStorageImportResult {
  const parsed = parseExport(json);
  if (parsed.status === 'error')
    return {
      conflicts: [],
      envelope: null,
      errors: [
        {
          code: 'invalid-import',
          message: parsed.message,
          path: '$',
          recoverable: true,
          section: 'envelope',
          severity: 'error',
        },
      ],
      importedSections: [],
      mode: options.mode,
      status: 'invalid',
    };
  const importedSections = Object.keys(parsed.package.data) as ProductStorageSection[];
  if (options.mode === 'preview')
    return {
      conflicts: [],
      envelope: null,
      errors: [],
      importedSections,
      mode: options.mode,
      status: 'preview',
    };
  const merged =
    options.mode === 'merge'
      ? mergeData(
          current.data,
          parsed.package.data,
          current.engineVersions,
          parsed.package.engineVersions,
        )
      : {
          conflicts: [] as ProductStorageImportConflict[],
          data:
            parsed.package.scope === 'full'
              ? parsed.package.data
              : { ...current.data, ...parsed.package.data },
          engineVersions:
            parsed.package.scope === 'full'
              ? parsed.package.engineVersions
              : { ...current.engineVersions, ...parsed.package.engineVersions },
        };
  const envelope = createProductStorageEnvelope({
    createdAt: current.createdAt,
    data: merged.data,
    engineVersions: merged.engineVersions,
    locale: current.locale,
    migrationHistory: current.migrationHistory,
    productVersion: options.productVersion,
    recoveryMetadata: current.recoveryMetadata,
    revision: current.revision,
    updatedAt: options.now,
  });
  return {
    conflicts: merged.conflicts,
    envelope,
    errors: [],
    importedSections,
    mode: options.mode,
    status: 'ready',
  };
}
