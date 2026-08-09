import type { Locale } from '@shared/i18n';

import { createNumerologyProfile } from '../lib/numerology-engine';
import {
  ADVANCED_MASTER_NUMBERS,
  ADVANCED_NUMEROLOGY_SYSTEM,
  ADVANCED_NUMEROLOGY_VERSIONS,
  KARMIC_DEBT_NUMBERS,
  TRANSITION_WINDOW_MONTHS,
} from './constants';
import {
  addMonthsClamped,
  addYearsClamped,
  calendarMonthsUntil,
  compareIsoDates,
  parseIsoDate,
  previousDay,
} from './date-utils';
import { baseReduction, digitSum, reduceWithPolicy, traceFromOperation } from './reduction';
import type {
  AdvancedNumerologyMasterOccurrence,
  AdvancedNumerologyProfile,
  ChallengeResult,
  KarmicDebtResult,
  LifeCycleResult,
  NumerologyCalculationTrace,
  NumerologyDateComponents,
  NumerologyKarmicDebtNumber,
  NumerologyMasterNumber,
  NumerologyPeriodStatus,
  NumerologyPeriodTransition,
  PinnacleResult,
  ReducedDateComponent,
} from './types';

function dateStatus(startDate: string, endDate: string | null, referenceDate: string) {
  if (compareIsoDates(referenceDate, startDate) < 0) return 'future';
  if (endDate && compareIsoDates(referenceDate, endDate) > 0) return 'past';
  return 'current';
}

function component(rawValue: number, name: 'day' | 'month' | 'year'): ReducedDateComponent {
  const initial = ADVANCED_MASTER_NUMBERS.includes(rawValue as NumerologyMasterNumber)
    ? rawValue
    : digitSum(rawValue);
  const reduced = reduceWithPolicy(initial, 'date-component', { [name]: rawValue });
  return {
    ...reduced,
    rawValue,
    trace: {
      ...reduced.trace,
      operations: [
        {
          id: `date-component.${name}.source`,
          kind: 'reduce-digits',
          operands: String(rawValue).split('').map(Number),
          result: initial,
        },
        ...reduced.trace.operations,
      ],
    },
  };
}

export function decomposeNumerologyBirthDate(birthDate: string): NumerologyDateComponents {
  const parsed = parseIsoDate(birthDate);
  if (!parsed) throw new Error('Advanced numerology requires a valid ISO birth date.');
  return {
    birthDay: parsed.day,
    birthMonth: parsed.month,
    birthYear: parsed.year,
    reducedDay: component(parsed.day, 'day'),
    reducedMonth: component(parsed.month, 'month'),
    reducedYear: component(parsed.year, 'year'),
  };
}

function periodDates(birthDate: string, startAge: number, endAge: number | null) {
  const startDate = addYearsClamped(birthDate, startAge);
  const endDate = endAge === null ? null : previousDay(addYearsClamped(birthDate, endAge + 1));
  return { endDate, startDate };
}

function pinnacleValue(
  ordinal: 1 | 2 | 3 | 4,
  operands: readonly [number, number],
  formulaId: PinnacleResult['formulaId'],
) {
  const raw = operands[0] + operands[1];
  const reduced = reduceWithPolicy(raw, 'pinnacle', {
    left: operands[0],
    ordinal,
    right: operands[1],
  });
  return {
    ...reduced,
    trace: {
      ...reduced.trace,
      operations: [
        {
          id: `pinnacle.${ordinal}.${formulaId}`,
          kind: 'add' as const,
          operands,
          result: raw,
        },
        ...reduced.trace.operations,
      ],
    },
  };
}

export function calculatePinnacles(input: {
  birthDate: string;
  components: NumerologyDateComponents;
  lifePath: number;
  referenceDate: string;
}): readonly PinnacleResult[] {
  // Classical Pythagorean date formula: M+D, D+Y, P1+P2, M+Y.
  // The first inclusive age range ends at 36 minus the single-digit Life Path base;
  // the next two ranges are nine years each and the fourth remains open.
  const lifePathBase = baseReduction(input.lifePath);
  const firstEndAge = 36 - lifePathBase;
  const ageRanges = [
    [0, firstEndAge],
    [firstEndAge + 1, firstEndAge + 9],
    [firstEndAge + 10, firstEndAge + 18],
    [firstEndAge + 19, null],
  ] as const;
  const first = pinnacleValue(
    1,
    [input.components.reducedMonth.value, input.components.reducedDay.value],
    'month-plus-day',
  );
  const second = pinnacleValue(
    2,
    [input.components.reducedDay.value, input.components.reducedYear.value],
    'day-plus-year',
  );
  const values = [
    first,
    second,
    pinnacleValue(3, [first.value, second.value], 'first-plus-second'),
    pinnacleValue(
      4,
      [input.components.reducedMonth.value, input.components.reducedYear.value],
      'month-plus-year',
    ),
  ] as const;
  return values.map((calculation, index) => {
    const ordinal = (index + 1) as 1 | 2 | 3 | 4;
    const range = ageRanges[index]!;
    const dates = periodDates(input.birthDate, range[0], range[1]);
    return {
      calculationTrace: calculation.trace,
      endAge: range[1],
      endDate: dates.endDate,
      formulaId: ['month-plus-day', 'day-plus-year', 'first-plus-second', 'month-plus-year'][
        index
      ] as PinnacleResult['formulaId'],
      formulaVersion: ADVANCED_NUMEROLOGY_VERSIONS.pinnacle,
      ordinal,
      preservedMasterNumber: calculation.preservedMasterNumber,
      rawOperands:
        calculation.trace.inputs.left === undefined
          ? ([0, 0] as const)
          : ([calculation.trace.inputs.left, calculation.trace.inputs.right ?? 0] as const),
      result: calculation.value,
      startAge: range[0],
      startDate: dates.startDate,
      status: dateStatus(dates.startDate, dates.endDate, input.referenceDate),
    };
  });
}

