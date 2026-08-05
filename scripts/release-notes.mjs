import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const argument = (name) =>
  process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const requestedSince = argument('since');
const output = argument('output');

function git(args, fallback = '') {
  try {
    return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

const previousTag = requestedSince ?? git(['describe', '--tags', '--abbrev=0'], null);
const range = previousTag ? `${previousTag}..HEAD` : 'HEAD';
const rawCommits = git(['log', range, '--pretty=format:%H%x1f%s']);
const commits = rawCommits
  ? rawCommits.split('\n').map((line) => {
      const [hash = '', subject = ''] = line.split('\x1f');
      const prefix = subject.match(/^([a-z]+)(?:\([^)]+\))?!?:/)?.[1] ?? 'other';
      return { hash, prefix, subject };
    })
  : [];
const groups = Object.fromEntries(
  [...new Set(commits.map((commit) => commit.prefix))]
    .sort()
    .map((prefix) => [prefix, commits.filter((commit) => commit.prefix === prefix)]),
);
const changedAreas = [
  ...new Set(
    git(['diff', '--name-only', range])
      .split('\n')
      .filter(Boolean)
      .map((file) => file.split('/')[0] ?? file),
  ),
].sort();
const draft = {
  buildStatus: 'not-run',
  changedAreas,
  commitCount: commits.length,
  groups,
  previousTag,
  qualityCommand: 'npm run quality',
  range,
  schemaVersion: 'release-notes-draft-v1',
};
const json = `${JSON.stringify(draft, null, 2)}\n`;
if (output) {
  const path = resolve(rootDir, output);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, json, 'utf8');
  process.stdout.write(`Release notes metadata: ${path}\n`);
} else process.stdout.write(json);
