import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { NotificationContext } from '../../app/providers/notification/NotificationContext';
import { createEmptyDraftPortrait } from '../../entities/personality-profile';
import { createPersonalityProfile } from '../../features/personality-analysis/lib';
import { getPortraitQuestions } from '../../features/questionnaire';
import { Journey } from '../../features/journey/components/Journey';
import { MyPath } from '../../features/journey/components/MyPath';
import { SavedReading } from '../../features/journey/components/SavedReading';
import { TarotHistory } from '../../features/journey/components/TarotHistory';
import { journeyCopy, tarotHistoryCopy } from '../../features/journey/data';
import {
  createDailyCard,
  createTarotHistorySnapshot,
  getLocalDateKey,
  historySnapshotForRecord,
  normalizeTarotHistoryRecords,
} from '../../features/journey/lib';
import { journeyStore } from '../../features/journey/model';
import type { JourneyReadingRecord } from '../../features/journey/types';
import {
  storageFixtureReading,
  STORAGE_FIXTURE_TIME,
} from '../../features/product-storage/fixtures';
import type { Locale } from '../../shared/i18n';
import type { QualityAssertions } from '../assertions';

const noop = () => {};
function render(content: ReactNode) {
  return renderToStaticMarkup(
    <NotificationContext.Provider
      value={{ clear: noop, dismiss: noop, notifications: [], notify: () => '' }}
    >
      {content}
    </NotificationContext.Provider>,
  );
}

