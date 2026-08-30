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
  const sidebar = read(rootDir, 'src/widgets/sidebar/Sidebar.tsx');
  const notFound = read(rootDir, 'src/pages/not-found/NotFoundPage.tsx');
  const compatibilitySettings = read(
    rootDir,
    'src/features/user-settings/sections/CompatibilitySettingsSection.tsx',
  );
  const userSettingsHook = read(rootDir, 'src/features/user-settings/hooks/useUserSettings.ts');
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
        ukrainianSettings.appearanceOptions.map((option) => option.value).join(',') &&
      englishSettings.portraitDataActions.map((action) => action.id).join(',') ===
        ukrainianSettings.portraitDataActions.map((action) => action.id).join(',') &&
      englishSettings.portraitDataActions[0]?.label === 'Export data' &&
      ukrainianSettings.portraitDataActions[0]?.label === 'Експортувати дані',
    {
      code: 'localized-settings-behavior-parity',
      message:
        'Settings locales must change presentation copy while preserving identical control and action semantics.',
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
    compatibilitySettings.includes('onRevoke(invitation, buttonId)') &&
      userSettingsHook.includes('cancelFocusTargetId: returnFocusId') &&
      userSettingsHook.includes("confirmFocusTargetId: 'compatibility-settings-title'") &&
      userSettingsHook.includes('setFocusTargetId(pendingAction.cancelFocusTargetId)') &&
      userSettingsHook.includes('setFocusTargetId(pendingAction.confirmFocusTargetId)'),
    {
      code: 'settings-dialog-focus-destination',
      message:
        'Cancelling a settings dialog must return focus to its trigger while confirmed removal moves focus to a surviving target.',
    },
  );

  return assertions.result();
}
