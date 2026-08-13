import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const workflows = ['.github/workflows/ci.yml', '.github/workflows/release-check.yml'];
const errors = [];

for (const path of workflows) {
  const content = readFileSync(resolve(rootDir, path), 'utf8');
  if (/\t/.test(content)) errors.push(`${path}: tabs are not valid indentation.`);
  if (!/^name:\s*\S/m.test(content) || !/^on:/m.test(content) || !/^jobs:/m.test(content))
    errors.push(`${path}: required top-level name/on/jobs keys are missing.`);
  if (!/^permissions:\n\s{2}contents: read$/m.test(content))
    errors.push(`${path}: minimal contents: read permission is required.`);
  if (
    /pull_request_target|permissions:[\s\S]{0,100}(?:write|write-all)|git push|gh release/i.test(
      content,
    )
  )
    errors.push(`${path}: unsafe trigger, permission, or publishing command detected.`);
  for (const match of content.matchAll(/uses:\s*([^\s]+)/g)) {
    if (
      !/^actions\/(?:checkout|setup-node|setup-python|upload-artifact)@v\d+$/.test(match[1] ?? '')
    )
      errors.push(`${path}: unapproved or unpinned action detected.`);
  }
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const spaces = line.match(/^ */)?.[0].length ?? 0;
    if (line.trim() && spaces % 2 !== 0) errors.push(`${path}:${index + 1}: odd indentation.`);
    if (/[ \t]+$/.test(line)) errors.push(`${path}:${index + 1}: trailing whitespace.`);
  }
}

const ci = readFileSync(resolve(rootDir, workflows[0]), 'utf8');
const release = readFileSync(resolve(rootDir, workflows[1]), 'utf8');
for (const required of [
  'branches: [main]',
  'pull_request:',
  'workflow_dispatch:',
  'npm ci',
  'npm run quality -- --report=reports/quality-gates.json',
  'npm audit --omit=dev',
  'Install and verify FFmpeg',
  'sudo bash ../scripts/install-ci-media-tools.sh',
  'ruff format --check .',
  'python ../scripts/backend-health-smoke.py',
]) {
  if (!ci.includes(required)) errors.push(`ci.yml: required control is missing: ${required}`);
}
for (const required of [
  "- 'sprint-*'",
  "- 'v*'",
  'fetch-depth: 0',
  'node scripts/release-metadata.mjs validate-tag "$RELEASE_TAG"',
  'git merge-base --is-ancestor "$GITHUB_SHA" origin/main',
  'node scripts/build-reproducibility.mjs',
  'frontend/dist',
  'Install and verify FFmpeg',
  'sudo bash scripts/install-ci-media-tools.sh',
]) {
  if (!release.includes(required))
    errors.push(`release-check.yml: required control is missing: ${required}`);
}

if (errors.length) {
  errors.forEach((error) => process.stderr.write(`workflow-validation: ${error}\n`));
  process.exitCode = 1;
} else process.stdout.write('GitHub workflow structure and security checks passed.\n');
