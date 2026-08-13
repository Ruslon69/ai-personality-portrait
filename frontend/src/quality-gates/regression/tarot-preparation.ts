import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { QualityAssertions } from '../assertions';

export function runTarotPreparationGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const scriptRoot = resolve(rootDir, 'scripts/premium-tarot');
  const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
  const gitignore = readFileSync(resolve(rootDir, '..', '.gitignore'), 'utf8');
  const prepareSource = readFileSync(resolve(scriptRoot, 'prepare-lib.mjs'), 'utf8');
  const processSource = readFileSync(resolve(scriptRoot, 'golden-process.mjs'), 'utf8');
  const studioTemplate = readFileSync(
    resolve(rootDir, 'premium-production/golden-master/studio-template.html'),
    'utf8',
  );
  const result = JSON.parse(
    execFileSync(process.execPath, [resolve(scriptRoot, 'test-preparation.mjs'), '--json'], {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .at(-1) ?? '{}',
  );

  assertions.assert(
    result.passed === true &&
      result.assertions >= 15 &&
      result.pipelineVersion === 'premium-tarot-preparation-v1' &&
      result.canonicalTarget === '1680x2880' &&
      result.realCase === '973x1616 -> 1680x2880',
    {
      actual: result,
      code: 'premium-preparation-regressions',
      message: 'Deterministic preparation fixtures must cover the real source class and gates.',
    },
  );
  assertions.assert(
    packageJson.scripts['tarot:premium:prepare']?.includes('prepare.mjs') &&
      packageJson.scripts['tarot:premium:golden-process']?.includes('golden-process.mjs') &&
      processSource.includes('golden-import.mjs') &&
      processSource.includes('golden-review.mjs'),
    {
      code: 'premium-preparation-command-chain',
      message: 'Golden processing must prepare, import, and generate the studio without approval.',
    },
  );
  assertions.assert(
    prepareSource.includes('MAX_CROP_FRACTION = 0.04') &&
      prepareSource.includes('force_original_aspect_ratio=increase') &&
      prepareSource.includes('flags=lanczos') &&
      prepareSource.includes('trueSuperResolution'),
    {
      code: 'premium-preparation-quality-contract',
      message:
        'Preparation must crop conservatively, never stretch, and label resampling honestly.',
    },
  );
  assertions.assert(
    studioTemplate.includes('Source resolution') &&
      studioTemplate.includes('Prepared resolution') &&
      studioTemplate.includes('Preparation version') &&
      studioTemplate.includes(
        'Candidate source was below Golden Master native resolution and was upscaled.',
      ),
    {
      code: 'premium-preparation-review-provenance',
      message: 'Comparison Studio must expose preparation lineage and the upsample warning.',
    },
  );
  assertions.assert(
    gitignore.includes('frontend/premium-production/prepared/') &&
      !prepareSource.includes('fetch(') &&
      !prepareSource.includes('node_modules') &&
      !processSource.includes('golden-approve'),
    {
      code: 'premium-preparation-isolation',
      message: 'Preparation must remain ignored, offline, dependency-free, and non-approving.',
    },
  );

  return assertions.result({ fixtureCount: result.assertions });
}
