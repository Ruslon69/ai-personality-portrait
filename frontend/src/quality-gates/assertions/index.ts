import type { QualityGateExecution, QualityGateFailure, QualityGateWarning } from '../types';

export class QualityAssertions {
  private count = 0;
  private readonly failures: QualityGateFailure[] = [];
  private readonly warnings: QualityGateWarning[] = [];

  assert(condition: unknown, failure: Omit<QualityGateFailure, 'code'> & { code?: string }) {
    this.count += 1;
    if (!condition)
      this.failures.push({
        ...failure,
        code: failure.code ?? 'assertion-failed',
      });
  }

  warn(condition: unknown, warning: QualityGateWarning) {
    this.count += 1;
    if (!condition) this.warnings.push(warning);
  }

  result(
    options: {
      fixtureCount?: number;
      moduleVersions?: Readonly<Record<string, string>>;
    } = {},
  ): QualityGateExecution {
    return {
      assertions: this.count,
      failures: this.failures,
      fixtureCount: options.fixtureCount,
      moduleVersions: options.moduleVersions,
      warnings: this.warnings,
    };
  }
}
