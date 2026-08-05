import { performance } from 'node:perf_hooks';

import type {
  QualityGateDefinition,
  QualityGateExecution,
  QualityGateFilter,
  QualityGateRunSummary,
  QualityGateSuiteResult,
} from '../types';

function selected(gate: QualityGateDefinition, filter: QualityGateFilter) {
  const groupMatch = !filter.groups?.length || filter.groups.includes(gate.group);
  const tagMatch = !filter.tags?.length || filter.tags.some((tag) => gate.tags.includes(tag));
  return groupMatch && tagMatch;
}

function timeout<T>(promise: Promise<T>, milliseconds: number, gateId: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${gateId} exceeded ${milliseconds}ms timeout.`)),
      milliseconds,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

function skippedResult(gate: QualityGateDefinition, now: string): QualityGateSuiteResult {
  return {
    assertions: 0,
    duration: 0,
    failures: [],
    finishedAt: now,
    fixtures: 0,
    group: gate.group,
    id: gate.id,
    metadata: {
      affectedModules: gate.affectedModules,
      moduleVersions: {},
      slow: false,
      tags: gate.tags,
    },
    required: gate.required,
    severity: gate.severity,
    skipped: true,
    startedAt: now,
    status: 'skipped',
    title: gate.title,
    warnings: [],
  };
}

export async function runQualityGateRegistry(input: {
  filter?: QualityGateFilter;
  gates: readonly QualityGateDefinition[];
  rootDir: string;
}): Promise<QualityGateRunSummary> {
  const runStartedAt = new Date().toISOString();
  const runStarted = performance.now();
  const results: QualityGateSuiteResult[] = [];
  let fatalStopped = false;
  for (const gate of input.gates) {
    if (!selected(gate, input.filter ?? {})) continue;
    if (fatalStopped) {
      results.push(skippedResult(gate, new Date().toISOString()));
      continue;
    }
    const startedAt = new Date().toISOString();
    const started = performance.now();
    let execution: QualityGateExecution;
    try {
      execution = await timeout(
        Promise.resolve(gate.runner({ rootDir: input.rootDir })),
        gate.timeout,
        gate.id,
      );
    } catch (caught) {
      execution = {
        assertions: 0,
        failures: [
          {
            code: 'gate-exception',
            message: caught instanceof Error ? caught.message : String(caught),
            recommendation: 'Run the individual gate and inspect its exception path.',
          },
        ],
      };
    }
    const failures = [...(execution.failures ?? [])];
    if (
      gate.expectedAssertionCount !== undefined &&
      execution.assertions < gate.expectedAssertionCount
    )
      failures.push({
        actual: execution.assertions,
        code: 'registry-assertion-regression',
        expected: gate.expectedAssertionCount,
        message: `${gate.id} returned fewer assertions than its registry baseline.`,
      });
    const warnings = execution.warnings ?? [];
    const status = execution.skipped
      ? 'skipped'
      : failures.length
        ? 'failed'
        : warnings.length
          ? 'warning'
          : 'passed';
    const duration = Math.round((performance.now() - started) * 100) / 100;
    results.push({
      assertions: execution.assertions,
      duration,
      failures,
      finishedAt: new Date().toISOString(),
      fixtures: execution.fixtureCount ?? 0,
      group: gate.group,
      id: gate.id,
      metadata: {
        affectedModules: gate.affectedModules,
        moduleVersions: execution.moduleVersions ?? {},
        slow: duration >= 250,
        tags: gate.tags,
      },
      required: gate.required,
      severity: gate.severity,
      skipped: execution.skipped ?? false,
      startedAt,
      status,
      title: gate.title,
      warnings,
    });
    if (gate.severity === 'fatal' && status !== 'passed') fatalStopped = true;
  }
  if (results.length === 0) {
    const timestamp = new Date().toISOString();
    results.push({
      assertions: 0,
      duration: 0,
      failures: [
        {
          code: 'empty-quality-selection',
          message: 'The supplied group/tag filter did not select any registered quality gate.',
          recommendation: 'Use a group or tag declared in the typed quality registry.',
        },
      ],
      finishedAt: timestamp,
      fixtures: 0,
      group: 'regression',
      id: 'quality-filter',
      metadata: { affectedModules: [], moduleVersions: {}, slow: false, tags: [] },
      required: true,
      severity: 'fatal',
      skipped: false,
      startedAt: timestamp,
      status: 'failed',
      title: 'Quality Filter',
      warnings: [],
    });
  }
  const moduleVersions = Object.assign({}, ...results.map((item) => item.metadata.moduleVersions));
  const requiredPassed = results.every(
    (result) =>
      result.status === 'passed' ||
      (!result.required && (result.status === 'skipped' || result.status === 'warning')),
  );
  return {
    assertions: results.reduce((sum, result) => sum + result.assertions, 0),
    duration: Math.round((performance.now() - runStarted) * 100) / 100,
    failures: results.reduce((sum, result) => sum + result.failures.length, 0),
    finishedAt: new Date().toISOString(),
    fixtures: results.reduce((sum, result) => sum + result.fixtures, 0),
    moduleVersions,
    passed: requiredPassed,
    results,
    skipped: results.filter((result) => result.skipped).length,
    startedAt: runStartedAt,
    warnings: results.reduce((sum, result) => sum + result.warnings.length, 0),
  };
}
