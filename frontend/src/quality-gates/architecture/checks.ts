import { resolve } from 'node:path';

import { negativeQualityFixtures } from '../fixtures/negative-fixtures';
import { QualityAssertions } from '../assertions';
import { projectPath, readSource, walkSourceFiles } from '../utils/source-files';

type PatternRule = {
  code: string;
  pattern: RegExp;
  recommendation: string;
};

const domainRules: readonly PatternRule[] = [
  {
    code: 'react-in-domain',
    pattern: /(?:from\s+['"]react(?:\/[^'"]*)?['"]|\bReactNode\b|\bJSX\.Element\b)/,
    recommendation: 'Move React-facing types and adapters outside the domain module.',
  },
  {
    code: 'css-in-domain',
    pattern: /(?:import|export)[^'"\n]*['"][^'"]+\.(?:css|scss)['"]|@styles\//,
    recommendation: 'Domain modules must not depend on styles.',
  },
  {
    code: 'ui-layer-in-domain',
    pattern: /@(?:pages|widgets)\/|\/(?:components|pages|widgets)\//,
    recommendation: 'Use a domain adapter instead of importing a UI layer.',
  },
  {
    code: 'browser-api-in-domain',
    pattern: /\b(?:window|document)\./,
    recommendation: 'Inject browser behavior through an explicitly allowed runtime adapter.',
  },
  {
    code: 'storage-api-in-domain',
    pattern: /\b(?:localStorage|sessionStorage)\b/,
    recommendation: 'Use ProductStorageRepository or the isolated browser adapter.',
  },
  {
    code: 'network-in-domain',
    pattern: /\b(?:fetch|XMLHttpRequest|WebSocket)\b/,
    recommendation: 'Domain engines must remain local and network-independent.',
  },
  {
    code: 'random-in-domain',
    pattern: /\bMath\.random\b/,
    recommendation: 'Use the deterministic seeded utilities.',
  },
  {
    code: 'implicit-time-in-domain',
    pattern: /\bDate\.now\b/,
    recommendation: 'Pass timestamps into pure functions explicitly.',
  },
  {
    code: 'console-in-domain',
    pattern: /\bconsole\.log\b/,
    recommendation: 'Use the safe diagnostic abstraction outside pure modules.',
  },
];

const explicitlyBrowserBound = new Set([
  'src/features/product-storage/compatibility/browser-legacy-bridge.ts',
  'src/features/product-storage/repositories/browser-repository.ts',
  'src/features/product-storage/runtime/browser-runtime.ts',
]);

function domainFiles(rootDir: string) {
  const roots = [
    'src/features/expert-interpretation',
    'src/features/journey-memory',
    'src/features/product-storage',
    'src/features/numerology/lib',
    'src/features/tarot/data',
    'src/features/tarot/lib',
  ];
  return roots
    .flatMap((directory) => walkSourceFiles(resolve(rootDir, directory)))
    .filter((file) => {
      const path = projectPath(rootDir, file);
      return !path.includes('/fixtures/') && !path.endsWith('-runtime.ts');
    });
}

export function scanDomainText(source: string) {
  return domainRules.filter((rule) => rule.pattern.test(source));
}

export function runArchitectureBoundaryGate(rootDir: string) {
  const assertions = new QualityAssertions();
  domainFiles(rootDir).forEach((file) => {
    const path = projectPath(rootDir, file);
    const source = readSource(file);
    domainRules.forEach((rule) => {
      const allowedBrowserUse =
        explicitlyBrowserBound.has(path) &&
        ['browser-api-in-domain', 'storage-api-in-domain'].includes(rule.code);
      assertions.assert(allowedBrowserUse || !rule.pattern.test(source), {
        code: rule.code,
        file: path,
        message: `${rule.code} detected in a protected domain file.`,
        recommendation: rule.recommendation,
      });
    });
    if (path.includes('/types/')) {
      assertions.assert(!/(?:\bas\s+any\b|:\s*any\b|<any>)/.test(source), {
        code: 'explicit-any-in-domain-type',
        file: path,
        message: 'Explicit any detected in a domain type file.',
        recommendation: 'Use a typed union, generic, or unknown plus validation.',
      });
    }
  });
  const reactNegative = scanDomainText(negativeQualityFixtures.reactDomainImport);
  const storageNegative = scanDomainText(negativeQualityFixtures.localStoragePureModule);
  assertions.assert(
    reactNegative.some((rule) => rule.code === 'react-in-domain'),
    {
      code: 'negative-react-fixture-not-detected',
      message: 'Controlled React-import violation was not detected.',
    },
  );
  assertions.assert(
    storageNegative.some((rule) => rule.code === 'storage-api-in-domain'),
    {
      code: 'negative-storage-fixture-not-detected',
      message: 'Controlled localStorage violation was not detected.',
    },
  );
  const applicationFiles = walkSourceFiles(resolve(rootDir, 'src')).filter(
    (file) => !projectPath(rootDir, file).startsWith('src/quality-gates/'),
  );
  applicationFiles.forEach((file) =>
    assertions.assert(
      !/from\s+['"][^'"]*quality-gates|import\(['"][^'"]*quality-gates/.test(readSource(file)),
      {
        code: 'quality-gate-imported-by-application',
        file: projectPath(rootDir, file),
        message: 'Production application code imports the validation-only quality-gates module.',
      },
    ),
  );
  [
    'src/features/expert-interpretation/index.ts',
    'src/features/journey-memory/index.ts',
    'src/features/product-storage/index.ts',
  ].forEach((path) =>
    assertions.assert(
      !/export\s+\*\s+from\s+['"]\.\/fixtures['"]/.test(readSource(resolve(rootDir, path))),
      {
        code: 'fixture-exported-from-production-barrel',
        file: path,
        message: 'Runtime fixture helpers are exported from a production feature barrel.',
      },
    ),
  );
  return assertions.result();
}

export function runForbiddenPatternsGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const sourceRoot = resolve(rootDir, 'src');
  const files = walkSourceFiles(sourceRoot).filter(
    (file) => !projectPath(rootDir, file).startsWith('src/quality-gates/'),
  );
  const legacyStorageAllowlist = new Set([
    'src/app/providers/theme/ThemeProvider.tsx',
    'src/features/tarot/model/tarot-session.ts',
    'src/shared/lib/storage/storage.ts',
  ]);
  files.forEach((file) => {
    const path = projectPath(rootDir, file);
    const source = readSource(file);
    assertions.assert(!/\bconsole\.log\b/.test(source), {
      code: 'console-log',
      file: path,
      message: 'console.log is not allowed in frontend source.',
      recommendation: 'Use the existing logger abstraction.',
    });
    assertions.assert(!/@ts-ignore\b/.test(source), {
      code: 'ts-ignore',
      file: path,
      message: '@ts-ignore bypasses the type gate.',
      recommendation: 'Model the type explicitly or use a validated unknown value.',
    });
    const disables = [...source.matchAll(/eslint-disable([^\n]*)/g)];
    assertions.assert(
      disables.every((match) => /--\s*\S/.test(match[1] ?? '')),
      {
        code: 'unexplained-eslint-disable',
        file: path,
        message: 'eslint-disable requires an inline explanation after --.',
      },
    );
    if (/\b(?:localStorage|sessionStorage)\b/.test(source))
      assertions.assert(legacyStorageAllowlist.has(path) || explicitlyBrowserBound.has(path), {
        code: 'direct-storage-outside-adapter',
        file: path,
        message: 'Direct browser storage access is outside the approved adapters/legacy baseline.',
      });
    if (/\b(?:fetch|XMLHttpRequest|WebSocket)\b/.test(source))
      assertions.assert(path.startsWith('src/shared/lib/api/'), {
        code: 'network-outside-api-client',
        file: path,
        message: 'Network primitive is outside the approved API client boundary.',
      });
    if (/['"](?:app:|ui-theme)/.test(source) && !path.includes('/fixtures/'))
      assertions.assert(
        path === 'src/features/product-storage/constants/index.ts' ||
          path === 'src/app/providers/theme/ThemeProvider.tsx',
        {
          code: 'hardcoded-storage-key',
          file: path,
          message: 'Storage key is outside centralized constants or the documented theme baseline.',
        },
      );
  });
  return assertions.result();
}
