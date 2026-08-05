import { resolve } from 'node:path';

import { qualityGateRegistry } from './registry';
import { formatTerminalReport, writeQualityJsonReport } from './reporters';
import { runQualityGateRegistry } from './runners/run-registry';
import type { QualityGateFilter, QualityGateGroup } from './types';

function valueArgument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function listArgument(name: string) {
  return valueArgument(name)
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseFilter(): QualityGateFilter {
  const groups = listArgument('group') as QualityGateGroup[] | undefined;
  const tags = listArgument('tag');
  return {
    ...(groups?.length ? { groups } : {}),
    ...(tags?.length ? { tags } : {}),
  };
}

function reportRequest() {
  const argument = valueArgument('report');
  if (argument) return argument;
  if (process.argv.includes('--report')) return 'reports/quality-gates.json';
  const environment = process.env.QUALITY_REPORT;
  if (!environment) return null;
  return environment === 'true' ? 'reports/quality-gates.json' : environment;
}

const asynchronousFailures: string[] = [];
const onUnhandledRejection = (reason: unknown) => {
  asynchronousFailures.push(`unhandled-rejection: ${String(reason)}`);
};
const onUncaughtException = (error: Error) => {
  asynchronousFailures.push(`uncaught-exception: ${error.message}`);
};
process.on('unhandledRejection', onUnhandledRejection);
process.on('uncaughtException', onUncaughtException);

const rootDir = resolve(process.cwd());
const summary = await runQualityGateRegistry({
  filter: parseFilter(),
  gates: qualityGateRegistry,
  rootDir,
});
await new Promise<void>((resolvePromise) => setImmediate(resolvePromise));
process.removeListener('unhandledRejection', onUnhandledRejection);
process.removeListener('uncaughtException', onUncaughtException);

process.stdout.write(`${formatTerminalReport(summary)}\n`);
const requestedReport = reportRequest();
if (requestedReport) {
  const path = writeQualityJsonReport(rootDir, summary, requestedReport);
  process.stdout.write(`JSON report: ${path}\n`);
}
if (asynchronousFailures.length) {
  asynchronousFailures.forEach((failure) =>
    process.stderr.write(`QUALITY ASYNC FAILURE: ${failure}\n`),
  );
}
if (!summary.passed || asynchronousFailures.length) process.exitCode = 1;
