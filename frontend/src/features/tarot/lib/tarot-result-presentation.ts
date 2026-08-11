import type { Locale } from '@shared/i18n';

import { tarotCardById, tarotSpreadById } from '../data';
import type { TarotReading } from '../types';

const headlineWordLimits: Record<Locale, { maximum: number; minimum: number }> = {
  en: { maximum: 10, minimum: 4 },
  ru: { maximum: 9, minimum: 4 },
  uk: { maximum: 9, minimum: 4 },
};

const semanticHeadlineTemplates: Record<Locale, (concept: string) => string> = {
  en: (concept) => `The reading centres on ${concept}`,
  ru: (concept) => `В центре расклада — ${concept}`,
  uk: (concept) => `У центрі розкладу — ${concept}`,
};

export type TarotResultHeroPresentation = {
  headline: string;
  metadata: readonly string[];
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
  return value.trim().split(/\s+/u).filter(Boolean).length;
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
  return {
    headline: copy.headline,
    metadata: [
      spread?.title[locale] ?? reading.spreadId,
      `${reading.context.numerology.personalYear.label}: ${reading.context.numerology.personalYear.value}`,
    ],
    supportingLine: copy.supportingLine,
  };
}
