import type { Locale } from '@shared/i18n';
import type { NumerologyProfile } from '@features/numerology';

export type LocalizedText = Record<Locale, string>;
export type TarotSuit = 'cups' | 'pentacles' | 'swords' | 'wands';
export type TarotArcana = 'major' | 'minor';
export type TarotOrientation = 'reversed' | 'upright';
export type TarotPeriod = 'day' | 'month' | 'week' | 'year';
export type TarotTopic = 'decision' | 'love' | 'money' | 'open' | 'work';
export type TarotDeckTheme = 'cosmic-minimal' | 'deep-water' | 'midnight-geometry' | 'solar-lines';
export type TarotSelectionMode = 'automatic' | 'manual';

export type TarotVisualMetadata = {
  accent: 'air' | 'earth' | 'fire' | 'major' | 'water';
  glyph: string;
  pattern: 'arc' | 'gate' | 'ray' | 'steps' | 'wave';
};

export type TarotCard = {
  advice: LocalizedText;
  arcana: TarotArcana;
  baseThemes: Record<Locale, readonly string[]>;
  caution: LocalizedText;
  id: string;
  keywords: Record<Locale, readonly string[]>;
  light: LocalizedText;
  money: LocalizedText;
  name: LocalizedText;
  number: number;
  personalGrowth: LocalizedText;
  relationship: LocalizedText;
  reversed: LocalizedText;
  shadow: LocalizedText;
  suit?: TarotSuit;
  upright: LocalizedText;
  visual: TarotVisualMetadata;
  work: LocalizedText;
};

export type TarotDeck = {
  cards: readonly TarotCard[];
  id: 'standard-78-v1';
  name: LocalizedText;
  version: 1;
};

export type TarotSpreadPosition = {
  id: string;
  label: LocalizedText;
  prompt: LocalizedText;
};

export type TarotSpread = {
  access: 'free' | 'preview';
  description: LocalizedText;
  id: string;
  kind: 'period' | 'topic';
  period?: TarotPeriod;
  positions: readonly TarotSpreadPosition[];
  title: LocalizedText;
  topic?: TarotTopic;
};

export type TarotCardSelection = {
  cardId: string;
  orientation: TarotOrientation;
  positionId: string;
};

export type TarotPsychologyAnswer = {
  optionId: string;
  questionId: string;
};

export type TarotReadingContext = {
  birthDate: string;
  deckTheme: TarotDeckTheme;
  interests: readonly string[];
  locale: Locale;
  numerology: NumerologyProfile;
  period?: TarotPeriod;
  psychologyAnswers: readonly TarotPsychologyAnswer[];
  seed: string;
  selectionMode: TarotSelectionMode;
  spreadId: string;
  topic?: TarotTopic;
};

export type TarotInterpretation = {
  cardId: string;
  connections: string;
  contextLink: string;
  headline: string;
  id: string;
  meaningInPosition: string;
  numerologyLink: string;
  orientation: TarotOrientation;
  positionId: string;
  practicalTheme: string;
  reflectionQuestion: string;
  uncertainty: string;
};

export type TarotReading = {
  context: TarotReadingContext;
  createdAt: string;
  headline: string;
  id: string;
  interpretations: readonly TarotInterpretation[];
  leadingCardId: string;
  practicalFocus: string;
  selections: readonly TarotCardSelection[];
  spreadId: string;
  summary: string;
};
