import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const jsonOnly = process.argv.includes('--json');
const base = process.argv.find((argument) => argument.startsWith('--base='))?.slice(7);

function git(args) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

const changed = new Set([
  ...git(['diff', '--name-only', ...(base ? [`${base}...HEAD`] : ['HEAD'])]),
  ...git(['diff', '--name-only', '--cached']),
  ...git(['ls-files', '--others', '--exclude-standard']),
]);

const flags = {
  backend: false,
  ci: false,
  dependencies: false,
  documentation: false,
  domain: false,
  storage: false,
  visual: false,
};
for (const file of changed) {
  if (file.startsWith('backend/')) flags.backend = true;
  if (file.startsWith('.github/') || file.startsWith('scripts/') || file.startsWith('.release/'))
    flags.ci = true;
  if (/package-lock\.json$|(?:^|\/)requirements[^/]*\.txt$|(?:^|\/)pyproject\.toml$/.test(file))
    flags.dependencies = true;
  if (file === 'frontend/package.json') flags.dependencies = true;
  if (/^(?:docs\/|README)|\.md$/.test(file)) flags.documentation = true;
  if (/\.css$|\.scss$|\/components\/|\/pages\/|\/routes?\/|\/assets\//.test(file))
    flags.visual = true;
  if (/product-storage|journey-memory|\/store\//.test(file)) flags.storage = true;
  if (/frontend\/src\/(?:features|entities|store|quality-gates)\//.test(file) && !flags.visual)
    flags.domain = true;
}
const active = Object.entries(flags)
  .filter(([, enabled]) => enabled)
  .map(([name]) => name);
let classification =
  active.length === 0 ? 'domain-only' : active.length === 1 ? active[0] : 'mixed';
if (classification === 'domain') classification = 'domain-only';
const recommendations = {
  backend: ['backend lint, format, import, and health smoke'],
  ci: ['full local check and workflow validation'],
  dependencies: ['full audit and lockfile review'],
  documentation: ['documentation review'],
  'domain-only': ['npm run quality:domain'],
  mixed: ['full ./scripts/check.sh'],
  storage: ['npm run quality:storage'],
  visual: ['manual visual QA plus full automated check'],
};
const result = {
  changedFiles: [...changed].sort(),
  classification,
  flags,
  recommendations: recommendations[classification] ?? recommendations.mixed,
};

if (jsonOnly) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
else {
  process.stdout.write(`Change classification: ${classification}\n`);
  process.stdout.write(`Changed files: ${result.changedFiles.length}\n`);
  for (const recommendation of result.recommendations)
    process.stdout.write(`Recommended: ${recommendation}\n`);
}
