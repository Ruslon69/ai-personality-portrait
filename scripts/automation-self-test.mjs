import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { loadReleaseConfig, validateReleaseConfig, validateReleaseTag } from './lib/release.mjs';
import { validateRepositoryReleaseState } from './release-preconditions.mjs';

const rootDir = resolve(import.meta.dirname, '..');
const config = loadReleaseConfig(rootDir);
const frontendDir = join(rootDir, 'frontend');
const assertions = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  assertions.push(message);
};

assert(validateReleaseTag('sprint-6', config.tagPatterns).length === 0, 'valid release tag');
assert(validateReleaseTag('sprint-6;touch-x', config.tagPatterns).length > 0, 'unsafe release tag');
assert(validateReleaseTag('', config.tagPatterns).length > 0, 'empty release tag');
assert(
  validateReleaseConfig({ ...config, maturity: 'production' }, rootDir).length > 0,
  'invalid release metadata',
);

const lintFixture = join(frontendDir, `automation-lint-fixture-${process.pid}`);
try {
  mkdirSync(lintFixture);
  const lintFile = join(lintFixture, 'invalid.js');
  writeFileSync(lintFile, 'const invalid = ;\n');
  const lintResult = spawnSync(join(frontendDir, 'node_modules', '.bin', 'eslint'), [lintFile], {
    cwd: frontendDir,
    stdio: 'pipe',
  });
  assert(lintResult.status !== 0, 'lint failure fixture');
} finally {
  rmSync(lintFixture, { force: true, recursive: true });
}

const temp = mkdtempSync(join(tmpdir(), 'release-hardening-'));
try {
  mkdirSync(join(temp, 'repo'));
  execFileSync('git', ['init', '-q'], { cwd: join(temp, 'repo') });
  execFileSync('git', ['branch', '-M', 'main'], { cwd: join(temp, 'repo') });
  execFileSync('git', ['config', 'user.email', 'fixture@example.invalid'], {
    cwd: join(temp, 'repo'),
  });
  execFileSync('git', ['config', 'user.name', 'Fixture'], { cwd: join(temp, 'repo') });
  mkdirSync(join(temp, 'repo', '.release'));
  writeFileSync(join(temp, 'repo', '.release', 'config.json'), `${JSON.stringify(config)}\n`);
  writeFileSync(join(temp, 'repo', '.nvmrc'), '24.18.0\n');
  writeFileSync(join(temp, 'repo', '.python-version'), '3.11\n');
  writeFileSync(join(temp, 'repo', 'tracked.txt'), 'clean\n');
  execFileSync('git', ['add', '.'], { cwd: join(temp, 'repo') });
  execFileSync('git', ['commit', '-qm', 'test: fixture'], { cwd: join(temp, 'repo') });
  const missingOrigin = (() => {
    try {
      execFileSync('git', ['remote', 'get-url', 'origin'], {
        cwd: join(temp, 'repo'),
        stdio: 'pipe',
      });
      return false;
    } catch {
      return true;
    }
  })();
  assert(missingOrigin, 'missing origin');
  writeFileSync(join(temp, 'repo', 'tracked.txt'), 'dirty\n');
  const releaseErrors = validateRepositoryReleaseState(join(temp, 'repo'), 'sprint-6');
  assert(releaseErrors.includes('Working tree must be clean.'), 'dirty worktree');
  assert(releaseErrors.includes('Remote origin is required.'), 'release check missing origin');
} finally {
  rmSync(temp, { force: true, recursive: true });
}

process.stdout.write(`Automation failure simulations passed (${assertions.length} assertions).\n`);
