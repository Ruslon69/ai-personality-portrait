import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const selfPath = 'scripts/repo-hygiene.mjs';
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.py',
  '.sh',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

function extension(path) {
  const name = basename(path);
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index) : '';
}

export function forbiddenTrackedPath(path) {
  return (
    /(^|\/)(?:node_modules|dist|\.venv|__pycache__|\.ruff_cache|\.pytest_cache|reports)(\/|$)/.test(
      path,
    ) ||
    (/(^|\/)\.env(?:\..+)?$/.test(path) && !path.endsWith('.env.example')) ||
    /(^|\/)(?:\.DS_Store|[^/]+\.(?:swp|swo|tmp|bak|orig))$/.test(path)
  );
}

export function secretCategory(text) {
  const lower = text.toLowerCase();
  if (/example|fake|dummy|placeholder|changeme|your[_-]|test[_-]?only/.test(lower)) return null;
  const privateKeyMarker = ['-----BEGIN ', 'PRIVATE KEY-----'].join('');
  if (text.includes(privateKeyMarker)) return 'private-key';
  if (/\bAKIA[A-Z0-9]{16}\b/.test(text)) return 'aws-access-key';
  if (/\bgh[pousr]_[A-Za-z0-9]{20,}\b/.test(text)) return 'github-token';
  if (/\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/.test(text)) return 'api-token';
  if (
    /(?:api[_-]?key|auth[_-]?token|client[_-]?secret)\s*[:=]\s*['"]?[A-Za-z0-9_./+-]{16,}/i.test(
      text,
    )
  )
    return 'generic-secret';
  return null;
}

export function scanRepositoryFiles(paths) {
  const violations = [];
  const caseMap = new Map();
  for (const path of paths) {
    if (forbiddenTrackedPath(path))
      violations.push({ category: 'generated-or-private-file', path });
    const lower = path.toLowerCase();
    const previous = caseMap.get(lower);
    if (previous && previous !== path)
      violations.push({ category: 'case-collision', path: `${previous} / ${path}` });
    else caseMap.set(lower, path);
    const absolute = resolve(rootDir, path);
    // A tracked path can be absent while a dirty worktree records a legitimate
    // deletion or move. Git validates that change; hygiene scans only files
    // that are present in the candidate tree.
    if (!existsSync(absolute)) continue;
    const size = statSync(absolute).size;
    if (size > 5 * 1024 * 1024) violations.push({ category: 'large-file', path });
    if (!textExtensions.has(extension(path))) continue;
    let content;
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(absolute));
    } catch {
      violations.push({ category: 'non-utf8-source', path });
      continue;
    }
    if (/[ \t]+$/m.test(content)) violations.push({ category: 'trailing-whitespace', path });
    if (path === selfPath) continue;
    if (/^(?:<<<<<<<|=======|>>>>>>>)(?: |$)/m.test(content))
      violations.push({ category: 'merge-marker', path });
    if (/\bdebugger\s*;/.test(content) || /\bconsole\.(?:log|debug)\s*\(/.test(content))
      violations.push({ category: 'debug-code', path });
    if (
      /\b(?:TODO|FIXME|HACK)\b/.test(content) &&
      !/\b(?:TODO|FIXME|HACK)(?:\([^)]+\)|:\s*[^\n]{8,})/.test(content)
    )
      violations.push({ category: 'unowned-todo', path });
    if (
      /^\s*\/\/\s*(?:const|let|function|import|export|return|class|if\s*\(|for\s*\()/m.test(content)
    )
      violations.push({ category: 'commented-out-code', path });
    for (const line of content.split('\n')) {
      const category = secretCategory(line);
      if (category) {
        violations.push({ category, path });
        break;
      }
    }
  }
  return violations;
}

function runSelfTest() {
  const directory = mkdtempSync(join(tmpdir(), 'repository-hygiene-'));
  try {
    const environment = join(directory, '.env');
    const privateKey = join(directory, 'private.pem');
    const swap = join(directory, 'file.swp');
    writeFileSync(environment, 'TOKEN=fixture\n');
    writeFileSync(privateKey, ['-----BEGIN ', 'PRIVATE KEY-----\nfixture\n'].join(''));
    writeFileSync(swap, 'fixture\n');
    const checks = [
      forbiddenTrackedPath('.env'),
      forbiddenTrackedPath('file.swp'),
      secretCategory(readFileSync(privateKey, 'utf8')) === 'private-key',
    ];
    if (!checks.every(Boolean)) throw new Error('Hygiene negative fixture was not detected.');
    process.stdout.write('Repository hygiene failure simulations passed.\n');
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

if (process.argv.includes('--self-test')) runSelfTest();
else {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: rootDir }).toString('utf8');
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
    cwd: rootDir,
  }).toString('utf8');
  const files = [...new Set(`${tracked}${untracked}`.split('\0').filter(Boolean))].sort();
  const violations = scanRepositoryFiles(files);
  if (violations.length) {
    for (const violation of violations)
      process.stderr.write(`repository-hygiene: ${violation.category}: ${violation.path}\n`);
    process.exitCode = 1;
  } else process.stdout.write(`Repository hygiene passed (${files.length} repository files).\n`);
}
