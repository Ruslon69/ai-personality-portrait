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
  const headers = read(rootDir, 'public/_headers');
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
        ) &&
        privacy.sections.some((section) =>
          section.paragraphs?.some((paragraph) => paragraph.includes('Cloudflare Pages')),
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
  const viteConfig = read(rootDir, 'vite.config.ts');
  assertions.assert(
    !envSource.includes("'http://127.0.0.1:8000'") &&
      envSource.includes("'VITE_API_BASE_URL', '/api'") &&
      envSource.includes("import.meta.env.PROD ? 'production' : 'development'"),
    {
      code: 'production-safe-environment-defaults',
      message: 'Production bundles must not retain a localhost API or development-mode fallback.',
    },
  );
  assertions.assert(
    viteConfig.includes('process.env.CF_PAGES_COMMIT_SHA') &&
      viteConfig.includes('process.env.VITE_APP_VERSION = cloudflareCommitSha'),
    {
      code: 'production-cloudflare-release-identifier',
      message:
        'Cloudflare builds must expose the injected commit SHA when no explicit public release version is supplied.',
    },
  );

  const csp = headers
    .split('\n')
    .find((line) => line.trimStart().startsWith('Content-Security-Policy:'));
  assertions.assert(
    Boolean(csp) &&
      csp?.includes("default-src 'self'") &&
      csp.includes("script-src 'self'") &&
      csp.includes("style-src 'self' 'unsafe-inline'") &&
      csp.includes("media-src 'self' blob:") &&
      csp.includes("connect-src 'self'") &&
      csp.includes("frame-ancestors 'none'") &&
      csp.includes("worker-src 'none'") &&
      !csp.includes('unsafe-eval') &&
      !csp.includes('*'),
    {
      code: 'production-cloudflare-csp',
      message:
        'Cloudflare Pages requires a bounded CSP matching same-origin application and local voice playback behavior.',
    },
  );
  assertions.assert(
    headers.includes('X-Content-Type-Options: nosniff') &&
      headers.includes('Referrer-Policy: strict-origin-when-cross-origin') &&
      headers.includes('X-Frame-Options: DENY') &&
      headers.includes('Permissions-Policy: microphone=(self), camera=(), geolocation=()'),
    {
      code: 'production-cloudflare-security-headers',
      message: 'Cloudflare Pages must enforce the reviewed security and browser permission policy.',
    },
  );
  assertions.assert(
    /\/index\.html\s+Cache-Control: no-cache/.test(headers) &&
      !/\/assets\/\*\s+Cache-Control:/.test(headers) &&
      !/\/index\.html\s+Cache-Control:[^\n]*immutable/.test(headers),
    {
      code: 'production-cloudflare-cache-policy',
      message:
        'Cloudflare Pages must revalidate the application document without an immutable asset wildcard that can cache SPA fallback HTML.',
    },
  );
  assertions.assert(
    !existsSync(resolve(rootDir, 'public/_redirects')) &&
      !existsSync(resolve(rootDir, 'public/404.html')) &&
      !existsSync(resolve(rootDir, 'public/_routes.json')) &&
      !existsSync(resolve(rootDir, 'public/_worker.js')) &&
      !existsSync(resolve(rootDir, 'functions')) &&
      !existsSync(resolve(rootDir, 'wrangler.toml')) &&
      !existsSync(resolve(rootDir, 'wrangler.json')) &&
      !existsSync(resolve(rootDir, 'wrangler.jsonc')) &&
      !existsSync(resolve(rootDir, 'vercel.json')) &&
      !existsSync(resolve(rootDir, 'netlify.toml')) &&
      !existsSync(resolve(rootDir, '../wrangler.toml')) &&
      !existsSync(resolve(rootDir, '../wrangler.json')) &&
      !existsSync(resolve(rootDir, '../wrangler.jsonc')) &&
      !existsSync(resolve(rootDir, '../vercel.json')) &&
      !existsSync(resolve(rootDir, '../netlify.toml')),
    {
      code: 'production-cloudflare-minimal-static-config',
      message:
        'The static Pages deployment must rely on native SPA fallback without Functions or foreign-host configuration.',
    },
  );

  const deployment = read(rootDir, '../docs/release-readiness.md');
  assertions.assert(
    deployment.includes('Cloudflare Pages deployment runbook') &&
      deployment.includes('| Root directory | `frontend` |') &&
      deployment.includes('| Build command | `npm run build` |') &&
      deployment.includes('CF_PAGES_COMMIT_SHA') &&
      deployment.includes('no `_redirects` file is required') &&
      deployment.includes('wildcard immutable rule') &&
      deployment.includes('Rollback to this deployment') &&
      deployment.includes('Product Storage V2 rollout'),
    {
      code: 'production-deployment-contract',
      message:
        'The Cloudflare runbook must cover build settings, native SPA fallback, versioning, caching, rollback and deferred V2.',
    },
  );

  return assertions.result({ fixtureCount: 23 });
}
