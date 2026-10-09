import { NotificationProvider } from '../../app/providers/notification/NotificationProvider';
import { I18nContext } from '../../shared/i18n/provider/I18nContext';
import { messagesByLocale } from '../../shared/i18n';
import { migrateLegacyStorage } from '../../features/product-storage/migrations';
import { LEGACY_STORAGE_KEYS } from '../../features/product-storage/constants';
import { renderToStaticMarkup } from 'react-dom/server';

import { createEmptyDraftPortrait } from '../../entities/personality-profile';
import {
  createDailyCard,
  createTarotHistorySnapshot,
  getLocalDateKey,
} from '../../features/journey/lib';
import {
  nextLocalDayDelay,
  tarotStartDestination,
} from '../../features/journey/lib/daily-card-contract';
import { createJourneyActions } from '../../features/journey/model/journey-store';
import type { JourneyState } from '../../features/journey/types';
import { SavedReading } from '../../features/journey/components/SavedReading';
import { NumerologyResult } from '../../features/numerology/components/NumerologyResult';
import { numerologyCopy } from '../../features/numerology/data';
import { createNumerologyProfile } from '../../features/numerology/lib';
import { createNumerologyResultSession } from '../../features/numerology/model/numerology-result-session';
import {
  answerRules,
  getTraitTemplate,
  traitOrder,
} from '../../features/personality-analysis/data';
import { createPersonalityProfile } from '../../features/personality-analysis/lib';
import { collectEvidence } from '../../features/personality-analysis/lib/collect-evidence';
import { evaluateTraits } from '../../features/personality-analysis/lib/trait-evaluation';
import { ExplainCard, ResultReveal } from '../../features/personality-report';
import { getPortraitQuestions } from '../../features/questionnaire/data/portraitQuestions';
import { ResultPreview } from '../../features/result-preview';
import { TarotResult } from '../../features/tarot/components/TarotResult';
import { standardTarotDeck, tarotCopy, tarotSpreads } from '../../features/tarot/data';
import { createAutomaticSelections, createTarotReading } from '../../features/tarot/lib';
import { ROUTES } from '../../shared/config';
import type { Locale } from '../../shared/i18n';
import { productContractCopy } from '../../shared/i18n/product-contract-copy';
import { createStore } from '../../store';
import { QualityAssertions } from '../assertions';

const locales: readonly Locale[] = ['ru', 'en', 'uk', 'es'];
const noop = () => {};
const escaped = (text: string) => renderToStaticMarkup(<>{text}</>);
const createdAt = '2026-10-06T10:00:00.000Z';
const referenceDate = new Date(2026, 9, 6, 12);

function readingFor(locale: Locale) {
  const spread = tarotSpreads.find((item) => item.id === 'week')!;
  const seed = 'product-contract-language';
  return createTarotReading(
    {
      birthDate: '1990-01-01',
      deckTheme: 'cosmic-minimal',
      interests: [],
      locale,
      numerology: createNumerologyProfile('1990-01-01', locale, referenceDate),
      period: spread.period,
      psychologyAnswers: [],
      seed,
      selectionMode: 'automatic',
      spreadId: spread.id,
    },
    createAutomaticSelections(standardTarotDeck.cards, spread, seed),
    createdAt,
  );
}

