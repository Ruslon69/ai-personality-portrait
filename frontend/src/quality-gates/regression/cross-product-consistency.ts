import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { normalizeNumerologyBirthDate } from '../../features/numerology/model/numerology-session';
import { getInterestLabel } from '../../features/personality-analysis/data/personalization';
import { getLocalizedUserSettingsData, userSettingsCopy } from '../../features/user-settings/data';
import { voiceRecordingCopy } from '../../features/voice-recording/data';
import { validateAudioQuality } from '../../features/voice-recording/utils';
import { QualityAssertions } from '../assertions';

function read(rootDir: string, path: string) {
  return readFileSync(resolve(rootDir, path), 'utf8');
}

export function runCrossProductConsistencyGate(rootDir: string) {
  const assertions = new QualityAssertions();
  const globals = read(rootDir, 'src/styles/globals.css');
  const layout = read(rootDir, 'src/app/layout/Layout.tsx');
  const layoutCss = read(rootDir, 'src/app/layout/Layout.module.css');
  const home = read(rootDir, 'src/pages/home/HomePage.tsx');
  const homeCss = read(rootDir, 'src/pages/home/HomePage.module.css');
  const header = read(rootDir, 'src/widgets/header/Header.tsx');
  const headerCss = read(rootDir, 'src/widgets/header/Header.module.css');
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
    header.includes('className={styles.logoCard}') &&
      header.includes('className={styles.logoFlame}') &&
      header.includes('className={styles.logoOrbit}') &&
      headerCss.includes('@keyframes logo-flame-awaken') &&
      headerCss.includes('@media (prefers-reduced-motion: reduce)') &&
      favicon.includes('<rect') &&
      favicon.includes('stroke="#f5c77d"'),
    {
      code: 'soul-arkana-card-flame-brand-contract',
      message:
        'The header and favicon must retain the shared Tarot-card, flame and celestial Soul Arkana mark with restrained motion.',
    },
  );

  assertions.assert(
    layout.includes('showSettings={!isMarketing || currentPath === ROUTES.tarotReading}') &&
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
    home.includes('className={styles.heroCardFrame}') &&
      home.includes('className={styles.heroFlame}') &&
      home.includes('className={styles.heroOrbit}') &&
      !home.includes('className={styles.heroNumber}') &&
      homeCss.includes('.heroCardFrame') &&
      homeCss.includes('.heroFlame') &&
      homeCss.includes('.heroOrbit'),
    {
      code: 'landing-tarot-candle-visual-language',
      message:
        'The landing visual must share the Tarot-card, candle and orbital language of the reading experience.',
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
      sidebar.includes("role={isDrawer ? 'dialog' : undefined}") &&
      sidebar.includes('aria-modal={isDrawer ? true : undefined}') &&
      sidebar.includes("event.key === 'Escape'") &&
      layout.includes('menuButtonRef.current?.focus()'),
    {
      code: 'navigation-state-and-focus-contract',
      message: 'Navigation must expose its current route and preserve drawer focus management.',
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
