import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, normalize, relative, resolve } from 'node:path';

export function walkSourceFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (directory: string) => {
    readdirSync(directory)
      .sort()
      .forEach((name) => {
        const path = join(directory, name);
        const status = statSync(path);
        if (status.isDirectory()) visit(path);
        else if (/\.(?:ts|tsx)$/.test(name)) files.push(path);
      });
  };
  visit(root);
  return files;
}

export function readSource(path: string) {
  return readFileSync(path, 'utf8');
}

export function projectPath(root: string, path: string) {
  return relative(root, path).split('\\').join('/');
}

const aliasRoots: Readonly<Record<string, string>> = {
  '@': '',
  '@app': 'app',
  '@assets': 'assets',
  '@config': 'config',
  '@entities': 'entities',
  '@features': 'features',
  '@hooks': 'hooks',
  '@pages': 'pages',
  '@router': 'router',
  '@services': 'services',
  '@shared': 'shared',
  '@store': 'store',
  '@styles': 'styles',
  '@types': 'types',
  '@utils': 'utils',
  '@widgets': 'widgets',
};

function resolveCandidate(path: string): string | null {
  const candidates = [
    path,
    `${path}.ts`,
    `${path}.tsx`,
    join(path, 'index.ts'),
    join(path, 'index.tsx'),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

export function resolveInternalImport(
  sourceRoot: string,
  importer: string,
  specifier: string,
): { internal: boolean; path: string | null } {
  if (specifier.startsWith('.')) {
    const resolved = resolveCandidate(resolve(importer, '..', specifier));
    return { internal: true, path: resolved };
  }
  const alias = Object.keys(aliasRoots)
    .sort((left, right) => right.length - left.length)
    .find((candidate) => specifier === candidate || specifier.startsWith(`${candidate}/`));
  if (!alias) return { internal: false, path: null };
  const suffix = specifier === alias ? '' : specifier.slice(alias.length + 1);
  const resolved = resolveCandidate(resolve(sourceRoot, aliasRoots[alias] ?? '', suffix));
  return { internal: true, path: resolved };
}

export function normalizedPath(path: string) {
  return normalize(path);
}