export function checkPersonalSpace(assertions: QualityAssertions) {
  const previous = journeyStore.getState();
  const reading = structuredClone(storageFixtureReading);
  const record: JourneyReadingRecord = {
    favorite: false,
    reading,
    savedAt: STORAGE_FIXTURE_TIME,
    snapshot: {
      ...createTarotHistorySnapshot(reading),
      resultHeadline: 'Saved headline — unchanged',
      spreadTitle: 'Saved spread title',
    },
  };
  const before = JSON.stringify(record);
  for (const motif of [{ invalid: 'object' }, null, 42, ['nested']]) {
    const damaged = structuredClone(record);
    damaged.snapshot!.motifs = [motif] as unknown as readonly string[];
    const storedBefore = JSON.stringify(damaged);
    const recovered = normalizeTarotHistoryRecords([damaged, null, { reading: null }]);
    const expectedSnapshot = createTarotHistorySnapshot(reading);
    const html = render(<SavedReading record={recovered[0]!} locale="es" onOpen={noop} />);
    assertions.assert(
      recovered.length === 1 &&
        JSON.stringify(historySnapshotForRecord(damaged)) === JSON.stringify(expectedSnapshot) &&
        JSON.stringify(recovered[0]!.snapshot) === JSON.stringify(expectedSnapshot) &&
        recovered[0]!.reading === damaged.reading &&
        recovered[0]!.savedAt === damaged.savedAt &&
        recovered[0]!.favorite === damaged.favorite &&
        html.includes(reading.summary) &&
        JSON.stringify(damaged) === storedBefore &&
        JSON.stringify(record) === before,
      {
        code: `personal-space-corrupt-motif-${JSON.stringify(motif)}`,
        message:
          'Malformed presentation motifs must recover from the immutable reading without crashing the archive, rewriting stored data or losing the valid reading.',
      },
    );
  }
  const daily = createDailyCard('profile-render-fixture', getLocalDateKey());
  try {
    for (const locale of ['ru', 'en', 'uk', 'es'] as const satisfies readonly Locale[]) {
      journeyStore.setState({
        identity: 'profile-render-fixture',
        readings: [],
        dailyCards: { [daily.dateKey]: daily },
      });
      const profileProps = {
        locale,
        onExploreTarot: noop,
        onOpenLatestPortrait: noop,
        onOpenPath: noop,
        onOpenReading: noop,
        profile: null,
      };
      const emptyProfile = render(<Journey {...profileProps} />);
      const emptyHistory = render(
        <TarotHistory locale={locale} onBack={noop} onCreate={noop} onOpenReading={noop} />,
      );
      assertions.assert(
        (emptyProfile.match(/<h1\b/g) ?? []).length === 1 &&
          emptyProfile.includes(journeyCopy[locale].empty.title) &&
          emptyProfile.includes(journeyCopy[locale].empty.primary) &&
          emptyProfile.includes(renderToStaticMarkup(<>{journeyCopy[locale].card.open}</>)) &&
          emptyProfile.includes('data-visual-face="back"') &&
          emptyHistory.includes(tarotHistoryCopy[locale].emptyTitle) &&
          emptyHistory.includes(tarotHistoryCopy[locale].create),
        {
          code: `personal-space-empty-${locale}`,
          message:
            'Empty personal space must expose one heading, a real start action and the unopened Daily Card; history must offer recovery.',
        },
      );

      journeyStore.setState({ readings: [record] });
      const latest = render(<Journey {...profileProps} />);
      const history = render(
        <MyPath
          locale={locale}
          profiles={[]}
          onBack={noop}
          onExplore={noop}
          onManageReadings={noop}
          onOpenPortrait={noop}
          onOpenReading={noop}
        />,
      );
      const saved = render(<SavedReading record={record} locale={locale} onOpen={noop} />);
      assertions.assert(
        latest.includes('Saved headline — unchanged') &&
          latest.includes('Saved spread title') &&
          latest.includes('data-featured="true"') &&
          history.includes('Saved headline — unchanged') &&
          saved.includes('data-artwork-quality="premium"') &&
          saved.includes('loading="lazy"') &&
          saved.includes('<details') &&
          !saved.includes('<details open') &&
          saved.includes(`lang="${reading.context.locale}"`) &&
          JSON.stringify(record) === before,
        {
          code: `personal-space-snapshot-render-${locale}`,
          message:
            'Profile and history must render the stored title, spread and Premium art without mutation, with lazy imagery and native collapsed detail.',
        },
      );

      const draft = createEmptyDraftPortrait();
      draft.answers = Object.fromEntries(
        getPortraitQuestions(locale).map((question) => [
          question.id,
          { optionIds: [question.options[0]!.id], skipped: false },
        ]),
      );
      const portrait = createPersonalityProfile(draft, '2099-01-01T12:00:00.000Z', locale);
      const portraitBefore = JSON.stringify(portrait);
      const mixedHistory = render(
        <MyPath
          locale={locale}
          profiles={[portrait]}
          onBack={noop}
          onExplore={noop}
          onManageReadings={noop}
          onOpenPortrait={noop}
          onOpenReading={noop}
        />,
      );
      const chronologicalDates = [...mixedHistory.matchAll(/<time datetime="([^"]+)"/gi)].map(
        (match) => match[1],
      );
      const numerology = render(<Journey {...profileProps} hasNumerology />);
      assertions.assert(
        chronologicalDates[0] === portrait.createdAt &&
          chronologicalDates[1] === record.savedAt &&
          mixedHistory.includes(journeyCopy[locale].path.session) &&
          JSON.stringify(portrait) === portraitBefore &&
          JSON.stringify(record) === before &&
          (latest.match(new RegExp(journeyCopy[locale].book.openPath, 'g')) ?? []).length === 1 &&
          numerology.includes('href="/numerology/result"') &&
          numerology.includes(journeyCopy[locale].quick.numerologySession),
        {
          code: `personal-space-chronology-session-${locale}`,
          message:
            'The combined archive must sort real Tarot and Portrait results newest first without mutation; continuation must distinguish session data and avoid duplicate history links.',
        },
      );

      journeyStore.setState({
        dailyCards: { [daily.dateKey]: { ...daily, openedAt: STORAGE_FIXTURE_TIME } },
      });
      const opened = render(<Journey {...profileProps} />);
      assertions.assert(
        opened.includes(journeyCopy[locale].card.action) &&
          !opened.includes(`>${renderToStaticMarkup(<>{journeyCopy[locale].card.open}</>)}<`) &&
          opened.includes(`data-card-id="${daily.selection.cardId}"`) &&
          JSON.stringify(record) === before,
        {
          code: `personal-space-daily-open-${locale}`,
          message:
            'Opening Daily Card must retain its stored selection and show meaning/action without affecting saved readings.',
        },
      );
    }
  } finally {
    journeyStore.setState(previous);
  }
}
