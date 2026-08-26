import {
  createTarotResultHeroPresentation,
  isRenderableTarotReading,
  tarotCardById,
  tarotSpreadById,
  type TarotReading,
} from '@features/tarot';

import type { JourneyReadingRecord, TarotHistorySnapshot } from '../types';

export const TAROT_HISTORY_LIMIT = 75;
export const TAROT_HISTORY_SCHEMA_VERSION = 'tarot-history-record-v1' as const;

export function createTarotHistorySnapshot(reading: TarotReading): TarotHistorySnapshot {
  const locale = reading.context.locale;
  const spread = tarotSpreadById.get(reading.spreadId);
  const presentation = createTarotResultHeroPresentation(reading);
  const motifs = [
    ...presentation.motifs,
    ...reading.selections.flatMap(
      (selection) => tarotCardById.get(selection.cardId)?.baseThemes[locale] ?? [],
    ),
  ]
    .filter((motif, index, values) => Boolean(motif) && values.indexOf(motif) === index)
    .slice(0, 3);
  return {
    createdAt: reading.createdAt,
    finalSynthesis: reading.summary,
    locale,
    motifs,
    readingId: reading.id,
    resultHeadline: presentation.headline,
    schemaVersion: TAROT_HISTORY_SCHEMA_VERSION,
    seed: reading.context.seed,
    selections: reading.selections.map((selection) => ({ ...selection })),
    spreadId: reading.spreadId,
    spreadTitle: spread?.title[locale] ?? reading.headline,
    ...(reading.context.topic ? { topic: reading.context.topic } : {}),
  };
}

export function historySnapshotForRecord(record: JourneyReadingRecord): TarotHistorySnapshot {
  const snapshot = record.snapshot;
  return snapshot?.schemaVersion === TAROT_HISTORY_SCHEMA_VERSION &&
    snapshot.readingId === record.reading.id &&
    snapshot.createdAt === record.reading.createdAt &&
    snapshot.spreadId === record.reading.spreadId &&
    snapshot.locale === record.reading.context.locale &&
    snapshot.seed === record.reading.context.seed &&
    snapshot.finalSynthesis === record.reading.summary &&
    typeof snapshot.spreadTitle === 'string' &&
    snapshot.spreadTitle.trim().length > 0 &&
    typeof snapshot.resultHeadline === 'string' &&
    snapshot.resultHeadline.trim().length > 0 &&
    Array.isArray(snapshot.motifs) &&
    snapshot.motifs.length <= 3 &&
    Array.isArray(snapshot.selections) &&
    JSON.stringify(snapshot.selections) === JSON.stringify(record.reading.selections)
    ? snapshot
    : createTarotHistorySnapshot(record.reading);
}

function safeHistoryLimit(limit: number) {
  return [25, 50, 75, 100].includes(limit) ? limit : TAROT_HISTORY_LIMIT;
}

export function normalizeTarotHistoryRecords(
  value: unknown,
  limit = TAROT_HISTORY_LIMIT,
): readonly JourneyReadingRecord[] {
  if (!Array.isArray(value)) return [];
  const records = value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const record = candidate as Partial<JourneyReadingRecord>;
    if (!isRenderableTarotReading(record.reading)) return [];
    const savedAt =
      typeof record.savedAt === 'string' && !Number.isNaN(Date.parse(record.savedAt))
        ? record.savedAt
        : record.reading.createdAt;
    const normalized: JourneyReadingRecord = {
      favorite: record.favorite === true,
      reading: record.reading,
      savedAt,
      snapshot: historySnapshotForRecord({
        favorite: record.favorite === true,
        reading: record.reading,
        savedAt,
        snapshot: record.snapshot,
      }),
    };
    return [normalized];
  });
  const unique = new Map<string, JourneyReadingRecord>();
  records
    .sort(
      (left, right) =>
        right.savedAt.localeCompare(left.savedAt) ||
        left.reading.id.localeCompare(right.reading.id),
    )
    .forEach((record) => {
      if (!unique.has(record.reading.id)) unique.set(record.reading.id, record);
    });
  return [...unique.values()].slice(0, safeHistoryLimit(limit));
}

export function addTarotHistoryRecord(
  records: readonly JourneyReadingRecord[],
  reading: TarotReading,
  savedAt: string,
  limit = TAROT_HISTORY_LIMIT,
): {
  inserted: boolean;
  record: JourneyReadingRecord;
  records: readonly JourneyReadingRecord[];
} {
  const existing = records.find((record) => record.reading.id === reading.id);
  if (existing) return { inserted: false, record: existing, records };
  const record: JourneyReadingRecord = {
    favorite: false,
    reading,
    savedAt,
    snapshot: createTarotHistorySnapshot(reading),
  };
  const nextRecords = normalizeTarotHistoryRecords([record, ...records], limit);
  return {
    inserted: true,
    record: nextRecords.find((candidate) => candidate.reading.id === reading.id) ?? record,
    records: nextRecords,
  };
}

export function removeTarotHistoryRecord(
  records: readonly JourneyReadingRecord[],
  readingId: string,
) {
  return records.filter((record) => record.reading.id !== readingId);
}
