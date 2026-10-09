import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TarotLanding } from '../../features/tarot/components/TarotLanding';
import { TarotSpreadIcon } from '../../features/tarot/components/TarotSpreadIcon';
import { tarotCopy, tarotSpreads } from '../../features/tarot/data';
import { normalizeNumerologyBirthDate } from '../../features/numerology/model/numerology-session';
import { getInterestLabel } from '../../features/personality-analysis/data/personalization';
import { getLocalizedUserSettingsData, userSettingsCopy } from '../../features/user-settings/data';
import { voiceRecordingCopy } from '../../features/voice-recording/data';
import { validateAudioQuality } from '../../features/voice-recording/utils';
import { productContractCopy } from '../../shared/i18n/product-contract-copy';
import { BrandIdentity } from '../../shared/ui/brand/BrandIdentity';
import { QualityAssertions } from '../assertions';

function read(rootDir: string, path: string) {
  return readFileSync(resolve(rootDir, path), 'utf8');
}

export function runCrossProductConsistencyGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const globals = read(rootDir, 'src/styles/globals.css');
  const colors = read(rootDir, 'src/styles/tokens/colors.css');
  const layout = read(rootDir, 'src/app/layout/Layout.tsx');
  const layoutCss = read(rootDir, 'src/app/layout/Layout.module.css');
  const home = read(rootDir, 'src/pages/home/HomePage.tsx');
  const homeCss = read(rootDir, 'src/pages/home/HomePage.module.css');
  const header = read(rootDir, 'src/widgets/header/Header.tsx');
  const headerCss = read(rootDir, 'src/widgets/header/Header.module.css');
  const tarotEntryCss = read(rootDir, 'src/features/tarot/components/TarotEntry.module.css');
  const tarotResultCss = read(rootDir, 'src/features/tarot/components/TarotResult.module.css');
  const spreadSelectorCss = read(
    rootDir,
    'src/features/tarot/components/TarotSpreadSelector.module.css',
  );
  const portraitRecoveryCss = read(
    rootDir,
    'src/features/personality-report/components/PortraitResultBoundary.module.css',
  );
  const interestsCss = read(
    rootDir,
    'src/features/questionnaire/components/InterestStep.module.css',
  );
  const favicon = read(rootDir, 'public/favicon.svg');
  const sidebar = read(rootDir, 'src/widgets/sidebar/Sidebar.tsx');
  const notFound = read(rootDir, 'src/pages/not-found/NotFoundPage.tsx');
  const userSettings = read(rootDir, 'src/features/user-settings/components/UserSettings.tsx');
  const settingsPage = read(rootDir, 'src/pages/settings/SettingsPage.tsx');
  const locales = [
    read(rootDir, 'src/shared/i18n/locales/ru.ts'),
    read(rootDir, 'src/shared/i18n/locales/en.ts'),
    read(rootDir, 'src/shared/i18n/locales/uk.ts'),
  ];

  assertions.assert(
    colors.includes('--sa-text-secondary: light-dark(#60566c, #c3bdce)') &&
      colors.includes('--color-text-muted: var(--sa-text-secondary)') &&
      /@media \(forced-colors: active\)[\s\S]*--sa-text-secondary: CanvasText/.test(colors),
    {
      code: 'shared-muted-copy-contrast',
      message:
        'Shared supporting copy must use the accepted readable light/dark palette, retaining system colors in forced-colors mode.',
    },
  );
  assertions.assert(
    /@media \(forced-colors: active\)[\s\S]*\.interest input\s*\{[^}]*position:\s*static[^}]*opacity:\s*1/s.test(
      interestsCss,
    ) &&
      /\.content h1\s*\{[^}]*max-inline-size:\s*100%[^}]*overflow-wrap:\s*anywhere/s.test(
        portraitRecoveryCss,
      ),
    {
      code: 'portrait-native-high-contrast-and-recovery-copy',
      message:
        'Interests must expose native checked controls in forced colors, and localized recovery titles must not clip at enlarged text sizes.',
    },
  );

  assertions.assert(
    layout.includes('<Header') &&
      layout.includes('<Sidebar') &&
      layout.includes('<Main>') &&
      layout.includes('<Footer'),
    {
      code: 'shared-application-shell',
      message:
        'All application routes must retain the shared header, main, sidebar and footer shell.',
    },
  );

  assertions.assert(
    /\.root\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s.test(layoutCss) &&
      /\.inner\s*\{[^}]*flex-wrap:\s*wrap/s.test(headerCss) &&
      /\.leading\s*\{[^}]*min-inline-size:\s*2\.75rem/s.test(headerCss) &&
      /\.actions\s*\{[^}]*max-inline-size:\s*100%[^}]*flex-wrap:\s*wrap/s.test(headerCss),
    {
      code: 'shared-shell-enlarged-text-reflow',
      message:
        'The shared shell must constrain its grid and wrap header tools without losing the brand or Settings at enlarged text sizes.',
    },
  );
  assertions.assert(
    homeCss.includes('min-inline-size: min(100%, 13rem)') &&
      tarotEntryCss.includes('min-inline-size: min(100%, 15rem)') &&
      /\.heroCopy\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s.test(homeCss) &&
      /\.spreadCardContent\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*overflow-wrap:\s*anywhere/s.test(
        spreadSelectorCss,
      ) &&
      /\.content\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*overflow-wrap:\s*anywhere/s.test(
        portraitRecoveryCss,
      ),
    {
      code: 'entry-and-recovery-enlarged-text-reflow',
      message:
        'Entry actions, spread labels and Portrait recovery copy must fit their available width at 200% text without clipping.',
    },
  );
  assertions.assert(
    /\[data-setup-options\] label > span\s*\{[^}]*min-inline-size:\s*0[^}]*overflow-wrap:\s*anywhere/s.test(
      tarotEntryCss,
    ) &&
      /\.interpretationCard\s*\{[^}]*container-type:\s*inline-size/s.test(tarotResultCss) &&
      tarotResultCss.includes('@container (max-width: 17rem)') &&
      /\.interpretationTitle\s*\{[^}]*grid-column:\s*1 \/ -1[^}]*grid-row:\s*2/s.test(
        tarotResultCss,
      ),
    {
      code: 'tarot-long-copy-enlarged-text-reflow',
      message:
        'Long setup answers and expanded Tarot card copy must reflow at enlarged text sizes without altering ordinary reading layouts.',
    },
  );
  for (const [path, selector] of [
    ['src/features/questionnaire/components/InterestStep.module.css', 'content'],
    ['src/features/birth-date/components/BirthDateStep.module.css', 'form'],
  ]) {
    assertions.assert(
      new RegExp(
        `\\.${selector}\\s*\\{[^}]*grid-template-columns:\\s*minmax\\(0, 1fr\\)[^}]*overflow-wrap:\\s*anywhere`,
        's',
      ).test(read(rootDir, path)),
      {
        code: `portrait-${selector}-enlarged-text-reflow`,
        message:
          'Portrait interests and birth-date controls must remain within the available width with enlarged localized copy.',
      },
    );
  }

  const brandCss = read(rootDir, 'src/shared/ui/brand/BrandIdentity.module.css');
  const compactMark = read(rootDir, 'public/brand/compact-mark.svg');
  const master = readFileSync(resolve(rootDir, 'home-artwork/soul-arkana-logo-master.png'));
  assertions.assert(
    createHash('sha256').update(master).digest('hex') ===
      '3348881ae02ab8f2f5c0eabd797a71cdacfe8a22f6f4ee18c8598707508afb4a' &&
      compactMark === read(rootDir, 'brand-artwork/compact-mark.svg') &&
      compactMark.match(/<(?:rect|path)\b[^>]*\/>/g)?.every((shape) => favicon.includes(shape)),
    {
      code: 'soul-arkana-approved-master-and-compact-geometry',
      message:
        'The approved raster master must remain byte-identical; header and favicon must use the same authored card/crescent/star geometry.',
    },
  );
  assertions.assert(
    header.includes('<BrandIdentity decorative variant="header" />') &&
      header.includes('aria-label={appConfig.brand.name}') &&
      !header.includes('logoFlame') &&
      !headerCss.includes('@keyframes') &&
      !brandCss.includes('animation:') &&
      brandCss.includes('@media (prefers-reduced-motion: reduce)') &&
      brandCss.includes('@media (forced-colors: active)') &&
      brandCss.includes('[data-image-failed]') &&
      headerCss.includes('[data-brand-wordmark]'),
    {
      code: 'soul-arkana-responsive-brand-contract',
      message:
        'One named shared identity must replace the candle logo with static, accessible, image-failure-safe responsive branding.',
    },
  );
  for (const variant of ['full', 'header', 'compact'] as const) {
    const markup = renderToStaticMarkup(createElement(BrandIdentity, { variant }));
    assertions.assert(
      (markup.match(/aria-label="Soul Arkana"/g) ?? []).length === 1 &&
        markup.includes('alt=""') &&
        markup.includes('SOUL ARKANA</span>') &&
        (variant === 'full'
          ? markup.includes('emblem-384.webp') && markup.includes('loading="lazy"')
          : markup.includes('/brand/compact-mark.svg') && !markup.includes('.webp')),
      {
        code: `soul-arkana-brand-render-${variant}`,
        message:
          'Brand variants must provide one accessible name and real text, keeping large raster artwork out of the header.',
      },
    );
  }
  const brandPngs = [
    [16, 'favicon-16.png', '8db0111981a0b5dfee80de0d2696435a059cf504c4254c51d4dd1c8d51729025'],
    [32, 'favicon-32.png', '827fdebe6198a4e9598d2a2c29b70213ab94e483910635f63376a6929ce10613'],
    [48, 'favicon-48.png', '12a02c242da64ccc7d84357e3648e99bb460d87c007afee0a288ef8632ff26d0'],
    [180, 'app-mark-180.png', '828f538acae7230d5c2fab3f33ed10ec9ac1ed8299ae55b78220a40bbcf074df'],
  ] as const;
  for (const [size, file, hash] of brandPngs) {
    const bytes = readFileSync(resolve(rootDir, 'public/brand', file));
    assertions.assert(
      bytes.toString('ascii', 1, 4) === 'PNG' &&
        bytes.readUInt32BE(16) === size &&
        bytes.readUInt32BE(20) === size &&
        createHash('sha256').update(bytes).digest('hex') === hash,
      {
        code: `soul-arkana-favicon-${size}`,
        message:
          'Favicon derivatives must retain the full verified symbol at their declared native dimensions.',
      },
    );
  }
  assertions.assert(
    readdirSync(resolve(rootDir, 'public/brand')).length === 7 &&
      Buffer.byteLength(compactMark) < 1500 &&
      readdirSync(resolve(rootDir, 'public/brand')).every(
        (name) => !/master|source|qa/i.test(name),
      ),
    {
      code: 'soul-arkana-brand-payload',
      message:
        'Production branding must contain only intentional small derivatives, never master or QA artwork.',
    },
  );

  assertions.assert(
    layout.includes('isUtility || !isMarketing || currentPath === ROUTES.tarotReading') &&
      header.includes('(showSettings ?? !isMarketing)') &&
      !headerCss.includes('.settingsAction {\n    display: none;'),
    {
      code: 'tarot-reading-header-tools-contract',
      message:
        'The immersive Tarot reading header must retain language, theme and settings access at desktop and mobile sizes.',
    },
  );

  assertions.assert(
    header.includes('href={ROUTES.home}') &&
      header.includes('navigate(ROUTES.home)') &&
      sidebar.includes('href={item.path}') &&
      sidebar.includes('navigate(item.path)') &&
      !home.includes('navigate(ROUTES.profile') &&
      !home.includes('hasResults'),
    {
      code: 'public-home-navigation-contract',
      message:
        'Brand and sidebar Home links must resolve to the public landing page without a saved-results redirect.',
    },
  );

  assertions.assert(
    home.includes('/home/tarot-hero-1280.webp') &&
      home.includes('/home/tarot-hero-mobile-640.webp') &&
      home.includes('fetchPriority="high"') &&
      home.includes('loading="lazy"') &&
      home.includes('srcSet=') &&
      !home.includes('className={styles.heroNumber}') &&
      homeCss.includes('mask-image:') &&
      homeCss.includes('@media (prefers-reduced-motion: reduce)') &&
      homeCss.includes('@media (forced-colors: active)'),
    {
      code: 'landing-approved-responsive-artwork-contract',
      message:
        'Home must use the supplied cinematic Tarot artwork with responsive selection, priority loading, blended edges and accessible static modes.',
    },
  );

  const homeAssets = readdirSync(resolve(rootDir, 'public/home'));
  const expectedHomeAssets = [
    'tarot-hero-1280.webp',
    'tarot-hero-1672.webp',
    'tarot-hero-mobile-640.webp',
    'tarot-hero-mobile-960.webp',
    'cosmic-background-800.webp',
    'cosmic-background-1440.webp',
    'numerology-home-480.webp',
    'numerology-home-960.webp',
    'portrait-home-480.webp',
    'portrait-home-960.webp',
    'celestial-divider-640.webp',
  ];
  const homeAssetBuffers = expectedHomeAssets.map((file) =>
    readFileSync(resolve(rootDir, 'public/home', file)),
  );
  assertions.assert(
    homeAssets.length === expectedHomeAssets.length &&
      homeAssetBuffers.every(
        (buffer) =>
          buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
      ) &&
      homeAssetBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0) < 1_800_000,
    {
      code: 'home-artwork-production-budget',
      message:
        'Home must ship only the selected WebP variants under the 1.8 MB aggregate budget, never original PNG/QA/experimental assets.',
    },
  );
  const routerOutlet = read(rootDir, 'src/router/RouterOutlet.tsx');
  const entryAssets = readdirSync(resolve(rootDir, 'public/tarot-entry'));
  const entryFiles = [
    'tarot-entry-960.webp',
    'tarot-entry-1536.webp',
    'tarot-entry-mobile-640.webp',
    'tarot-entry-mobile-960.webp',
  ];
  const entryBuffers = entryFiles.map((file) =>
    readFileSync(resolve(rootDir, 'public/tarot-entry', file)),
  );
  assertions.assert(
    entryAssets.length === entryFiles.length &&
      entryBuffers.every(
        (buffer) =>
          buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
      ) &&
      entryBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0) < 1_200_000,
    {
      code: 'tarot-entry-artwork-budget',
      message:
        'Tarot Entry must ship only its four optimized WebP derivatives, never the original PNG or QA files.',
    },
  );
  for (const locale of ['ru', 'en', 'uk'] as const) {
    const html = renderToStaticMarkup(
      createElement(TarotLanding, {
        locale,
        confirmNewReading: true,
        hasUnfinishedReading: false,
        onOpenHistory() {},
        onOpenSettings() {},
        onResume() {},
        onStart() {},
      }),
    );
    assertions.assert(
      (html.match(/type="radio"/g) ?? []).length === 8 &&
        (html.match(/<h1\b/g) ?? []).length === 1 &&
        html.includes('data-spread="day"') &&
        html.includes('data-spread="decision"') &&
        html.includes('fetchPriority="high"') &&
        html.includes('tarot-entry-mobile-640.webp') &&
        html.includes(locale === 'en' ? '1 card' : '1 карта') &&
        !html.includes('heroCards'),
      {
        code: `tarot-entry-render-contract-${locale}`,
        message:
          'Rendered entry must preserve all eight native radio choices, one heading, responsive original artwork and natural singular card count.',
      },
    );
    const selectorHeading = html.match(/<h2\b[^>]*id="spread-title"[^>]*>([^<]+)<\/h2>/);
    assertions.assert(
      selectorHeading?.[1] === tarotCopy[locale].chooseDirection &&
        (selectorHeading?.index ?? Infinity) <
          html.indexOf(productContractCopy[locale].dailyDescription) &&
        html.includes('aria-labelledby="spread-title"'),
      {
        code: `tarot-selector-visible-localized-heading-${locale}`,
        message:
          'The selector must render its localized title as a real h2 before the supporting sentence, not only inside the visually hidden radio legend.',
      },
    );
    for (const spread of tarotSpreads) {
      const option =
        html.match(new RegExp(`<label[^>]*data-spread="${spread.id}"[\\s\\S]*?</label>`))?.[0] ??
        '';
      const escapeHtml = (value: string) =>
        value
          .replaceAll('&', '&amp;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#x27;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');
      assertions.assert(
        option.includes(`aria-labelledby="spread-${spread.id}-title"`) &&
          option.includes(
            `aria-describedby="spread-${spread.id}-description spread-${spread.id}-meta"`,
          ) &&
          option.includes(`data-spread-icon="${spread.id}"`) &&
          option.includes(escapeHtml(spread.title[locale])) &&
          option.includes(escapeHtml(spread.description[locale])) &&
          option.includes('checked=""') === (spread.id === 'day'),
        {
          code: `tarot-selector-preserves-native-option-${locale}-${spread.id}`,
          message:
            'Every spread must retain its localized title/description, individually named native radio, matching decorative icon and unchanged day default.',
        },
      );
    }
  }
  const spreadIcons = tarotSpreads.map((spread) =>
    renderToStaticMarkup(createElement(TarotSpreadIcon, { spreadId: spread.id })),
  );
  assertions.assert(
    new Set(spreadIcons.map((svg) => svg.replace(/data-spread-icon="[^"]+"/, ''))).size === 8 &&
      spreadIcons.every(
        (svg) =>
          svg.includes('aria-hidden="true"') &&
          svg.includes('focusable="false"') &&
          svg.includes('stroke-width="1.25"') &&
          svg.includes('viewBox="0 0 64 64"') &&
          !/<(?:image|text|animate)\b/.test(svg),
      ),
    {
      code: 'tarot-selector-eight-distinct-decorative-vectors',
      message:
        'All eight themes need distinct, optically consistent native SVG geometry without raster requests, duplicate names or continuous animation.',
    },
  );
  const selectorCss = read(rootDir, 'src/features/tarot/components/TarotSpreadSelector.module.css');
  assertions.assert(
    /\.section \.sectionHeading h2\s*\{[^}]*scroll-margin-block-start:\s*7rem;/.test(selectorCss),
    {
      code: 'tarot-selector-heading-anchor-clears-sticky-header',
      message:
        'Direct navigation to the heading must keep its title and eyebrow below the sticky header without moving or resizing the accepted selector layout.',
    },
  );
  assertions.assert(
    selectorCss.includes('.section .sectionHeading h2') &&
      selectorCss.includes('grid-template-columns: 6.5rem minmax(0, 1fr) 1.5rem') &&
      selectorCss.includes('inline-size: 4.75rem') &&
      selectorCss.includes('inline-size: 3.25rem') &&
      selectorCss.includes('min-block-size: calc(100svh - 3.5rem)') &&
      selectorCss.includes('scroll-margin-block-start: 3.5rem') &&
      selectorCss.includes(':hover:not([data-selected])') &&
      !/(?:^|\n)\s*(?:height|block-size|max-block-size):\s*[^;]*(?:vh|svh)/.test(selectorCss),
    {
      code: 'tarot-selector-premium-scale-and-arrival',
      message:
        'Selector display sizing must win over generic typography; large symbols and a growing viewport minimum must preserve a deliberate sticky-header-safe arrival without clipping or hover weakening the selected state.',
    },
  );
  assertions.assert(
    selectorCss.includes('grid-template-columns: repeat(2, minmax(0, 1fr))') &&
      selectorCss.includes('grid-auto-flow: column') &&
      selectorCss.includes('@media (max-width: 56rem)') &&
      selectorCss.includes('grid-template-columns: minmax(0, 1fr)') &&
      selectorCss.includes(':has(input:focus-visible)') &&
      selectorCss.includes('@media (forced-colors: active)') &&
      selectorCss.includes('@media (prefers-reduced-motion: reduce)') &&
      !selectorCss.includes(':global') &&
      !selectorCss.includes('.setup') &&
      !selectorCss.includes('.reveal'),
    {
      code: 'tarot-selector-isolated-responsive-accessibility',
      message:
        'Selector presentation must remain scoped, preserve desktop option ordering, stack at readable tablet widths, and support visible focus, reduced motion and forced colors.',
    },
  );
  const readingFlow = read(rootDir, 'src/features/tarot/flows/TarotReadingFlow.tsx');
  const entryCss = read(rootDir, 'src/features/tarot/components/TarotEntry.module.css');
  assertions.assert(
    /step === 'reveal'\s*\? styles.flowPage\s*: `\$\{styles.flowPage\} \$\{entryStyles.setup\}`/.test(
      readingFlow,
    ) &&
      !entryCss.includes('.reveal') &&
      !entryCss.includes(':global') &&
      entryCss.includes('@media (prefers-reduced-motion: reduce)') &&
      entryCss.includes('@media (forced-colors: active)'),
    {
      code: 'tarot-setup-styles-isolated-from-reveal',
      message:
        'Setup-only presentation must never attach to the accepted reveal composition; reduced-motion and forced-colors remain supported.',
    },
  );
  assertions.assert(
    routerOutlet.includes('main.focus({ preventScroll: true })') &&
      !routerOutlet.includes('scrollIntoView(') &&
      !routerOutlet.includes('window.scrollTo('),
    {
      code: 'route-landmark-focus-does-not-scroll',
      message:
        'Route landmark focus must not compete with the existing route scroll restoration owner.',
    },
  );

  assertions.assert(
    getInterestLabel('technology', 'ru') === 'технологии' &&
      getInterestLabel('technology', 'ru', 'instrumental') === 'технологиями' &&
      getInterestLabel('music', 'ru', 'object') === 'музыку' &&
      getInterestLabel('technology', 'uk', 'instrumental') === 'технологіями',
    {
      code: 'localized-interest-grammar-forms',
      message:
        'Generated Portrait copy must use the grammatical form required by each localized sentence.',
    },
  );

  assertions.assert(
    layoutCss.includes('grid-template-columns: minmax(0, 1fr)') &&
      layoutCss.includes('max-inline-size: 100%') &&
      layoutCss.includes('overflow-x: clip'),
    {
      code: 'shared-shell-reflow-contract',
      message:
        'The shared shell must keep shrinkable content tracks and prevent viewport-level overflow.',
    },
  );

  assertions.assert(
    sidebar.includes("aria-current={isCurrent ? 'page' : undefined}") &&
      sidebar.includes('<dialog') &&
      sidebar.includes('dialog.showModal()') &&
      sidebar.includes('onCancel=') &&
      sidebar.includes('event.preventDefault()') &&
      layout.includes('menuButtonRef.current?.focus()'),
    {
      code: 'navigation-state-and-focus-contract',
      message:
        'Navigation must expose its current route, use the native modal for focus containment and background inertness, handle Escape, and return focus to the trigger.',
    },
  );

  assertions.assert(
    globals.includes(':focus-visible') &&
      globals.includes('var(--focus-ring-width)') &&
      globals.includes('var(--color-focus)'),
    {
      code: 'shared-focus-indicator',
      message: 'Interactive modules must inherit the shared visible focus indicator.',
    },
  );

  assertions.assert(
    notFound.includes('<ButtonLink href={ROUTES.home}') &&
      notFound.includes('messages.system.notFound.action') &&
      locales.every((locale) => locale.includes('action:')),
    {
      code: 'localized-not-found-recovery',
      message: 'The not-found state must provide one localized, safe route back into the product.',
    },
  );

  assertions.assert(
    normalizeNumerologyBirthDate('1990-01-01') === '1990-01-01' &&
      normalizeNumerologyBirthDate('garbage') === '' &&
      normalizeNumerologyBirthDate('2999-01-01') === '' &&
      normalizeNumerologyBirthDate(null) === '',
    {
      code: 'numerology-persisted-date-boundary',
      message:
        'Numerology result routing must reject malformed persisted dates instead of rendering fabricated values.',
    },
  );

  const englishSettings = getLocalizedUserSettingsData('en');
  const ukrainianSettings = getLocalizedUserSettingsData('uk');
  assertions.assert(
    userSettingsCopy.en.hero.title === 'Settings' &&
      userSettingsCopy.uk.hero.title === 'Налаштування' &&
      englishSettings.appearanceOptions.map((option) => option.value).join(',') ===
        ukrainianSettings.appearanceOptions.map((option) => option.value).join(','),
    {
      code: 'localized-settings-behavior-parity',
      message:
        'Settings locales must change presentation copy while preserving identical working control semantics.',
    },
  );

  const englishInvalidAudio = validateAudioQuality(
    {
      averageSignalLevel: 0,
      blobSize: 0,
      durationMs: 0,
      mimeType: 'text/plain',
      signalSampleCount: 30,
    },
    'en',
  );
  assertions.assert(
    voiceRecordingCopy.en.introduction.title === 'Add voice to your portrait' &&
      voiceRecordingCopy.uk.introduction.title === 'Додайте голос до портрета' &&
      englishInvalidAudio.valid === false &&
      englishInvalidAudio.message === voiceRecordingCopy.en.issueMessages.empty,
    {
      code: 'localized-portrait-voice-recovery',
      message:
        'The Portrait voice step and its technical recovery messages must follow the active locale.',
    },
  );

  assertions.assert(
    userSettings.includes('<AppearanceSettingsSection') &&
      !userSettings.includes('DataManagementSection') &&
      !userSettings.includes('PrivacySettingsSection') &&
      !userSettings.includes('DangerZoneSection') &&
      !settingsPage.includes('portraitDataActions') &&
      !settingsPage.includes('privacyConsents') &&
      !settingsPage.includes('dangerActions'),
    {
      code: 'settings-working-controls-only',
      message:
        'Settings must expose only working appearance and Tarot controls, not demonstrational consent, export or deletion actions.',
    },
  );

  return assertions.result();
}
