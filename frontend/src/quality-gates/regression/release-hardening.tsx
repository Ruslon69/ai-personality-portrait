import { renderToStaticMarkup } from 'react-dom/server';

import {
  ErrorFallback,
  errorFallbackCopy,
  resolveErrorFallbackLocale,
} from '../../app/providers/error-boundary';
import { createStore } from '../../store';
import {
  createJourneyActions,
  journeyPersistenceCopy,
  type JourneyState,
} from '../../features/journey';
import {
  storageFixtureReading,
  STORAGE_FIXTURE_TIME,
} from '../../features/product-storage/fixtures';
import { didJourneyWritePersist } from '../../features/product-storage/runtime/browser-runtime';
import {
  PortraitResultBoundary,
  portraitRecoveryCopy,
  resolvePortraitResultAvailability,
} from '../../features/personality-report';
import type {
  ProductStorageSectionWriteResult,
  StorageCapability,
} from '../../features/product-storage/types';
import type { Locale } from '../../shared/i18n';
import { FullResultPageContent } from '../../pages/full-result/FullResultPage';
import { ResultPreviewPageContent } from '../../pages/result-preview/ResultPreviewPage';
import { QualityAssertions } from '../assertions';
import { checkPersonalSpace } from './personal-space';
import { checkDailyCardPersistence } from './daily-card-persistence';
import { checkNumerologyExperience } from './numerology-experience';
import { checkZodiacArtwork } from './zodiac-artwork';
import { checkPortraitExperience } from './portrait-experience';
import { checkUtilityExperience } from './utility-experience';

const locales: readonly Locale[] = ['ru', 'en', 'uk', 'es'];

function writeResult(
  overrides: Partial<ProductStorageSectionWriteResult> = {},
): ProductStorageSectionWriteResult {
  return {
    envelopeWritten: false,
    errors: [],
    legacyWritten: false,
    revision: null,
    status: 'failed',
    warnings: [],
    ...overrides,
  };
}

function initialJourneyState(withReading = false): JourneyState {
  return {
    dailyCards: {},
    identity: 'release-hardening-fixture',
    readings: withReading
      ? [{ favorite: false, reading: storageFixtureReading, savedAt: STORAGE_FIXTURE_TIME }]
      : [],
  };
}

function journeyHarness(initialState: JourneyState, persistence: readonly boolean[]) {
  const store = createStore(initialState);
  const attempts: JourneyState[] = [];
  let attempt = 0;
  const actions = createJourneyActions(store, {
    historyLimit: () => 75,
    now: () => STORAGE_FIXTURE_TIME,
    persist(state) {
      attempts.push(state);
      const persisted = persistence[attempt] ?? persistence.at(-1) ?? false;
      attempt += 1;
      return { persisted };
    },
  });
  return { actions, attempts, store };
}

function persistentWrite(write: ProductStorageSectionWriteResult, capability: StorageCapability) {
  return didJourneyWritePersist(write, capability);
}

