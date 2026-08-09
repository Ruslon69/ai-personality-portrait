import { ADVANCED_MASTER_NUMBERS, MASTER_NUMBER_POLICY } from './constants';
import type {
  AdvancedNumerologyCalculationType,
  NumerologyCalculationTrace,
  NumerologyMasterDecision,
  NumerologyMasterHandling,
  NumerologyMasterNumber,
  NumerologyTraceOperation,
} from './types';

export function digitSum(value: number) {
  return String(Math.abs(value))
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}

export function baseReduction(value: number) {
  let result = Math.abs(value);
  while (result > 9) result = digitSum(result);
  return result;
}

function isMaster(value: number): value is NumerologyMasterNumber {
  return ADVANCED_MASTER_NUMBERS.includes(value as NumerologyMasterNumber);
}

export function reduceWithPolicy(
  rawValue: number,
  calculationType: AdvancedNumerologyCalculationType,
  inputs: Readonly<Record<string, number>>,
): {
  baseValue: number;
  preservedMasterNumber: NumerologyMasterNumber | null;
  trace: NumerologyCalculationTrace;
  value: number;
} {
  const policy = MASTER_NUMBER_POLICY[calculationType];
  if (!policy || policy === 'not-applicable')
    throw new Error(`No reduction policy for ${calculationType}.`);
  const operations: NumerologyTraceOperation[] = [];
  const intermediateValues: number[] = [rawValue];
  let current = Math.abs(rawValue);
  while (current > 9 && !(policy !== 'reduce' && isMaster(current))) {
    const next = digitSum(current);
    operations.push({
      id: `${calculationType}.reduce.${operations.length + 1}`,
      kind: 'reduce-digits',
      operands: String(current).split('').map(Number),
      result: next,
    });
    intermediateValues.push(next);
    current = next;
  }
  const preservedMasterNumber = policy !== 'reduce' && isMaster(current) ? current : null;
  if (preservedMasterNumber)
    operations.push({
      id: `${calculationType}.master.${operations.length + 1}`,
      kind: 'preserve-master',
      operands: [current],
      result: current,
    });
  const baseValue = baseReduction(current);
  const decision: NumerologyMasterDecision = {
    baseValue,
    input: current,
    policy,
    preserved: preservedMasterNumber !== null,
    result: current,
  };
  return {
    baseValue,
    preservedMasterNumber,
    trace: {
      calculationType,
      finalValue: current,
      inputs,
      intermediateValues,
      masterNumberDecisions: [decision],
      operations,
      policy,
    },
    value: current,
  };
}

export function traceFromOperation(input: {
  calculationType: AdvancedNumerologyCalculationType;
  inputs: Readonly<Record<string, number>>;
  kind: NumerologyTraceOperation['kind'];
  operands: readonly number[];
  result: number;
  policy?: NumerologyMasterHandling;
}): NumerologyCalculationTrace {
  const reduced =
    input.policy === 'reduce' || input.calculationType === 'challenge'
      ? reduceWithPolicy(input.result, 'challenge', input.inputs)
      : reduceWithPolicy(input.result, input.calculationType, input.inputs);
  return {
    ...reduced.trace,
    operations: [
      {
        id: `${input.calculationType}.source`,
        kind: input.kind,
        operands: input.operands,
        result: input.result,
      },
      ...reduced.trace.operations,
    ],
  };
}
