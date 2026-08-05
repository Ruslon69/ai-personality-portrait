import type { QualityGateRunSummary } from '../types';

const statusLabel = {
  failed: 'FAIL',
  passed: 'PASS',
  skipped: 'SKIP',
  warning: 'WARN',
} as const;

function line(title: string, status: keyof typeof statusLabel, duration: number, slow: boolean) {
  const dots = '.'.repeat(Math.max(2, 30 - title.length));
  return `${title} ${dots} ${statusLabel[status]}  ${duration.toFixed(2)}ms${slow ? '  SLOW' : ''}`;
}

export function formatTerminalReport(summary: QualityGateRunSummary) {
  const output = ['QUALITY GATES', ''];
  summary.results.forEach((result) => {
    output.push(line(result.title, result.status, result.duration, result.metadata.slow));
    result.failures.forEach((failure) => {
      const location = failure.file
        ? `${failure.file}${failure.line ? `:${failure.line}` : ''}: `
        : '';
      output.push(`  - ${failure.code}: ${location}${failure.message}`);
      if (failure.expected !== undefined || failure.actual !== undefined)
        output.push(`    expected=${failure.expected ?? '-'} actual=${failure.actual ?? '-'}`);
      if (failure.recommendation) output.push(`    recommendation: ${failure.recommendation}`);
    });
    result.warnings.forEach((warning) =>
      output.push(
        `  - ${warning.code}: ${warning.file ? `${warning.file}: ` : ''}${warning.message}`,
      ),
    );
  });
  output.push(
    '',
    `${summary.fixtures} fixtures`,
    `${summary.assertions} assertions`,
    `${summary.failures} failures`,
    `${summary.warnings} warnings`,
    `${summary.skipped} skipped`,
    `${summary.duration.toFixed(2)}ms duration`,
    '',
    summary.passed ? 'QUALITY GATES PASSED' : 'QUALITY GATES FAILED',
  );
  return output.join('\n');
}
