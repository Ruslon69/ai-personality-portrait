import type { Locale } from '@shared/i18n';

import type { NumerologyProfile } from '../types';

export type AdvancedNumerologyCalculationSystem = 'pythagorean-date-cycles-v1';
export type AdvancedNumerologyFormulaVersion =
  | 'challenge-formulas-v1'
  | 'date-decomposition-v1'
  | 'life-cycle-formulas-v1'
  | 'pinnacle-age-boundaries-v1'
  | 'pinnacle-formulas-v1'
  | 'transition-window-v1';
export type NumerologyMasterNumber = 11 | 22 | 33;
export type NumerologyKarmicDebtNumber = 13 | 14 | 16 | 19;
export type NumerologyMasterHandling =
  'not-applicable' | 'preserve' | 'preserve-with-base' | 'reduce';
export type AdvancedNumerologyCalculationType =
  | 'attitude'
  | 'birthday'
  | 'challenge'
  | 'date-component'
  | 'karmic-debt'
  | 'life-cycle'
  | 'life-path'
  | 'personal-day'
  | 'personal-month'
  | 'personal-year'
  | 'pinnacle'
  | 'transition';

export type NumerologyMasterDecision = {
  baseValue: number;
  input: number;
  policy: NumerologyMasterHandling;
  preserved: boolean;
  result: number;
};

export type NumerologyTraceOperation = {
  id: string;
  kind:
    | 'absolute-difference'
    | 'add'
    | 'boundary'
    | 'preserve-master'
    | 'reduce-digits'
    | 'select-source';
  operands: readonly number[];
  result: number;
};

export type NumerologyCalculationTrace = {
  calculationType: AdvancedNumerologyCalculationType;
  finalValue: number;
  inputs: Readonly<Record<string, number>>;
  intermediateValues: readonly number[];
  masterNumberDecisions: readonly NumerologyMasterDecision[];
  operations: readonly NumerologyTraceOperation[];
  policy: NumerologyMasterHandling;
};

export type ReducedDateComponent = {
  baseValue: number;
  preservedMasterNumber: NumerologyMasterNumber | null;
  rawValue: number;
  trace: NumerologyCalculationTrace;
  value: number;
};

export type NumerologyDateComponents = {
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  reducedDay: ReducedDateComponent;
  reducedMonth: ReducedDateComponent;
  reducedYear: ReducedDateComponent;
};

export type NumerologyPeriodStatus = 'current' | 'future' | 'past';

export type PinnacleResult = {
  calculationTrace: NumerologyCalculationTrace;
  endAge: number | null;
  endDate: string | null;
  formulaId: 'month-plus-day' | 'day-plus-year' | 'first-plus-second' | 'month-plus-year';
  formulaVersion: 'pinnacle-formulas-v1';
  ordinal: 1 | 2 | 3 | 4;
  preservedMasterNumber: NumerologyMasterNumber | null;
  rawOperands: readonly [number, number];
  result: number;
  startAge: number;
  startDate: string;
  status: NumerologyPeriodStatus;
};

export type ChallengeResult = {
  calculationTrace: NumerologyCalculationTrace;
  formulaId: 'day-minus-month' | 'day-minus-year' | 'first-minus-second' | 'month-minus-year';
  formulaVersion: 'challenge-formulas-v1';
  operands: readonly [number, number];
  ordinal: 1 | 2 | 3 | 4;
  periodRelation: `pinnacle-${1 | 2 | 3 | 4}`;
  result: number;
};

export type LifeCycleResult = {
  calculationTrace: NumerologyCalculationTrace;
  endAge: number | null;
  endDate: string | null;
  formulaVersion: 'life-cycle-formulas-v1';
  ordinal: 1 | 2 | 3;
  preservedMasterNumber: NumerologyMasterNumber | null;
  sourceComponent: 'day' | 'month' | 'year';
  startAge: number;
  startDate: string;
  status: NumerologyPeriodStatus;
  value: number;
};