function challenge(
  ordinal: 1 | 2 | 3 | 4,
  operands: readonly [number, number],
  formulaId: ChallengeResult['formulaId'],
): ChallengeResult {
  const result = Math.abs(operands[0] - operands[1]);
  return {
    calculationTrace: traceFromOperation({
      calculationType: 'challenge',
      inputs: { left: operands[0], ordinal, right: operands[1] },
      kind: 'absolute-difference',
      operands,
      policy: 'reduce',
      result,
    }),
    formulaId,
    formulaVersion: ADVANCED_NUMEROLOGY_VERSIONS.challenge,
    operands,
    ordinal,
    periodRelation: `pinnacle-${ordinal}`,
    result,
  };
}

export function calculateChallenges(components: NumerologyDateComponents) {
  // Challenges use absolute differences of single-digit component bases and never preserve masters.
  const month = components.reducedMonth.baseValue;
  const day = components.reducedDay.baseValue;
  const year = components.reducedYear.baseValue;
  const first = challenge(1, [day, month], 'day-minus-month');
  const second = challenge(2, [day, year], 'day-minus-year');
  return [
    first,
    second,
    challenge(3, [first.result, second.result], 'first-minus-second'),
    challenge(4, [month, year], 'month-minus-year'),
  ] as const;
}

export function calculateLifeCycles(input: {
  birthDate: string;
  components: NumerologyDateComponents;
  lifePath: number;
  referenceDate: string;
}): readonly LifeCycleResult[] {
  // Period Cycles select month, day, and year respectively. The second inclusive period
  // spans 27 years; the third begins on the following birthday and remains open.
  const firstEndAge = 36 - baseReduction(input.lifePath);
  const ranges = [
    [0, firstEndAge],
    [firstEndAge + 1, firstEndAge + 27],
    [firstEndAge + 28, null],
  ] as const;
  const sources = [
    ['month', input.components.reducedMonth],
    ['day', input.components.reducedDay],
    ['year', input.components.reducedYear],
  ] as const;
  return sources.map(([sourceComponent, source], index) => {
    const ordinal = (index + 1) as 1 | 2 | 3;
    const range = ranges[index]!;
    const dates = periodDates(input.birthDate, range[0], range[1]);
    const trace: NumerologyCalculationTrace = {
      calculationType: 'life-cycle',
      finalValue: source.value,
      inputs: { ordinal, sourceValue: source.rawValue },
      intermediateValues: source.trace.intermediateValues,
      masterNumberDecisions: source.trace.masterNumberDecisions.map((decision) => ({
        ...decision,
        policy: 'preserve-with-base',
      })),
      operations: [
        {
          id: `life-cycle.${ordinal}.source.${sourceComponent}`,
          kind: 'select-source',
          operands: [source.rawValue],
          result: source.value,
        },
        ...source.trace.operations,
      ],
      policy: 'preserve-with-base',
    };
    return {
      calculationTrace: trace,
      endAge: range[1],
      endDate: dates.endDate,
      formulaVersion: ADVANCED_NUMEROLOGY_VERSIONS.lifeCycle,
      ordinal,
      preservedMasterNumber: source.preservedMasterNumber,
      sourceComponent,
      startAge: range[0],
      startDate: dates.startDate,
      status: dateStatus(dates.startDate, dates.endDate, input.referenceDate),
      value: source.value,
    };
  });
}

export function resolvePeriodTransition<
  TPeriod extends {
    endDate: string | null;
    startDate: string;
    status: NumerologyPeriodStatus;
  },
