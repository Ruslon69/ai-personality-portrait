import { tarotCardById, tarotSpreads } from '@features/tarot';
import type { Locale } from '@shared/i18n';

import { chapterTitles, type ChapterTitleKey } from '../data';
import type { JourneyChapter, JourneyReadingRecord } from '../types';

function toRoman(value: number) {
  const numerals: readonly [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = Math.max(1, value);
  let result = '';
  numerals.forEach(([amount, numeral]) => {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  });
  return result;
}

function titleKey(record: JourneyReadingRecord, index: number): ChapterTitleKey {
  const reading = record.reading;
  const spread = tarotSpreads.find((item) => item.id === reading.spreadId);
  const leadingCard = tarotCardById.get(reading.leadingCardId);
  const personalYear = reading.context.numerology.personalYear.value;

  if (spread?.topic === 'decision') return 'choices';
  if (spread?.period === 'year' || personalYear === 1 || personalYear === 9) return 'new-cycle';
  if (index === 0 && spread?.period === 'day') return 'first-step';
  if (spread?.topic === 'love' || personalYear === 2 || personalYear === 6) return 'quiet-current';
  if (
    spread?.topic === 'money' ||
    spread?.topic === 'work' ||
    personalYear === 4 ||
    personalYear === 8
  )
    return 'foundations';
  if (spread?.period === 'month' || leadingCard?.visual.accent === 'fire') return 'turning-point';
  if (spread?.period === 'week' || leadingCard?.visual.accent === 'air') return 'clear-horizon';
  return 'inner-compass';
}

export function createJourneyChapters(
  readings: readonly JourneyReadingRecord[],
  locale: Locale,
): readonly JourneyChapter[] {
  return [...readings]
    .sort((a, b) => a.savedAt.localeCompare(b.savedAt))
    .map((record, index) => {
      const reading = record.reading;
      const card = tarotCardById.get(reading.leadingCardId);
      const spread = tarotSpreads.find((item) => item.id === reading.spreadId);
      const leadingInterpretation = reading.interpretations.find(
        (item) => item.cardId === reading.leadingCardId,
      );
      return {
        dominantTheme: card?.baseThemes[locale][0] ?? reading.practicalFocus,
        number: toRoman(index + 1),
        quote: leadingInterpretation?.headline ?? reading.practicalFocus,
        readingType: spread?.title[locale] ?? reading.headline,
        record,
        title: chapterTitles[locale][titleKey(record, index)],
      };
    });
}
