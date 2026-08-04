import type { TarotCardSelection, TarotReading } from '@features/tarot';

export type JourneyDailyCard = {
  dateKey: string;
  openedAt: string | null;
  selection: TarotCardSelection;
};

export type JourneyReadingRecord = {
  favorite: boolean;
  reading: TarotReading;
  savedAt: string;
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