export function runProductRuntimeContractsGate() {
  const assertions = new QualityAssertions();
  let fixtureCount = 0;
  const check = (condition: unknown, code: string, message: string) =>
    assertions.assert(condition, { code, message });
  const canonical = getPortraitQuestions('ru');
  const optionCount = canonical.reduce((sum, question) => sum + question.options.length, 0);
  check(
    canonical.length === 16 && optionCount === Object.keys(answerRules).length,
    'portrait-catalog-coverage',
    'Every questionnaire choice must have exactly one canonical answer rule.',
  );

  for (const question of canonical) {
    for (const option of question.options) {
      let baseline = '';
      for (const locale of locales) {
        fixtureCount += 1;
        const draft = createEmptyDraftPortrait();
        draft.answers = { [question.id]: { optionIds: [option.id], skipped: false } };
        const localized = getPortraitQuestions(locale).find((item) => item.id === question.id)!;
        const label = localized.options.find((item) => item.id === option.id)!.label;
        const evidence = collectEvidence(draft, locale).traitEvidence;
        const rule = answerRules[`${question.id}:${option.id}`]!;
        const score = JSON.stringify(
          evaluateTraits(evidence).map(({ id, score }) => ({ id, score })),
        );
        if (locale === 'ru') baseline = score;
        check(
          evidence.length === 1 &&
            evidence[0]?.title === localized.title &&
            evidence[0]?.description === label &&
            evidence[0]?.id === `answer:${question.id}:${option.id}`,
          `answer-evidence-${locale}-${question.id}-${option.id}`,
          'Evidence must retain the exact localized question and chosen answer, rather than a generic inferred substitute.',
        );
        check(
          score === baseline &&
            JSON.stringify(evidence[0]?.traits) === JSON.stringify(rule.traits) &&
            evidence[0]?.weight === (rule.weight ?? 1),
          `answer-scoring-${locale}-${question.id}-${option.id}`,
          'Language must not change answer IDs, trait weights or ranking.',
        );
        const profile = createPersonalityProfile(draft, createdAt, locale);
        const saved = profile.evidence.find((item) => item.id === evidence[0]?.id);
        const insight = profile.strengths.find((item) =>
          item.evidence.some((entry) => entry.id === saved?.id),
        )!;
        const html = renderToStaticMarkup(
          <ExplainCard expanded insight={insight} locale={locale} onToggle={noop} />,
        );
        check(
          saved?.title === localized.title &&
            saved?.description === label &&
            html.includes(escaped(localized.title)) &&
            html.includes(escaped(label)),
          `answer-render-${locale}-${question.id}-${option.id}`,
          'The concrete answer must survive profile generation and expanded evidence rendering.',
        );
      }
    }
  }
  for (const locale of locales) {
    fixtureCount += 2;
    const messages = messagesByLocale[locale];
    const notificationHtml = renderToStaticMarkup(
      <I18nContext.Provider value={{ locale, messages, setLocale: () => true }}>
        <NotificationProvider>
          <span>fixture</span>
        </NotificationProvider>
      </I18nContext.Provider>,
    );
    check(
      notificationHtml.includes(`aria-label="${escaped(messages.shell.notifications)}"`) &&
        notificationHtml.includes('role="region"') &&
        (locale !== 'es' || !notificationHtml.includes('Уведомления')),
      `notification-region-language-${locale}`,
      'Notification regions must have a localized accessible name in every enabled language.',
    );
    const migrated = migrateLegacyStorage({
      locale: 'ru',
      now: createdAt,
      productVersion: 'locale-contract-fixture',
      values: { [LEGACY_STORAGE_KEYS.locale[0]]: locale },
    });
    check(
      migrated.envelope?.data.preferences?.data.locale === locale,
      `legacy-locale-registration-${locale}`,
      'Registered saved interface languages must survive legacy preference parsing; the V2 flag remains unchanged.',
    );
    const questions = getPortraitQuestions(locale);
    check(
      questions.length === canonical.length &&
        questions.every(
          (question, index) =>
            question.id === canonical[index]?.id &&
            question.title.trim() &&
            question.options.every(
              (option, optionIndex) =>
                option.id === canonical[index]?.options[optionIndex]?.id &&
                option.label.trim() &&
                option.label !== option.id,
            ),
        ),
      `questionnaire-localization-${locale}`,
      'Question and answer IDs must match all enabled catalogues; no missing translation may fall back to a raw option ID.',
    );
    const keys = Object.keys(productContractCopy[locale]).sort();
    check(
      JSON.stringify(keys) === JSON.stringify(Object.keys(productContractCopy.ru).sort()) &&
        keys.every((key) =>
          productContractCopy[locale][key as keyof typeof productContractCopy.ru].trim(),
        ),
      `contract-copy-${locale}`,
      'Critical lifetime, daily and storage outcome copy must be complete in every enabled production locale.',
    );
    const draft = createEmptyDraftPortrait();
    draft.answers = {
      unknown: { optionIds: ['unknown'], skipped: false },
      [canonical[0]!.id]: { optionIds: [canonical[0]!.options[0]!.id], skipped: true },
    };
    check(
      collectEvidence(draft, locale).traitEvidence.length === 0,
      `unsupported-answer-${locale}`,
      'Unknown and skipped choices must not fabricate evidence.',
    );
    const details = traitOrder.map((id) => getTraitTemplate(id, locale));
    check(
      new Set(details.map((item) => item.strengthDetails)).size === traitOrder.length &&
        details.every(
          (item) =>
            item.energyDetails !== item.energyDescription &&
            item.growthDetails !== item.growthDescription,
        ),
      `trait-specific-details-${locale}`,
      'Each trait needs its own deeper explanation; descriptions cannot replace the practical detail.',
    );
  }

  for (const original of locales) {
    const draft = createEmptyDraftPortrait();
    draft.answers = Object.fromEntries(
      canonical.map((q) => [q.id, { optionIds: [q.options[0]!.id], skipped: false }]),
    );
    const profile = createPersonalityProfile(draft, createdAt, original);
    const reading = readingFor(original);
    const snapshot = createTarotHistorySnapshot(reading);
    const numberProfile = createNumerologyProfile('1990-01-01', original, referenceDate);
    const before = JSON.stringify({ profile, reading, snapshot, numberProfile });
    for (const current of locales.filter((item) => item !== original)) {
      fixtureCount += 1;
      const preview = renderToStaticMarkup(
        <ResultPreview locale={current} profile={profile} onOpenFullResult={noop} />,
      );
      const reveal = renderToStaticMarkup(
        <ResultReveal locale={current} profile={profile} onOpen={noop} opened={false} />,
      );
      const card = renderToStaticMarkup(
        <ExplainCard
          locale={current}
          contentLocale={original}
          insight={profile.strengths[0]!}
          expanded
          onToggle={noop}
        />,
      );
      check(
        preview.includes(`data-result-locale="${original}"`) &&
          preview.includes(escaped(profile.revealHeadline)) &&
          reveal.includes(`lang="${original}"`) &&
          card.includes(escaped(profile.strengths[0]!.explanation)),
        `portrait-switch-${original}-${current}`,
        'Portrait content and evidence must retain their original language when interface controls switch.',
      );
      const tarot = renderToStaticMarkup(
        <TarotResult
          locale={current}
          reading={reading}
          isSaved
          onContinueJourney={noop}
          onOpenHistory={noop}
          onRestart={noop}
        />,
      );
      const history = renderToStaticMarkup(
        <SavedReading
          locale={current}
          record={{ favorite: false, reading, savedAt: createdAt, snapshot }}
          onOpen={noop}
        />,
      );
      check(
        tarot.includes(`data-result-locale="${original}"`) &&
          tarot.includes(escaped(tarotCopy[current].beginReading)) &&
          tarot.includes(escaped(reading.practicalFocus)) &&
          history.includes(escaped(snapshot.resultHeadline)) &&
          history.includes(`lang="${original}"`),
        `tarot-history-switch-${original}-${current}`,
        'Tarot and History must render immutable original-language snapshots with current-language actions.',
      );
      const number = renderToStaticMarkup(
        <NumerologyResult
          locale={current}
          profile={numberProfile}
          referenceDate={referenceDate}
          onBack={noop}
          persistenceFailed
          onRetrySave={noop}
        />,
      );
      check(
        number.includes(`data-result-locale="${original}"`) &&
          number.includes(escaped(numberProfile.lifePath.interpretation)) &&
          number.includes(escaped(numerologyCopy[current].back)) &&
          number.includes(escaped(productContractCopy[current].numerologyUnsaved)) &&
          number.includes('role="status"'),
        `numerology-switch-${original}-${current}`,
        'Numerology calculation language must remain fixed while controls and the quiet unsaved notice follow the interface.',
      );
      check(
        JSON.stringify({ profile, reading, snapshot, numberProfile }) === before,
        `immutable-switch-${original}-${current}`,
        'Language switching must not mutate any completed profile or saved snapshot.',
      );
    }
  }

  const initial: JourneyState = { identity: 'contract-browser', dailyCards: {}, readings: [] };
  const store = createStore(initial);
  let available = true;
  const actions = createJourneyActions(store, {
    historyLimit: () => 75,
    now: () => createdAt,
    persist: () => ({ persisted: available }),
  });
  const daily = createDailyCard(initial.identity, '2026-10-06');
  actions.ensureDailyCard(daily);
  actions.openDailyCard(daily.dateKey);
  const beforeDaily = JSON.stringify(store.getState());
  for (const entry of ['Home', 'Tarot', 'Personal Space', 'legacy unfinished day']) {
    fixtureCount += 1;
    actions.ensureDailyCard(createDailyCard(initial.identity, daily.dateKey));
    actions.openDailyCard(daily.dateKey);
    check(
      tarotStartDestination('day') === ROUTES.profile &&
        tarotStartDestination('week') === ROUTES.tarotReading &&
        beforeDaily === JSON.stringify(store.getState()) &&
        store.getState().readings.length === 0,
      `daily-entry-${entry}`,
      'Every daily entry point must reuse the local-day identity without creating an ordinary saved reading.',
    );
  }
  fixtureCount += 1;
  check(
    getLocalDateKey(new Date(2026, 9, 6, 23, 59, 59)) === '2026-10-06' &&
      getLocalDateKey(new Date(2026, 9, 7)) === '2026-10-07' &&
      nextLocalDayDelay(new Date(2026, 9, 6, 23, 59, 59)) === 1020,
    'daily-local-boundary',
    'Daily rollover must use local midnight, including a bounded scheduling margin.',
  );
  available = false;
  const unsaved = actions.recordReading(readingFor('en'));
  const frozen = JSON.stringify(unsaved.value);
  fixtureCount += 1;
  check(
    !unsaved.persisted &&
      !actions.isReadingPersisted(unsaved.value.id) &&
      store.getState().readings.length === 1 &&
      !actions.recordReading(unsaved.value).persisted,
    'tarot-unsaved-honesty',
    'A current reading must stay available without claiming successful browser persistence; repeated save failure is not success.',
  );
  available = true;
  check(
    actions.recordReading(unsaved.value).persisted &&
      actions.isReadingPersisted(unsaved.value.id) &&
      JSON.stringify(unsaved.value) === frozen &&
      store.getState().readings.length === 1,
    'tarot-unsaved-retry',
    'Retry must persist the same immutable reading without regeneration or duplication.',
  );

  for (const failure of ['none', 'blocked', 'exception', 'quota'] as const) {
    fixtureCount += 1;
    let saved = '';
    let writable = failure === 'none';
    const dependencies = {
      read: () => saved,
      write: (date: string) => {
        if (!writable) {
          if (failure === 'exception') throw new Error('Storage write blocked');
          if (failure === 'quota') throw new DOMException('Quota exceeded', 'QuotaExceededError');
          return false;
        }
        saved = date;
        return true;
      },
    };
    const session = createNumerologyResultSession(dependencies);
    const result = session.submit('1990-01-01', 'uk', referenceDate)!;
    const original = JSON.stringify(result.profile);
    check(
      result.profile.lifePath.value === 3 &&
        result.persisted === writable &&
        session.get('en')?.profile === result.profile &&
        session.date() === '1990-01-01',
      `numerology-memory-${failure}`,
      'Valid results must remain available in the current view independently of storage, preserving their creation language.',
    );
    check(
      Boolean(createNumerologyResultSession(dependencies).get('en', referenceDate)) === writable,
      `numerology-reload-${failure}`,
      'A failed write must not promise reload recovery; a successful date write supports a fresh calculation.',
    );
    check(
      !session.submit('invalid', 'en', referenceDate) &&
        session.get('ru')?.profile === result.profile,
      `numerology-invalid-${failure}`,
      'Invalid input must neither corrupt nor replace a valid current result.',
    );
    writable = true;
    const retried = session.retry()!;
    check(
      retried.persisted &&
        retried.profile === result.profile &&
        JSON.stringify(retried.profile) === original &&
        saved === result.profile.birthDate,
      `numerology-retry-${failure}`,
      'Retry must save the original valid date without changing the result or its reference period.',
    );
    const reload = createNumerologyResultSession(dependencies).get('en', referenceDate)!;
    check(
      reload.profile.locale === 'en' &&
        reload.profile.lifePath.value === result.profile.lifePath.value,
      `numerology-new-calculation-${failure}`,
      'Reload reuses a persisted date for a new calculation in the current interface language.',
    );
  }
  fixtureCount += 1;
  const previousDate = '1994-06-17';
  const oldStorage = { read: () => previousDate, write: () => false };
  const failedNewDate = createNumerologyResultSession(oldStorage);
  failedNewDate.submit('1990-01-01', 'ru', referenceDate);
  check(
    failedNewDate.date() === '1990-01-01' &&
      createNumerologyResultSession(oldStorage).get('uk', referenceDate)?.profile.birthDate ===
        previousDate,
    'numerology-previous-date-preserved',
    'A failed newer write must retain its current result while leaving previously persisted data intact.',
  );
  const blockedRead = createNumerologyResultSession({
    read: () => {
      throw new Error('Storage unavailable');
    },
    write: () => false,
  });
  check(
    blockedRead.get('en', referenceDate) === null &&
      blockedRead.date() === '' &&
      blockedRead.submit('1990-01-01', 'en', referenceDate)?.profile.lifePath.value === 3,
    'numerology-unavailable-storage',
    'Unavailable storage must not prevent a new valid calculation.',
  );
  return assertions.result({ fixtureCount });
}
