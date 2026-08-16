import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { QualityAssertions } from '../assertions';
import { QUALITY_BASELINE } from '../fixtures/baseline';

type BundleAsset = { content: string; path: string; size: number };

function collectAssets(directory: string): BundleAsset[] {
  const assets: BundleAsset[] = [];
  const visit = (current: string) => {
    readdirSync(current)
      .sort()
      .forEach((name) => {
        const path = join(current, name);
        if (statSync(path).isDirectory()) visit(path);
        else
          assets.push({
            content: /\.(?:js|html|css)$/.test(path) ? readFileSync(path, 'utf8') : '',
            path: relative(directory, path).split('\\').join('/'),
            size: statSync(path).size,
          });
      });
  };
  visit(directory);
  return assets;
}

export function bundleViolations(assets: readonly BundleAsset[]) {
  const violations: string[] = [];
  const javascript = assets.filter((asset) => asset.path.endsWith('.js'));
  const initial = javascript.filter((asset) => /^assets\/index-[^/]+\.js$/.test(asset.path));
  if (initial.length !== 1) violations.push('exactly-one-initial-javascript-chunk-required');
  if (initial.some((asset) => asset.size > QUALITY_BASELINE.bundle.maximumInitialJavaScriptBytes))
    violations.push('initial-javascript-threshold-exceeded');
  if (javascript.some((asset) => asset.size > QUALITY_BASELINE.bundle.maximumJavaScriptAssetBytes))
    violations.push('javascript-asset-threshold-exceeded');
  if (!javascript.some((asset) => /^assets\/tarot-[^/]+\.js$/.test(asset.path)))
    violations.push('tarot-route-chunk-missing');
  if (!javascript.some((asset) => /^assets\/numerology-[^/]+\.js$/.test(asset.path)))
    violations.push('numerology-route-chunk-missing');
  if (assets.some((asset) => asset.path.endsWith('.map'))) violations.push('source-map-published');
  const combined = assets.map((asset) => asset.content).join('\n');
  if (
    /QUALITY GATES|negativeQualityFixtures|storage-fixture-seed-v1|activation-first-launch-empty/.test(
      combined,
    )
  )
    violations.push('test-or-quality-module-in-bundle');
  if (/\/(?:Users|home)\/[^/\s]+|[A-Z]:\\Users\\/i.test(combined))
    violations.push('personal-path-in-bundle');
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(combined))
    violations.push('secret-pattern-in-bundle');
  const storageMarkerAssets = javascript.filter((asset) =>
    asset.content.includes('app:product-storage-v2'),
  );
  const entryDocument = assets.find((asset) => asset.path === 'index.html')?.content ?? '';
  const storageRuntimePath = storageMarkerAssets[0]?.path;
  const storageRuntimeIsInitial =
    storageRuntimePath?.startsWith('assets/index-') ||
    (storageRuntimePath !== undefined &&
      entryDocument.includes(`rel="modulepreload" crossorigin href="/${storageRuntimePath}"`));
  if (storageMarkerAssets.length !== 1 || !storageRuntimeIsInitial)
    violations.push('product-storage-browser-adapter-boundary');
  return violations;
}

export function runBundleBoundaryGate(rootDir: string) {
  const dist = resolve(rootDir, 'dist');
  const assertions = new QualityAssertions();
  assertions.assert(existsSync(dist), {
    code: 'production-build-missing',
    file: 'dist',
    message: 'Production build is required before bundle boundaries can be verified.',
    recommendation: 'Run npm run build before the quality suite.',
  });
  if (!existsSync(dist)) return assertions.result();
  const assets = collectAssets(dist);
  const violations = bundleViolations(assets);
  assertions.assert(violations.length === 0, {
    actual: violations.join(', ') || 'none',
    code: 'bundle-boundary',
    expected: 'none',
    file: 'dist',
    message: 'Production bundle violates a size, splitting, privacy, or test-module boundary.',
    recommendation: 'Inspect the named bundle violation before changing the approved threshold.',
  });
  const oversizedFixture = [{ content: '', path: 'assets/index-fixture.js', size: 700_000 }];
  assertions.assert(
    bundleViolations(oversizedFixture).includes('initial-javascript-threshold-exceeded'),
    {
      code: 'negative-oversized-bundle-not-detected',
      message: 'Controlled oversized initial chunk was not rejected.',
    },
  );
  const testModuleFixture = [
    { content: 'QUALITY GATES', path: 'assets/index-fixture.js', size: 10 },
  ];
  assertions.assert(
    bundleViolations(testModuleFixture).includes('test-or-quality-module-in-bundle'),
    {
      code: 'negative-test-module-bundle-not-detected',
      message: 'Controlled quality-module bundle leak was not rejected.',
    },
  );
  return assertions.result();
}