>(periods: readonly TPeriod[], referenceDate: string): NumerologyPeriodTransition<TPeriod> {
  if (!parseIsoDate(referenceDate)) throw new Error('Transition resolver requires a valid date.');
  const currentIndex = periods.findIndex((period) => period.status === 'current');
  const current = periods[currentIndex];
  if (!current) throw new Error('Period resolver could not find the current period.');
  const previous = periods[currentIndex - 1] ?? null;
  const next = periods[currentIndex + 1] ?? null;
  const nextBoundary = next?.startDate ?? null;
  const previousBoundary = currentIndex > 0 ? current.startDate : null;
  const monthsUntilTransition = nextBoundary
    ? Math.max(0, calendarMonthsUntil(referenceDate, nextBoundary))
    : null;
  const inNextWindow = nextBoundary
    ? compareIsoDates(referenceDate, addMonthsClamped(nextBoundary, -TRANSITION_WINDOW_MONTHS)) >= 0
    : false;
  const inPreviousWindow = previousBoundary
    ? compareIsoDates(
        referenceDate,
        addMonthsClamped(previousBoundary, TRANSITION_WINDOW_MONTHS),
      ) <= 0
    : false;
  return {
    calculationTrace: {
      calculationType: 'transition',
      finalValue: monthsUntilTransition ?? -1,
      inputs: {
        currentIndex,
        nextIndex: next ? currentIndex + 1 : -1,
        transitionWindowMonths: TRANSITION_WINDOW_MONTHS,
      },
      intermediateValues: monthsUntilTransition === null ? [] : [monthsUntilTransition],
      masterNumberDecisions: [],
      operations: [
        {
          id: 'transition.resolve-boundary',
          kind: 'boundary',
          operands: [currentIndex, next ? currentIndex + 1 : -1],
          result: monthsUntilTransition ?? -1,
        },
      ],
      policy: 'not-applicable',
    },
    current,
    formulaVersion: ADVANCED_NUMEROLOGY_VERSIONS.transition,
    monthsUntilTransition,
    next,
    previous,
    transitionBoundary: nextBoundary,
    transitionWindowMonths: TRANSITION_WINDOW_MONTHS,
    yearsUntilTransition:
      monthsUntilTransition === null ? null : Number((monthsUntilTransition / 12).toFixed(2)),
    withinTransitionWindow: inNextWindow || inPreviousWindow,
  };
}

type DebtCandidate = { operationId: string; rawStep: number; reducedValue: number; source: string };

function debt(candidate: DebtCandidate): KarmicDebtResult | null {
  if (!KARMIC_DEBT_NUMBERS.includes(candidate.rawStep as NumerologyKarmicDebtNumber)) return null;
  return {
    debtNumber: candidate.rawStep as NumerologyKarmicDebtNumber,
    provenance: {
      calculationSystem: ADVANCED_NUMEROLOGY_SYSTEM,
      operationId: candidate.operationId,
    },
    rawStep: candidate.rawStep,
    reducedValue: candidate.reducedValue,
    sourceCalculation: candidate.source,
  };
}

