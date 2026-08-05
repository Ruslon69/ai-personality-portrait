import type {
  InterpretationConfidenceLevel,
  InterpretationConnectionKind,
  InterpretationPolarity,
  InterpretationReliability,
  InterpretationSectionKind,
  InterpretationSource,
  InterpretationStrength,
  InterpretationUncertainty,
} from '../types';

export const INTERPRETATION_SOURCES = [
  'tarot-card',
  'tarot-position',
  'tarot-connection',
  'numerology',
  'zodiac',
  'psychological-context',
  'interest',
] as const satisfies readonly InterpretationSource[];

export const INTERPRETATION_CONNECTION_KINDS = [
  'reinforcement',
  'contrast',
  'progression',
  'blockage',
  'opportunity',
  'unresolved-tension',
  'practical-direction',
] as const satisfies readonly InterpretationConnectionKind[];

export const INTERPRETATION_CONFIDENCE_LEVELS = [
  'high',
  'medium',
  'low',
  'interpretive',
] as const satisfies readonly InterpretationConfidenceLevel[];

export const INTERPRETATION_UNCERTAINTIES = [
  'direct-input',
  'deterministic-calculation',
  'contextual-inference',
  'symbolic-interpretation',
  'limited-context',
] as const satisfies readonly InterpretationUncertainty[];

export const INTERPRETATION_POLARITIES = [
  'supportive',
  'challenging',
  'neutral',
  'mixed',
] as const satisfies readonly InterpretationPolarity[];

export const INTERPRETATION_STRENGTHS = [
  'primary',
  'secondary',
  'contextual',
] as const satisfies readonly InterpretationStrength[];

export const INTERPRETATION_RELIABILITIES = [
  'direct',
  'deterministic',
  'contextual',
  'symbolic',
] as const satisfies readonly InterpretationReliability[];

export const INTERPRETATION_SECTION_KINDS = [
  'leading-theme',
  'supporting-theme',
  'tension',
  'period-context',
  'practical-focus',
  'symbolic-lens',
] as const satisfies readonly InterpretationSectionKind[];
