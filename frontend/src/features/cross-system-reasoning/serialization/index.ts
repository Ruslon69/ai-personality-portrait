import type { CrossSystemResult, CrossSystemValidationError } from '../types';
import { stableCrossSystemStringify } from '../utils';
import { validateCrossSystemResult } from '../validation';

export type CrossSystemDeserializationResult =
  | { result: CrossSystemResult; status: 'success' }
  | { errors: readonly CrossSystemValidationError[]; status: 'validation-error' }
  | { message: string; status: 'syntax-error' };

export function serializeCrossSystemResult(result: CrossSystemResult): string {
  const validation = validateCrossSystemResult(result);
  if (!validation.valid)
    throw new Error(`Cannot serialize invalid CrossSystemResult: ${validation.errors[0]?.code}.`);
  return stableCrossSystemStringify(result);
}

export function deserializeCrossSystemResult(value: string): CrossSystemDeserializationResult {
  try {
    const result = JSON.parse(value) as CrossSystemResult;
    const validation = validateCrossSystemResult(result);
    return validation.valid
      ? { result, status: 'success' }
      : { errors: validation.errors, status: 'validation-error' };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Invalid CrossSystemResult JSON.',
      status: 'syntax-error',
    };
  }
}
