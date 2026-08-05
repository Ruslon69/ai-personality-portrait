import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { loadReleaseConfig, validateReleaseConfig, validateReleaseTag } from './lib/release.mjs';

function git(rootDir, args) {
  try {
    return {
      ok: true,
      value: execFileSync('git', args, {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim(),
    };
  } catch {
    return { ok: false, value: '' };
  }
}

export function validateRepositoryReleaseState(rootDir, tag, options = {}) {
  const config = loadReleaseConfig(rootDir);
  const errors = [
    ...validateReleaseConfig(config, rootDir),
    ...validateReleaseTag(tag, config.tagPatterns),
  ];
  const head = git(rootDir, ['rev-parse', '--verify', 'HEAD']);
  if (!head.ok) errors.push('HEAD is not a valid commit.');
  if (!options.simulation) {
    const status = git(rootDir, ['status', '--porcelain']);
    if (!status.ok || status.value) errors.push('Working tree must be clean.');
    const branch = git(rootDir, ['branch', '--show-current']);
    if (!branch.ok || branch.value !== config.protectedBranch)
      errors.push(`Current branch must be ${config.protectedBranch}.`);
    const origin = git(rootDir, ['remote', 'get-url', 'origin']);
    if (!origin.ok || !origin.value) errors.push('Remote origin is required.');
    const upstream = git(rootDir, ['rev-parse', `origin/${config.protectedBranch}`]);
    if (!upstream.ok) errors.push(`origin/${config.protectedBranch} is unavailable.`);
    else {
      const liveRemote = origin.ok
        ? git(rootDir, [
            'ls-remote',
            '--exit-code',
            'origin',
            `refs/heads/${config.protectedBranch}`,
          ])
        : { ok: false, value: '' };
      const liveRemoteCommit = liveRemote.value.split(/\s+/)[0] ?? '';
      if (!liveRemote.ok || !liveRemoteCommit)
        errors.push(`Live origin/${config.protectedBranch} could not be verified.`);
      else if (liveRemoteCommit !== upstream.value)
        errors.push(`origin/${config.protectedBranch} tracking reference is stale; fetch first.`);
      const behind = git(rootDir, [
        'rev-list',
        '--count',
        `${head.value}..origin/${config.protectedBranch}`,
      ]);
      if (!behind.ok || Number(behind.value) > 0)
        errors.push(`${config.protectedBranch} is behind origin/${config.protectedBranch}.`);
    }
    if (git(rootDir, ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`]).ok)
      errors.push(`Tag already exists: ${tag}.`);
  }
  return errors;
}

const direct = process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename);
if (direct) {
  const tag = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
  const simulation = process.argv.includes('--simulate');
  const rootDir = resolve(import.meta.dirname, '..');
  const errors = validateRepositoryReleaseState(rootDir, tag ?? '', { simulation });
  if (errors.length) {
    errors.forEach((error) => process.stderr.write(`release-check: ${error}\n`));
    process.exitCode = 1;
  } else
    process.stdout.write(`Release preconditions passed${simulation ? ' (simulation)' : ''}.\n`);
}
