import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const frontendDir = join(rootDir, 'frontend');
const distDir = join(frontendDir, 'dist');

function runBuild() {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: frontendDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error('Production build failed during reproducibility verification.');
  }
}

export function createBuildManifest(directory) {
  const manifest = [];
  const visit = (current) => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) visit(path);
      else {
        const content = readFileSync(path);
        manifest.push({
          bytes: content.length,
          path: relative(directory, path).split('\\').join('/'),
          sha256: createHash('sha256').update(content).digest('hex'),
        });
      }
    }
  };
  visit(directory);
  return manifest;
}

export function compareBuildManifests(first, second) {
  const firstShape = first.map(({ bytes, path }) => ({ bytes, path }));
  const secondShape = second.map(({ bytes, path }) => ({ bytes, path }));
  return {
    byteIdentical: JSON.stringify(first) === JSON.stringify(second),
    shapeIdentical: JSON.stringify(firstShape) === JSON.stringify(secondShape),
  };
}

runBuild();
const first = createBuildManifest(distDir);
runBuild();
const second = createBuildManifest(distDir);
const comparison = compareBuildManifests(first, second);
if (!comparison.shapeIdentical) {
  process.stderr.write(
    'Build reproducibility failed: file names or sizes changed between builds.\n',
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Build reproducibility passed (${second.length} files; byte-identical: ${comparison.byteIdentical ? 'yes' : 'no'}).\n`,
  );
}
