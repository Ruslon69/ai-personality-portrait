import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { QualityGateRunSummary } from '../types';

export function writeQualityJsonReport(
  rootDir: string,
  summary: QualityGateRunSummary,
  requestedPath?: string,
) {
  const path = resolve(rootDir, requestedPath || 'reports/quality-gates.json');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  return path;
}