export function runReleaseHardeningGate() {
  const assertions = new QualityAssertions();
  checkUtilityExperience(assertions);

  checkPortraitExperience(assertions);

  const saved = journeyHarness(initialJourneyState(), [true]);
  const savedResult = saved.actions.recordReading(storageFixtureReading);
  assertions.assert(
    savedResult.changed &&
      savedResult.persisted &&
      saved.store.getState().readings.length === 1 &&
      saved.attempts.length === 1,
    {
      code: 'journey-successful-save-outcome',
      message: 'A successful Journey save must expose persistence and perform one write.',
    },
  );

  const failedSave = journeyHarness(initialJourneyState(), [false, true]);
  const failedSaveResult = failedSave.actions.recordReading(storageFixtureReading);
  const retryAfterFailedSave = failedSave.actions.recordReading(storageFixtureReading);
  const unchangedAfterFailedSave = failedSave.actions.recordReading(storageFixtureReading);
  assertions.assert(
    failedSaveResult.changed &&
      !failedSaveResult.persisted &&
      retryAfterFailedSave.changed &&
      retryAfterFailedSave.persisted &&
      !unchangedAfterFailedSave.changed &&
      unchangedAfterFailedSave.persisted &&
      failedSave.store.getState().readings.length === 1 &&
      failedSave.attempts.length === 2,
    {
      code: 'journey-failed-save-keeps-session-state',
      message:
        'A failed permanent save keeps the current reading, retries the same snapshot and becomes a no-op only after successful persistence.',
    },
  );

  const failedDelete = journeyHarness(initialJourneyState(true), [false, true]);
  const failedDeleteResult = failedDelete.actions.deleteReading(storageFixtureReading.id);
  const retryDeleteResult = failedDelete.actions.deleteReading(storageFixtureReading.id);
  assertions.assert(
    failedDeleteResult.changed &&
      !failedDeleteResult.persisted &&
      retryDeleteResult.persisted &&
      failedDelete.store.getState().readings.length === 0 &&
      failedDelete.attempts.length === 2,
    {
      code: 'journey-delete-rollback-and-retry',
      message:
        'Failed deletion must roll back visibly, while repeating the same action provides a valid retry.',
    },
  );

  const failedClear = journeyHarness(initialJourneyState(true), [false]);
  const failedClearResult = failedClear.actions.clearReadings();
  assertions.assert(
    !failedClearResult.persisted && failedClear.store.getState().readings.length === 1,
    {
      code: 'journey-clear-rollback',
      message: 'Failed history clearing must not present an empty in-memory history.',
    },
  );

  assertions.assert(
    persistentWrite(writeResult({ legacyWritten: true, status: 'legacy-only' }), 'unavailable') &&
      persistentWrite(writeResult({ envelopeWritten: true, status: 'success' }), 'persistent') &&
      !persistentWrite(
        writeResult({ envelopeWritten: true, status: 'envelope-only' }),
        'quota-limited',
      ) &&
      !persistentWrite(writeResult(), 'unavailable'),
    {
      code: 'journey-permanent-storage-capability',
      message:
        'In-memory fallback writes must not be reported as permanent when browser storage is unavailable.',
    },
  );

  locales.forEach((locale) => {
    const missingHtml = renderToStaticMarkup(
      <PortraitResultBoundary<{ id: string }> locale={locale} profile={null}>
        {(profile) => <span>{profile.id}</span>}
      </PortraitResultBoundary>,
    );
    const copy = portraitRecoveryCopy[locale];
    assertions.assert(
      missingHtml.includes(copy.title) &&
        missingHtml.includes(copy.description) &&
        missingHtml.includes(copy.action) &&
        missingHtml.includes('href="/portrait"') &&
        missingHtml.includes('<h1'),
      {
        code: `portrait-missing-state-${locale}`,
        message: `Portrait missing-state recovery must render semantic ${locale} copy and a stable action.`,
      },
    );
  });

  const missingFullResult = renderToStaticMarkup(
    <FullResultPageContent locale="en" onShare={() => undefined} profile={null} />,
  );
  const missingPreview = renderToStaticMarkup(
    <ResultPreviewPageContent locale="en" onOpenFullResult={() => undefined} profile={null} />,
  );
  assertions.assert(
    missingFullResult.includes(portraitRecoveryCopy.en.title) &&
      missingFullResult.includes('href="/portrait"'),
    {
      code: 'portrait-full-result-missing-state',
      message:
        'The full Portrait result page must render stable recovery when volatile state is absent.',
    },
  );
  assertions.assert(
    missingPreview.includes(portraitRecoveryCopy.en.title) &&
      missingPreview.includes('href="/portrait"'),
    {
      code: 'portrait-preview-missing-state',
      message:
        'The Portrait preview page must render stable recovery when volatile state is absent.',
    },
  );

  const profile = { id: 'volatile-profile' };
  const availableHtml = renderToStaticMarkup(
    <PortraitResultBoundary locale="en" profile={profile}>
      {(resolved) => <span data-profile-id={resolved.id}>available</span>}
    </PortraitResultBoundary>,
  );
  const available = resolvePortraitResultAvailability(profile);
  const missing = resolvePortraitResultAvailability(null);
  assertions.assert(
    available.kind === 'available' &&
      available.profile === profile &&
      missing.kind === 'missing' &&
      missing.actionHref === '/portrait' &&
      availableHtml.includes('data-profile-id="volatile-profile"') &&
      !availableHtml.includes(portraitRecoveryCopy.en.title),
    {
      code: 'portrait-valid-state-preserved',
      message:
        'A valid volatile Portrait profile must render unchanged instead of recovery content.',
    },
  );

  locales.forEach((locale) => {
    const html = renderToStaticMarkup(<ErrorFallback locale={locale} />);
    const copy = errorFallbackCopy[locale];
    assertions.assert(
      html.includes(copy.title) && html.includes(copy.description) && html.includes(copy.action),
      {
        code: `root-error-fallback-${locale}`,
        message: `Root error recovery must render ${locale} copy without an I18n provider.`,
      },
    );
  });

  assertions.assert(
    resolveErrorFallbackLocale('ru', ['en-US']) === 'ru' &&
      resolveErrorFallbackLocale('en', ['ru-RU']) === 'en' &&
      resolveErrorFallbackLocale('uk', ['en-US']) === 'uk' &&
      resolveErrorFallbackLocale('invalid', ['uk-UA']) === 'uk' &&
      resolveErrorFallbackLocale('invalid', []) === 'ru',
    {
      code: 'root-error-locale-resolution',
      message: 'Root error locale resolution must validate stored values and fall back safely.',
    },
  );

  assertions.assert(
    locales.every(
      (locale) =>
        journeyPersistenceCopy[locale].saveFailed.length > 0 &&
        journeyPersistenceCopy[locale].deleteFailed.length > 0 &&
        journeyPersistenceCopy[locale].clearFailed.length > 0,
    ),
    {
      code: 'journey-persistence-localization',
      message: 'Journey save and destructive persistence failures require RU, EN and UK copy.',
    },
  );

  checkPersonalSpace(assertions);
  checkDailyCardPersistence(assertions);
  checkNumerologyExperience(assertions);
  checkZodiacArtwork(assertions);
  return assertions.result({ fixtureCount: 37 });
}
