import type { InterpretationResult } from '../types';
import { validateInterpretationResult } from '../validation';

function assertResultShape(value: unknown): asserts value is InterpretationResult {
  if (!value || typeof value !== 'object')
    throw new Error('Serialized interpretation is not an object.');
  const candidate = value as Partial<InterpretationResult>;
  if (
    !Array.isArray(candidate.evidence) ||
    !Array.isArray(candidate.connections) ||
    !Array.isArray(candidate.themes) ||
    !Array.isArray(candidate.sections) ||
    !candidate.metadata
  ) {
    throw new Error('Serialized interpretation has an invalid structure.');
  }
}

export function serializeInterpretationResult(result: InterpretationResult) {
  const report = validateInterpretationResult(result);
  if (!report.valid) {
    throw new Error(
      `Cannot serialize invalid interpretation: ${report.errors[0]?.message ?? 'unknown error'}`,
    );
  }
  return JSON.stringify(result);
}

export function deserializeInterpretationResult(serialized: string): InterpretationResult {
  const parsed: unknown = JSON.parse(serialized);
  assertResultShape(parsed);
  const report = validateInterpretationResult(parsed);
  if (!report.valid) {
    throw new Error(
      `Invalid serialized interpretation: ${report.errors[0]?.message ?? 'unknown error'}`,
    );
  }
  return parsed;
}