export function detectKarmicDebts(input: {
  birthDate: string;
  components: NumerologyDateComponents;
  lifePath: number;
  pinnacles: readonly PinnacleResult[];
}) {
  const lifePathRaw = input.birthDate
    .replaceAll('-', '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
  const candidates: DebtCandidate[] = [
    {
      operationId: 'life-path.raw-digit-sum',
      rawStep: lifePathRaw,
      reducedValue: input.lifePath,
      source: 'life-path',
    },
    {
      operationId: 'birthday.raw-day',
      rawStep: input.components.birthDay,
      reducedValue: input.components.reducedDay.baseValue,
      source: 'birthday',
    },
    {
      operationId: 'attitude.month-plus-day',
      rawStep: input.components.birthMonth + input.components.birthDay,
      reducedValue: baseReduction(input.components.birthMonth + input.components.birthDay),
      source: 'attitude',
    },
    ...input.pinnacles.map((pinnacle) => ({
      operationId: `pinnacle.${pinnacle.ordinal}.${pinnacle.formulaId}`,
      rawStep: pinnacle.rawOperands[0] + pinnacle.rawOperands[1],
      reducedValue: baseReduction(pinnacle.result),
      source: `pinnacle-${pinnacle.ordinal}`,
    })),
    ...(
      [
        ['month', input.components.birthMonth],
        ['day', input.components.birthDay],
        ['year', input.components.birthYear],
      ] as const
    ).map(([name, value]) => {
      const initial = digitSum(value);
      return {
        operationId: `date-component.${name}.raw-digit-sum`,
        rawStep: initial,
        reducedValue: baseReduction(initial),
        source: `life-cycle-${name}`,
      };
    }),
  ];
  const seen = new Set<string>();
  return candidates
    .map(debt)
    .filter((item): item is KarmicDebtResult => item !== null)
    .filter((item) => {
      const key = `${item.sourceCalculation}:${item.rawStep}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function collectMasterNumbers(input: {
  canonical: ReturnType<typeof createNumerologyProfile>;
  components: NumerologyDateComponents;
  lifeCycles: readonly LifeCycleResult[];
  pinnacles: readonly PinnacleResult[];
}) {
  const values: AdvancedNumerologyMasterOccurrence[] = [];
  const add = (calculationId: string, value: number) => {
    if (!ADVANCED_MASTER_NUMBERS.includes(value as NumerologyMasterNumber)) return;
    values.push({
      baseValue: baseReduction(value),
      calculationId,
      value: value as NumerologyMasterNumber,
    });
  };
  [
    input.canonical.lifePath,
    input.canonical.birthday,
    input.canonical.attitude,
    input.canonical.personalYear,
    input.canonical.personalMonth,
    input.canonical.personalDay,
  ].forEach((item) => add(item.id, item.value));
  input.pinnacles.forEach((item) => add(`pinnacle-${item.ordinal}`, item.result));
  input.lifeCycles.forEach((item) => add(`life-cycle-${item.ordinal}`, item.value));
  return values.sort((left, right) => left.calculationId.localeCompare(right.calculationId));
}

export function createAdvancedNumerologyProfile(
  birthDate: string,
  referenceDate: string,
  locale: Locale,
): AdvancedNumerologyProfile {
  const birth = parseIsoDate(birthDate);
  const reference = parseIsoDate(referenceDate);
  if (!birth || !reference || compareIsoDates(referenceDate, birthDate) < 0)
    throw new Error('Advanced numerology requires valid birth and reference dates.');
  const referenceAtLocalNoon = new Date(reference.year, reference.month - 1, reference.day, 12);
  const canonical = createNumerologyProfile(birthDate, locale, referenceAtLocalNoon);
  const components = decomposeNumerologyBirthDate(birthDate);
  const pinnacles = calculatePinnacles({
    birthDate,
    components,
    lifePath: canonical.lifePath.value,
    referenceDate,
  });
  const challenges = calculateChallenges(components);
  const lifeCycles = calculateLifeCycles({
    birthDate,
    components,
    lifePath: canonical.lifePath.value,
    referenceDate,
  });
  const currentPinnacle = pinnacles.find((item) => item.status === 'current');
  const currentLifeCycle = lifeCycles.find((item) => item.status === 'current');
  if (!currentPinnacle || !currentLifeCycle)
    throw new Error('Current long-term period is missing.');
  const currentChallenge = challenges[currentPinnacle.ordinal - 1]!;
  return {
    calculationMetadata: {
      birthDate,
      calculationSystem: ADVANCED_NUMEROLOGY_SYSTEM,
      formulaVersions: {
        challenge: ADVANCED_NUMEROLOGY_VERSIONS.challenge,
        dateDecomposition: ADVANCED_NUMEROLOGY_VERSIONS.dateDecomposition,
        lifeCycle: ADVANCED_NUMEROLOGY_VERSIONS.lifeCycle,
        pinnacle: ADVANCED_NUMEROLOGY_VERSIONS.pinnacle,
        pinnacleBoundaries: ADVANCED_NUMEROLOGY_VERSIONS.pinnacleBoundaries,
        transition: ADVANCED_NUMEROLOGY_VERSIONS.transition,
      },
      masterPolicyVersion: ADVANCED_NUMEROLOGY_VERSIONS.masterPolicy,
      referenceDate,
    },
    challenges,
    currentChallenge,
    currentLifeCycle,
    currentPinnacle,
    dateComponents: components,
    existingCanonicalProfile: canonical,
    karmicDebts: detectKarmicDebts({
      birthDate,
      components,
      lifePath: canonical.lifePath.value,
      pinnacles,
    }),
    lifeCycles,
    masterNumbers: collectMasterNumbers({ canonical, components, lifeCycles, pinnacles }),
    pinnacles,
    transitions: {
      lifeCycle: resolvePeriodTransition(lifeCycles, referenceDate),
      pinnacle: resolvePeriodTransition(pinnacles, referenceDate),
    },
  };
}

export function explainNumerologyCalculation(
  value: AdvancedNumerologyProfile | ChallengeResult | LifeCycleResult | PinnacleResult,
): readonly NumerologyCalculationTrace[] {
  if ('calculationMetadata' in value)
    return [
      value.dateComponents.reducedMonth.trace,
      value.dateComponents.reducedDay.trace,
      value.dateComponents.reducedYear.trace,
      ...value.pinnacles.map((item) => item.calculationTrace),
      ...value.challenges.map((item) => item.calculationTrace),
      ...value.lifeCycles.map((item) => item.calculationTrace),
      value.transitions.pinnacle.calculationTrace,
      value.transitions.lifeCycle.calculationTrace,
    ];
  return [value.calculationTrace];
}
