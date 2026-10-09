import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { QualityAssertions } from '../assertions';

function read(rootDir: string, path: string) {
  return readFileSync(resolve(rootDir, path), 'utf8');
}

function rule(source: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? '';
}

function baseRule(source: string, selector: string) {
  const baseSource = source.split('@media', 1)[0];
  const blocks = baseSource.matchAll(/([^{}]+)\{([^{}]*)\}/g);

  for (const block of blocks) {
    const selectors = block[1].split(',').map((candidate) => candidate.trim());
    if (selectors.includes(selector)) return block[2];
  }

  return '';
}

function hasResponsiveColumns(source: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `@media\\s*\\(min-width:[^)]+\\)\\s*\\{[\\s\\S]*?${escaped}\\s*\\{[^}]*grid-template-columns:`,
  ).test(source);
}

export function runVisualCompositionGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const variables = read(rootDir, 'src/styles/variables.css');
  const numerologyComponent = read(
    rootDir,
    'src/features/numerology/components/NumerologyForm.tsx',
  );
  const numerologyCss = read(rootDir, 'src/features/numerology/components/Numerology.module.css');
  const resultCss = read(
    rootDir,
    'src/features/personality-report/components/ResultReveal.module.css',
  );
  const previewCss = read(
    rootDir,
    'src/features/result-preview/components/ResultPreview.module.css',
  );
  const reportComponent = read(
    rootDir,
    'src/features/personality-report/components/PersonalizedReport.tsx',
  );
  const reportCss = read(
    rootDir,
    'src/features/personality-report/components/PersonalizedReport.module.css',
  );
  const sectionNav = read(
    rootDir,
    'src/features/personality-report/components/ReportSectionNav.tsx',
  );
  const sectionNavCss = read(
    rootDir,
    'src/features/personality-report/components/ReportSectionNav.module.css',
  );

  assertions.assert(
    sectionNav.includes('new ResizeObserver(measureHeader)') &&
      sectionNav.includes('observer.disconnect()') &&
      sectionNav.includes('const readingEdge =') &&
      sectionNav.includes("window.removeEventListener('scroll', scheduleUpdate)") &&
      sectionNavCss.includes('inset-block-start: var(--portrait-header-offset, 3.5rem)') &&
      reportCss.includes('scroll-margin-block-start: calc(var(--portrait-header-offset'),
    {
      code: 'portrait-navigation-header-clearance',
      message:
        'Portrait section navigation must follow the actual header height and release its observer on unmount.',
    },
  );

  assertions.assert(
    variables.includes('--result-hero-title-size:') &&
      variables.includes('--result-hero-title-max-width:') &&
      variables.includes('--result-hero-copy-width:'),
    {
      code: 'result-hero-shared-typography-contract',
      message: 'Result and preview heroes need shared responsive title and reading-width tokens.',
    },
  );

  [
    ['full result', resultCss],
    ['result preview', previewCss],
  ].forEach(([name, source]) => {
    const titleRule = rule(source, '.title');
    assertions.assert(
      (titleRule.includes('var(--result-hero-title-size)') ||
        /--page-title-size:\s*clamp\(2rem, 4vw, 3\.[78]rem\)/.test(titleRule)) &&
        titleRule.includes('var(--result-hero-title-max-width)') &&
        !titleRule.includes('var(--page-title-max-width)'),
      {
        code: 'result-hero-narrow-title-regression',
        message: `${name} must use the shared result-hero typography instead of the poster-width title token.`,
      },
    );
  });

  assertions.assert(
    !resultCss.includes('max-inline-size: 17ch') &&
      ['.grid', '.heroGrid'].every((selector, index) => {
        const base = baseRule(index === 0 ? resultCss : previewCss, selector);
        return (
          !base.includes('grid-template-columns:') ||
          base.includes('grid-template-columns: minmax(0, 1fr)')
        );
      }) &&
      hasResponsiveColumns(resultCss, '.grid') &&
      hasResponsiveColumns(previewCss, '.heroGrid'),
    {
      code: 'result-hero-responsive-composition',
      message: 'Result heroes must stack before their content tracks become narrow.',
    },
  );

  assertions.assert(
    numerologyComponent.includes('<svg className={styles.numberDiagram}') &&
      numerologyComponent.includes('<div aria-hidden="true" className={styles.numberHero}>'),
    {
      code: 'numerology-identity-diagram',
      message: 'The numerology hero must retain a decorative, semantic-free calculation diagram.',
    },
  );

  assertions.assert(
    rule(numerologyCss, '.hero h1').includes('--page-title-size: clamp(') &&
      rule(numerologyCss, '.hero h1').includes('max-inline-size:') &&
      !rule(numerologyCss, '.hero h1').includes('var(--page-title-max-width)') &&
      rule(numerologyCss, '.numberHero').includes('min-block-size: clamp(') &&
      !baseRule(numerologyCss, '.heroGrid').includes('grid-template-columns:') &&
      hasResponsiveColumns(numerologyCss, '.heroGrid'),
    {
      code: 'numerology-responsive-hero-composition',
      message: 'The numerology hero must use readable title width and stack at tablet widths.',
    },
  );

  assertions.assert(
    reportComponent.includes('aria-controls={`${contrast.id}-usual-panel`}') &&
      reportComponent.includes('aria-controls={`${contrast.id}-when-panel`}') &&
      reportComponent.includes('className={styles.contrastPanelLabel}'),
    {
      code: 'contrast-control-panel-relationship',
      message: 'Contrast controls must identify their corresponding comparison panels.',
    },
  );

  assertions.assert(
    rule(reportCss, '.contrastCard').includes('grid-template-rows:') &&
      rule(reportCss, '.contrastToggle').includes('grid-template-columns: repeat(2') &&
      reportCss.includes('.contrastMeaning > div'),
    {
      code: 'contrast-card-comparison-grid',
      message: 'Contrast cards must share aligned control, comparison, and guidance regions.',
    },
  );

  return assertions.result();
}
