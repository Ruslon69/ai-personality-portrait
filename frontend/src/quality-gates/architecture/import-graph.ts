import { extname, resolve } from 'node:path';

import {
  projectPath,
  readSource,
  resolveInternalImport,
  walkSourceFiles,
} from '../utils/source-files';
import type { QualityGateFailure } from '../types';

type ImportEdge = { target: string; typeOnly: boolean };

const importPattern = /(?:import|export)\s+(type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;

function parseImports(source: string): readonly { specifier: string; typeOnly: boolean }[] {
  return [...source.matchAll(importPattern)].map((match) => ({
    specifier: match[2] ?? '',
    typeOnly: Boolean(match[1]),
  }));
}

export function analyzeImportGraph(rootDir: string): {
  cycles: readonly string[][];
  failures: readonly QualityGateFailure[];
  moduleCount: number;
} {
  const sourceRoot = resolve(rootDir, 'src');
  const files = walkSourceFiles(sourceRoot);
  const fileSet = new Set(files);
  const failures: QualityGateFailure[] = [];
  const graph = new Map<string, ImportEdge[]>();
  files.forEach((file) => {
    const edges: ImportEdge[] = [];
    parseImports(readSource(file)).forEach(({ specifier, typeOnly }) => {
      if (!specifier || /\.(?:css|scss|svg|png|jpg|json)$/.test(specifier)) return;
      const resolved = resolveInternalImport(sourceRoot, file, specifier);
      if (!resolved.internal) return;
      if (!resolved.path) {
        failures.push({
          code: 'unresolved-internal-import',
          file: projectPath(rootDir, file),
          message: `Internal import cannot be resolved: ${specifier}`,
          recommendation: 'Correct the alias or relative import before relying on cycle results.',
        });
        return;
      }
      if (typeOnly || !/\.(?:ts|tsx)$/.test(extname(resolved.path)) || !fileSet.has(resolved.path))
        return;
      edges.push({ target: resolved.path, typeOnly });
    });
    graph.set(file, edges);
  });

  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const signatures = new Set<string>();
  const visit = (file: string) => {
    if (visited.has(file)) return;
    visiting.add(file);
    stack.push(file);
    (graph.get(file) ?? []).forEach(({ target }) => {
      if (visiting.has(target)) {
        const start = stack.indexOf(target);
        const cycle = [...stack.slice(start), target].map((item) => projectPath(rootDir, item));
        const nodes = cycle.slice(0, -1);
        const signature = [...nodes].sort().join('|');
        if (!signatures.has(signature)) {
          signatures.add(signature);
          cycles.push(cycle);
        }
      } else visit(target);
    });
    stack.pop();
    visiting.delete(file);
    visited.add(file);
  };
  [...graph.keys()].sort().forEach(visit);
  return { cycles, failures, moduleCount: graph.size };
}

export function fakeModuleHasCycleOrUnresolved(input: {
  importer: string;
  sourceRoot: string;
  specifier: string;
}) {
  return (
    resolveInternalImport(input.sourceRoot, resolve(input.importer), input.specifier).path === null
  );
}
