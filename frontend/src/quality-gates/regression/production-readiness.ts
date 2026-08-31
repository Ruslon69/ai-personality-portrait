import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getLocalizedUserSettingsData } from '../../features/user-settings/data';
import { privacyPolicyCopy, termsCopy } from '../../pages/legal/legal-copy';
import { resolveRouteDocumentMetadata } from '../../router/route-metadata';
import { resolveRoute } from '../../router/routes';
import { productBrand, ROUTES } from '../../shared/config';
import type { Locale } from '../../shared/i18n';
import { QualityAssertions } from '../assertions';

function read(rootDir: string, path: string) {
  return readFileSync(resolve(rootDir, path), 'utf8');
}

export function runProductionReadinessGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const locales: readonly Locale[] = ['ru', 'en', 'uk'];
  const publicPaths = [
    ROUTES.home,
    ROUTES.tarot,
    ROUTES.numerology,
    ROUTES.portrait,
    ROUTES.privacy,
    ROUTES.terms,
  ];
  const privatePaths = [
    ROUTES.compatibility,
    ROUTES.numerologyProfile,
    ROUTES.numerologyResult,
    ROUTES.portraitBirthDate,
    ROUTES.portraitGenerating,
    ROUTES.portraitQuestions,
    ROUTES.portraitResult,
    ROUTES.portraitResultPreview,
    ROUTES.portraitVoice,
    ROUTES.profile,
    ROUTES.profileHistory,
    ROUTES.settings,
    ROUTES.tarotHistory,
    ROUTES.tarotReading,
    ROUTES.tarotResult,
  ];

  assertions.assert(
    productBrand.name === 'Soul Arkana' &&
      productBrand.displayName === 'SOUL ARKANA' &&
      productBrand.tagline === 'The answers are already within.',
    {
      code: 'production-canonical-brand',
      message: 'Production metadata requires the canonical Soul Arkana brand values.',
    },
  );

  locales.forEach((locale) => {
    const publicMetadata = publicPaths.map((path) => resolveRouteDocumentMetadata(path, locale));
    assertions.assert(
      publicMetadata.every(
        (metadata) =>
          metadata.robots === 'index, follow' && metadata.title.endsWith(` · ${productBrand.name}`),
      ) && new Set(publicMetadata.map(({ title }) => title)).size === publicPaths.length,
      {
        code: `production-public-route-metadata-${locale}`,
        message: `Public ${locale} routes require distinct product titles and indexable metadata.`,
      },
    );

    assertions.assert(
      [...privatePaths, '/unknown'].every(
        (path) => resolveRouteDocumentMetadata(path, locale).robots === 'noindex, nofollow',
      ),
      {
        code: `production-private-route-metadata-${locale}`,
        message: `Private, volatile and unknown ${locale} routes must remain non-indexable.`,
      },
    );
  });

  const html = read(rootDir, 'index.html');
  const robots = read(rootDir, 'public/robots.txt');
  const publicRuntimeCopy = [
    html,
    read(rootDir, 'src/pages/home/HomePage.tsx'),
    read(rootDir, 'src/router/route-metadata.ts'),
    read(rootDir, 'src/shared/i18n/locales/en.ts'),
    read(rootDir, 'src/shared/i18n/locales/ru.ts'),
    read(rootDir, 'src/shared/i18n/locales/uk.ts'),
    read(rootDir, 'src/widgets/header/Header.tsx'),
  ].join('\n');
  assertions.assert(
    html.includes(productBrand.name) &&
      html.includes(productBrand.tagline) &&
      !html.includes('AI Personality Portrait') &&
      html.includes('name="description"') &&
      html.includes('property="og:title"') &&
      html.includes('name="twitter:card"') &&
      html.includes('name="twitter:title"') &&
      html.includes('href="/favicon.svg"') &&
      existsSync(resolve(rootDir, 'public/favicon.svg')),
    {
      code: 'production-document-metadata-assets',
      message: 'The production document requires descriptive metadata and a local favicon.',
    },
  );
  assertions.assert(!publicRuntimeCopy.includes('AI Personality Portrait'), {
    code: 'production-obsolete-public-brand',
    message: 'The former working name must not leak into public runtime metadata or copy.',
  });

  assertions.assert(
    resolveRoute(ROUTES.privacy).path === ROUTES.privacy &&
      resolveRoute(ROUTES.terms).path === ROUTES.terms,
    {
      code: 'production-legal-routes',
      message: 'Privacy and Terms must resolve through the actual application router.',
    },
  );

  const publicShell = [
    read(rootDir, 'src/app/App.tsx'),
    read(rootDir, 'src/app/layout/Layout.tsx'),
    read(rootDir, 'src/router/RouterOutlet.tsx'),
    read(rootDir, 'src/widgets/footer/Footer.tsx'),
    read(rootDir, 'src/widgets/header/Header.tsx'),
  ].join('\n');
  assertions.assert(!/CookieBanner|CookieConsent/.test(publicShell), {
    code: 'production-no-unjustified-cookie-banner',
    message: 'The public shell must not introduce a consent banner while no tracking exists.',
  });

  locales.forEach((locale) => {
    const privacy = privacyPolicyCopy[locale];
    const terms = termsCopy[locale];
    assertions.assert(
      privacy.sections.length >= 6 &&
        terms.sections.length >= 5 &&
        privacy.ownerNotice.length > 0 &&
        terms.ownerNotice.length > 0 &&
        privacy.sections.some((section) =>
          section.paragraphs?.some((paragraph) => /microphone|микрофон|мікрофон/i.test(paragraph)),
        ) &&
        privacy.sections.some((section) =>
          section.paragraphs?.some((paragraph) => /analytics|аналитик|аналітик/i.test(paragraph)),
        ),
      {
        code: `production-legal-content-${locale}`,
        message: `Privacy and Terms require equivalent substantive ${locale} content and explicit owner placeholders.`,
      },
    );
  });

  assertions.assert(
    locales.every(
      (locale) =>
        Object.keys(getLocalizedUserSettingsData(locale)).join(',') === 'appearanceOptions',
    ),
    {
      code: 'production-settings-no-fake-data-rights',
      message:
        'Settings data must not expose demonstrational consent, export, invitation or deletion actions.',
    },
  );

  const voiceHook = read(rootDir, 'src/features/voice-recording/hooks/useVoiceRecording.ts');
  assertions.assert(
    voiceHook.includes('navigator.mediaDevices.getUserMedia') &&
      voiceHook.includes('URL.createObjectURL(blob)') &&
      voiceHook.includes('revokeObjectUrl(objectUrlRef.current)') &&
      !voiceHook.includes('localStorage') &&
      !voiceHook.includes('sessionStorage') &&
      !voiceHook.includes('fetch('),
    {
      code: 'production-voice-privacy-contract',
      message:
        'Voice capture must remain user-triggered, memory-only, locally released and free from upload calls.',
    },
  );
  assertions.assert(
    privatePaths.every((path) => robots.includes(`Disallow: ${path}`)),
    {
      code: 'production-private-route-robots',
      message: 'Robots policy must exclude every persisted or volatile result route.',
    },
  );

  const envSource = read(rootDir, 'src/shared/config/env.ts');
  assertions.assert(
    !envSource.includes("'http://127.0.0.1:8000'") &&
      envSource.includes("'VITE_API_BASE_URL', '/api'") &&
      envSource.includes("import.meta.env.PROD ? 'production' : 'development'"),
    {
      code: 'production-safe-environment-defaults',
      message: 'Production bundles must not retain a localhost API or development-mode fallback.',
    },
  );

  const deployment = read(rootDir, '../docs/release-readiness.md');
  assertions.assert(
    deployment.includes('rewrite application routes to `/index.html`') &&
      deployment.includes("Content-Security-Policy: default-src 'self'") &&
      deployment.includes('max-age=31536000, immutable') &&
      deployment.includes('Product Storage V2 rollout'),
    {
      code: 'production-deployment-contract',
      message:
        'Deployment requirements must cover SPA fallback, CSP, cache policy and deferred V2.',
    },
  );

  return assertions.result({ fixtureCount: 18 });
}
