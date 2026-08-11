import type { Locale } from '@shared/i18n';

import { chapterTitleVariants, type ChapterTitleKey } from '../data';
import { normalizeChapterTitle, selectUniqueChapterTitle } from './select-chapter-title';

export type JourneyChapterTitleRuntimeReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

const locales: readonly Locale[] = ['ru', 'en', 'uk'];
const keys = Object.keys(chapterTitleVariants.ru) as readonly ChapterTitleKey[];

export function runJourneyChapterTitleRuntimeSuite(): JourneyChapterTitleRuntimeReport {
  const errors: string[] = [];
  let assertionCount = 0;
  let fixtureCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };

  locales.forEach((locale) => {
    keys.forEach((key) => {
      const variants = chapterTitleVariants[locale][key];
      fixtureCount += 1;
      assert(variants.length >= 4, `${locale}/${key}: too few authored title variants.`);
      assert(
        variants.every((title) => Boolean(title.trim())),
        `${locale}/${key}: empty chapter title variant.`,
      );
      assert(
        new Set(variants.map(normalizeChapterTitle)).size === variants.length,
        `${locale}/${key}: normalized title variants are duplicated.`,
      );
    });

    const selected: string[] = [];
    for (let ordinal = 1; ordinal <= 10; ordinal += 1) {
      const input = {
        journeyFingerprint: 'stable-journey-fingerprint',
        key: 'quiet-current' as const,
        leadingCardId: 'major-hermit',
        leadingCardTitle: chapterTitleVariants[locale]['inner-compass'][0]!,
        locale,
        ordinal,
        periodConcept: 'month:2',
        previousTitle: selected.at(-1) ?? null,
        secondaryConcept: chapterTitleVariants[locale]['quiet-current'][0]!,
        spreadId: 'love',
        spreadTitle: chapterTitleVariants[locale].choices[0]!,
        topic: 'love',
        usedTitles: selected,
      };
      const title = selectUniqueChapterTitle(input);
      const repeated = selectUniqueChapterTitle(input);
      assert(Boolean(title.trim()), `${locale}/${ordinal}: generated chapter title is empty.`);
      assert(title === repeated, `${locale}/${ordinal}: chapter title selection is unstable.`);
      assert(
        normalizeChapterTitle(title) !== normalizeChapterTitle(selected.at(-1) ?? ''),
        `${locale}/${ordinal}: consecutive chapter titles are duplicated.`,
      );
      if (ordinal <= chapterTitleVariants[locale]['quiet-current'].length) {
        assert(
          !selected.map(normalizeChapterTitle).includes(normalizeChapterTitle(title)),
          `${locale}/${ordinal}: an authored alternative existed but a duplicate was selected.`,
        );
      }
      selected.push(title);
    }
  });

  assert(
    normalizeChapterTitle('III · Тихое течение') === normalizeChapterTitle('тихое течение'),
    'Roman chapter prefix is not ignored during title normalization.',
  );
  assert(
    !selectUniqueChapterTitle.toString().includes('Math.random'),
    'Chapter title selection must not use Math.random.',
  );

  return {
    assertionCount,
    errors,
    fixtureCount,
    valid: errors.length === 0,
  };
}
