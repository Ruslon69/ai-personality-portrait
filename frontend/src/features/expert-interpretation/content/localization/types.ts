import type { InterpretationConnectionKind } from '../../types';
import type { ReversedMode } from '../concepts';
import type { PositionModifier } from '../concepts';

export type SpreadStrategyId =
  | 'card-of-the-day'
  | 'compact-year'
  | 'decision'
  | 'love'
  | 'money'
  | 'month'
  | 'week'
  | 'work-study';

export type NumerologyWordingContext =
  'core' | 'period' | 'practical' | 'relational' | 'social' | 'tarot' | 'tension';

export type ContentDictionary = {
  closing: readonly string[];
  connection: Readonly<Record<InterpretationConnectionKind, readonly string[]>>;
  contextual: readonly string[];
  headline: Readonly<Record<SpreadStrategyId, readonly string[]>>;
  interestExamples: Readonly<Record<string, readonly string[]>>;
  localeSignature: readonly string[];
  numberThemes: Readonly<Record<number, string>>;
  numerology: Readonly<Record<NumerologyWordingContext, readonly string[]>>;
  opening: Readonly<Record<SpreadStrategyId, readonly string[]>>;
  orientation: Readonly<Record<'upright' | ReversedMode, readonly string[]>>;
  position: Readonly<Record<PositionModifier, readonly string[]>>;
  practical: readonly string[];
  psychological: readonly string[];
  reflection: readonly string[];
  safeFallback: {
    boundary: string;
    conversation: string;
    reflection: string;
  };
  sectionHeadline: readonly string[];
  transitions: readonly string[];
  uncertainty: readonly string[];
};
