import type { Locale } from '@shared/i18n';

import { tarotCardById, tarotSpreadById } from '../data';
import type { TarotReading } from '../types';

const headlineWordLimits: Record<Locale, { maximum: number; minimum: number }> = {
  es: { maximum: 10, minimum: 4 },
  en: { maximum: 10, minimum: 4 },
  ru: { maximum: 10, minimum: 4 },
  uk: { maximum: 10, minimum: 4 },
};

const semanticHeadlineTemplates: Record<Locale, (concept: string) => string> = {
  es: (concept) => `Lo que importa ahora: ${concept}`,
  en: (concept) => `What matters now: ${concept}`,
  ru: (concept) => `Сейчас важно: ${concept}`,
  uk: (concept) => `Зараз важливо: ${concept}`,
};

const repeatedThemeCopy: Record<Locale, (theme: string) => string> = {
  es: (theme) => `Un hilo de esta lectura es ${theme}.`,
  en: (theme) => `One thread in this reading is ${theme}.`,
  ru: (theme) => `Одна из тем расклада — «${theme}».`,
  uk: (theme) => `Одна з тем розкладу — «${theme}».`,
};

type TarotResultPattern = {
  attention: string;
  repeated: string;
  support: string;
  tension: string;
};

export type TarotResultHeroPresentation = {
  headline: string;
  heroSummary: string;
  metadata: readonly string[];
  motifs: readonly string[];
  pattern: TarotResultPattern;
  reflectionQuestion: string;
  secondaryContext: string;
  supportingLine: string;
};

export type TarotResultCopyInput = {
  authoredHeadlines: readonly string[];
  leadingCardName: string;
  leadingTheme: string;
  locale: Locale;
  supportingCandidates: readonly string[];
};

export function countPresentationWords(value: string) {
  return value.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function firstSentence(value: string) {
  return (
    value
      .trim()
      .split(/(?<=[.!?])\s+|\n+/u)
      .find(Boolean) ?? value.trim()
  );
}

function constrainSummary(value: string, minimum = 25, maximum = 60) {
  const sentences = value
    .trim()
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const selected: string[] = [];
  for (const sentence of sentences) {
    const candidate = [...selected, sentence].join(' ');
    if (
      countPresentationWords(candidate) > maximum &&
      countPresentationWords(selected.join(' ')) >= minimum
    )
      break;
    selected.push(sentence);
    if (countPresentationWords(candidate) >= minimum) break;
  }
  const summary = selected.join(' ') || value.trim();
  if (countPresentationWords(summary) <= maximum) return summary;
  const constrained = summary
    .split(/\s+/u)
    .slice(0, maximum)
    .join(' ')
    .replace(/[,;:—-]+$/u, '');
  return /[.!?]$/u.test(constrained) ? constrained : `${constrained}.`;
}

function isWithinHeadlineLimit(value: string, locale: Locale) {
  const count = countPresentationWords(value);
  const limit = headlineWordLimits[locale];
  return count >= limit.minimum && count <= limit.maximum;
}

function firstDifferent(candidates: readonly string[], headline: string) {
  const normalizedHeadline = headline.trim().toLocaleLowerCase();
  return (
    candidates
      .map((candidate) => candidate.trim())
      .filter(
        (candidate) => Boolean(candidate) && candidate.toLocaleLowerCase() !== normalizedHeadline,
      )
      .sort((left, right) => countPresentationWords(left) - countPresentationWords(right))[0] ??
    headline
  );
}

export function constrainTarotResultHeadline(input: {
  authoredHeadlines: readonly string[];
  leadingCardName: string;
  leadingTheme: string;
  locale: Locale;
}) {
  const validAuthored = input.authoredHeadlines
    .map((headline) => headline.trim())
    .filter((headline) => isWithinHeadlineLimit(headline, input.locale))
    .sort((left, right) => countPresentationWords(left) - countPresentationWords(right));
  if (validAuthored[0]) return validAuthored[0];

  const thematicHeadline = semanticHeadlineTemplates[input.locale](input.leadingTheme.trim());
  if (isWithinHeadlineLimit(thematicHeadline, input.locale)) return thematicHeadline;

  return semanticHeadlineTemplates[input.locale](input.leadingCardName.trim());
}

export function createTarotResultCopyPresentation(input: TarotResultCopyInput) {
  const headline = constrainTarotResultHeadline(input);
  const primaryAuthored = input.authoredHeadlines[0]?.trim() ?? '';
  return {
    headline,
    supportingLine:
      primaryAuthored && primaryAuthored.toLocaleLowerCase() !== headline.toLocaleLowerCase()
        ? primaryAuthored
        : firstDifferent([...input.authoredHeadlines, ...input.supportingCandidates], headline),
  };
}

export function createTarotResultHeroPresentation(
  reading: TarotReading,
): TarotResultHeroPresentation {
  const locale = reading.context.locale;
  const leadingCard = tarotCardById.get(reading.leadingCardId);
  const spread = tarotSpreadById.get(reading.spreadId);
  const authoredHeadlines = [reading.headline, reading.expertInterpretation.content.headline];
  const copy = createTarotResultCopyPresentation({
    authoredHeadlines,
    leadingCardName: leadingCard?.name[locale] ?? spread?.title[locale] ?? reading.headline,
    leadingTheme:
      leadingCard?.baseThemes[locale][0] ??
      reading.expertInterpretation.themes.find(
        (theme) => theme.id === reading.expertInterpretation.leadingThemeId,
      )?.semanticId ??
      spread?.title[locale] ??
      reading.headline,
    locale,
    supportingCandidates: [
      reading.expertInterpretation.content.opening,
      reading.summary,
      reading.practicalFocus,
    ],
  });
  const cards = reading.selections
    .map((selection) => tarotCardById.get(selection.cardId))
    .filter((card) => Boolean(card));
  const motifs = [
    ...(leadingCard?.baseThemes[locale] ?? []),
    ...cards.flatMap((card) => card?.baseThemes[locale] ?? []),
  ]
    .map((theme) => theme.trim())
    .filter((theme, index, themes) => Boolean(theme) && themes.indexOf(theme) === index)
    .slice(0, 4);
  const tensionIndex = reading.selections.findIndex(
    (selection) => selection.orientation === 'reversed',
  );
  const tension = reading.interpretations[tensionIndex >= 0 ? tensionIndex : 1];
  const supportIndex = reading.selections.findIndex(
    (selection, index) => selection.orientation === 'upright' && index !== tensionIndex,
  );
  const support = reading.interpretations[supportIndex >= 0 ? supportIndex : 0];
  const leadingTheme = motifs[0] ?? leadingCard?.name[locale] ?? reading.headline;
  const lastInterpretation = reading.interpretations.at(-1) ?? reading.interpretations[0];
  return {
    headline: copy.headline,
    heroSummary: constrainSummary(reading.summary),
    metadata: [spread?.title[locale] ?? reading.spreadId],
    motifs,
    pattern: {
      attention: firstSentence(lastInterpretation?.practicalTheme ?? reading.practicalFocus),
      repeated: repeatedThemeCopy[locale](leadingTheme),
      support: firstSentence(support?.meaningInPosition ?? copy.supportingLine),
      tension: firstSentence(tension?.meaningInPosition ?? copy.supportingLine),
    },
    reflectionQuestion: lastInterpretation?.reflectionQuestion ?? '',
    secondaryContext:
      reading.interpretations[0]?.numerologyLink ??
      `${reading.context.numerology.personalYear.label}: ${reading.context.numerology.personalYear.value}`,
    supportingLine: copy.supportingLine,
  };
}
