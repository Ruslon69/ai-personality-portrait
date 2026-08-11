import type { Locale } from '@shared/i18n';

import { chapterTitleVariants, type ChapterTitleKey } from '../data';

const continuityFrames: Record<Locale, readonly string[]> = {
  en: [
    'A New Perspective',
    'The Next Turn',
    'Deeper into the Theme',
    'Another Rhythm',
    'The Path Continues',
    'A Shift in Perspective',
  ],
  ru: [
    'Новый ракурс',
    'Следующий поворот',
    'Глубже в тему',
    'Другой ритм',
    'Продолжение пути',
    'Смена перспективы',
  ],
  uk: [
    'Новий ракурс',
    'Наступний поворот',
    'Глибше в тему',
    'Інший ритм',
    'Продовження шляху',
    'Зміна перспективи',
  ],
};

export type ChapterTitleSelectionInput = {
  journeyFingerprint: string;
  key: ChapterTitleKey;
  leadingCardId: string;
  leadingCardTitle: string;
  locale: Locale;
  ordinal: number;
  periodConcept: string;
  previousTitle: string | null;
  secondaryConcept: string;
  spreadId: string;
  spreadTitle: string;
  topic: string;
  usedTitles: readonly string[];
};

function stableTitleHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function normalizeChapterTitle(title: string) {
  return title
    .normalize('NFKC')
    .replace(/^\s*[ivxlcdm]+\s*[·:—–-]\s*/iu, '')
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function rotated<T>(values: readonly T[], offset: number) {
  if (!values.length) return [];
  return values.map((_, index) => values[(index + offset) % values.length]!);
}

export function selectUniqueChapterTitle(input: ChapterTitleSelectionInput) {
  const fingerprint = [
    input.journeyFingerprint,
    input.key,
    input.leadingCardId,
    input.spreadId,
    input.topic,
    input.periodConcept,
    input.ordinal,
    input.previousTitle ?? '',
  ].join('|');
  const variants = chapterTitleVariants[input.locale][input.key];
  const offset = stableTitleHash(fingerprint) % variants.length;
  const orderedVariants = rotated(variants, offset);
  const used = new Set(input.usedTitles.map(normalizeChapterTitle));

  const authoredVariant = orderedVariants.find((title) => !used.has(normalizeChapterTitle(title)));
  if (authoredVariant) return authoredVariant;

  const frames = rotated(
    continuityFrames[input.locale],
    stableTitleHash(`${fingerprint}|continuity`) % continuityFrames[input.locale].length,
  );
  const secondaryCandidates = frames.flatMap((frame) => [
    `${frame}: ${input.leadingCardTitle}`,
    `${frame}: ${input.spreadTitle}`,
    `${frame}: ${input.secondaryConcept}`,
  ]);
  const secondaryTitle = secondaryCandidates.find(
    (title) => title.trim() && !used.has(normalizeChapterTitle(title)),
  );
  if (secondaryTitle) return secondaryTitle;

  const previousNormalized = normalizeChapterTitle(input.previousTitle ?? '');
  return (
    orderedVariants.find((title) => normalizeChapterTitle(title) !== previousNormalized) ??
    orderedVariants[0]!
  );
}