export type NumerologyPeriodTransition<TPeriod> = {
  calculationTrace: NumerologyCalculationTrace;
  current: TPeriod;
  formulaVersion: 'transition-window-v1';
  monthsUntilTransition: number | null;
  next: TPeriod | null;
  previous: TPeriod | null;
  transitionBoundary: string | null;
  transitionWindowMonths: 6;
  yearsUntilTransition: number | null;
  withinTransitionWindow: boolean;
};

export type KarmicDebtResult = {
  debtNumber: NumerologyKarmicDebtNumber;
  provenance: {
    calculationSystem: AdvancedNumerologyCalculationSystem;
    operationId: string;
  };
  rawStep: number;
  reducedValue: number;
  sourceCalculation: string;
};

export type AdvancedNumerologyMasterOccurrence = {
  baseValue: number;
  calculationId: string;
  value: NumerologyMasterNumber;
};

export type AdvancedNumerologyMetadata = {
  birthDate: string;
  calculationSystem: AdvancedNumerologyCalculationSystem;
  formulaVersions: {
    challenge: 'challenge-formulas-v1';
    dateDecomposition: 'date-decomposition-v1';
    lifeCycle: 'life-cycle-formulas-v1';
    pinnacle: 'pinnacle-formulas-v1';
    pinnacleBoundaries: 'pinnacle-age-boundaries-v1';
    transition: 'transition-window-v1';
  };
  masterPolicyVersion: 'master-number-policy-v1';
  referenceDate: string;
};

export type AdvancedNumerologyProfile = {
  calculationMetadata: AdvancedNumerologyMetadata;
  challenges: readonly ChallengeResult[];
  currentChallenge: ChallengeResult;
  currentLifeCycle: LifeCycleResult;
  currentPinnacle: PinnacleResult;
  dateComponents: NumerologyDateComponents;
  existingCanonicalProfile: NumerologyProfile;
  karmicDebts: readonly KarmicDebtResult[];
  lifeCycles: readonly LifeCycleResult[];
  masterNumbers: readonly AdvancedNumerologyMasterOccurrence[];
  pinnacles: readonly PinnacleResult[];
  transitions: {
    lifeCycle: NumerologyPeriodTransition<LifeCycleResult>;
    pinnacle: NumerologyPeriodTransition<PinnacleResult>;
  };
};

export type AdvancedNumerologyValidationCode =
  | 'invalid-age-boundary'
  | 'invalid-birth-date'
  | 'invalid-challenge'
  | 'invalid-current-period'
  | 'invalid-karmic-provenance'
  | 'invalid-master-policy'
  | 'invalid-reference-date'
  | 'invalid-trace'
  | 'invalid-version'
  | 'non-serializable'
  | 'period-gap'
  | 'period-overlap';

export type AdvancedNumerologyValidationError = {
  code: AdvancedNumerologyValidationCode;
  message: string;
  path: string;
};

export type AdvancedNumerologyValidationResult = {
  errors: readonly AdvancedNumerologyValidationError[];
  valid: boolean;
};

export type AdvancedNumerologyFixture = {
  birthDate: string;
  expected: {
    challengeCount: 4;
    currentLifeCycleOrdinal?: 1 | 2 | 3;
    currentPinnacleOrdinal?: 1 | 2 | 3 | 4;
    karmicDebt?: NumerologyKarmicDebtNumber;
    lifePath?: number;
  };
  id: string;
  locale: Locale;
  referenceDate: string;
};

export type AdvancedNumerologyReferenceVector = {
  birthDate: string;
  expected: {
    challenges: readonly [number, number, number, number];
    decomposition: readonly [number, number, number];
    lifeCycles: readonly [number, number, number];
    lifePath: number;
    pinnacles: readonly [number, number, number, number];
  };
  id: string;
  referenceDate: string;
};
