import type { TarotCardSelection, TarotReading, TarotTopic } from '@features/tarot';
import type { Locale } from '@shared/i18n';

export type JourneyDailyCard = {
  dateKey: string;
  openedAt: string | null;
  selection: TarotCardSelection;
};

export type JourneyReadingRecord = {
  favorite: boolean;
  reading: TarotReading;
  savedAt: string;
  snapshot?: TarotHistorySnapshot;
};

export type TarotHistorySnapshot = {
  createdAt: string;
  finalSynthesis: string;
  locale: Locale;
  motifs: readonly string[];
  readingId: string;
  resultHeadline: string;
  schemaVersion: 'tarot-history-record-v1';
  seed: string;
  selections: readonly TarotCardSelection[];
  spreadId: string;
  spreadTitle: string;
  topic?: TarotTopic;
};

export type JourneyChapter = {
  dominantTheme: string;
  number: string;
  quote: string;
  readingType: string;
  record: JourneyReadingRecord;
  title: string;
};

export type JourneyState = {
  dailyCards: Readonly<Record<string, JourneyDailyCard>>;
  identity: string;
  readings: readonly JourneyReadingRecord[];
};
