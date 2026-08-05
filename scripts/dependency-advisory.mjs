import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const frontendDir = join(rootDir, 'frontend');
const reportPath = join(frontendDir, 'reports', 'dependency-advisory.json');

function npmJson(args) {
  const result = spawnSync('npm', args, { cwd: frontendDir, encoding: 'utf8' });
  try {
    return JSON.parse(result.stdout || '{}');
  } catch {
    throw new Error(`npm ${args.join(' ')} did not return valid JSON.`);
  }
}

const audit = npmJson(['audit', '--json']);
const productionAudit = npmJson(['audit', '--omit=dev', '--json']);
const explanation = npmJson(['explain', 'brace-expansion', '--json']);
const advisory = audit.vulnerabilities?.['brace-expansion'];
const productionAdvisory = productionAudit.vulnerabilities?.['brace-expansion'];
const instances = Array.isArray(explanation) ? explanation : [];
const report = {
  generatedBy: 'dependency-advisory-v1',
  auditAvailable: !audit.error,
  auditError: audit.error ? 'registry-audit-unavailable' : null,
  package: 'brace-expansion',
  currentVersions: [...new Set(instances.map((item) => item.version).filter(Boolean))].sort(),
  severity: advisory?.severity ?? (audit.error ? 'unknown' : 'none'),
  direct: advisory?.isDirect ?? false,
  productionAffected: Boolean(productionAdvisory),
  dependencyPaths: instances.map((item) => ({
    dev: item.dev === true,
    location: item.location,
    parent: item.dependents?.[0]?.from?.name ?? item.dependents?.[0]?.name ?? null,
  })),
  observedToolingChain: ['eslint', 'minimatch', 'brace-expansion'],
  fixAvailable: audit.error ? null : Boolean(advisory?.fixAvailable),
  minimumPatchedVersion: '5.0.9',
  recommendation: audit.error
    ? 'rerun-with-registry-access'
    : productionAdvisory
      ? 'review-required'
      : advisory?.fixAvailable
        ? 'safe-patch-available-dev-only'
        : 'safe-to-defer-dev-only',
  constraints: {
    dependencyFilesChanged: false,
    forceFixAllowed: false,
  },
};
mkdirSync(join(frontendDir, 'reports'), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
const formatter = spawnSync(
  join(frontendDir, 'node_modules', '.bin', 'prettier'),
  ['--config', join(rootDir, '.prettierrc'), '--ignore-path', '/dev/null', '--write', reportPath],
  { encoding: 'utf8' },
);
if (formatter.status !== 0)
  throw new Error('Dependency advisory report could not be formatted deterministically.');
process.stdout.write(`${reportPath}\n`);
