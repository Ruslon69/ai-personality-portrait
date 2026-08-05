import { composeCrossSystemResult } from '../composition';
import type {
  CrossSystemInput,
  CrossSystemReasoningProvider,
  CrossSystemResult,
  CrossSystemValidationReport,
} from '../types';
import { validateCrossSystemResult } from '../validation';

export class LocalCrossSystemReasoningProvider implements CrossSystemReasoningProvider {
  reason(input: CrossSystemInput): CrossSystemResult {
    return composeCrossSystemResult(input);
  }

  validate(result: CrossSystemResult): CrossSystemValidationReport {
    return validateCrossSystemResult(result);
  }
}

export const localCrossSystemReasoningProvider = new LocalCrossSystemReasoningProvider();
