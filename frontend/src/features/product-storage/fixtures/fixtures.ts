import { createEmptyDraftPortrait } from '@entities/personality-profile';
import { buildJourneyMemorySnapshot } from '@features/journey-memory/model';
import { journeyMemoryFixtures } from '@features/journey-memory/fixtures';
import { journeyStateToMemorySources } from '@features/journey-memory/normalization';
import { createNumerologyProfile } from '@features/numerology/lib';
import { tarotSpreads } from '@features/tarot/data';
import { createTarotReading } from '@features/tarot/lib';
import type { TarotReadingContext } from '@features/tarot/types';

import { LEGACY_STORAGE_KEYS } from '../constants';
import { withEnvelopeChecksum } from '../serialization';
import { createProductStorageEnvelope } from '../schemas';
import type { ProductStorageEnvelope } from '../types';

export const STORAGE_FIXTURE_TIME = '2026-08-04T10:00:00.000Z';
export const STORAGE_FIXTURE_SEED = 'storage-fixture-seed-v1';

const numerology = createNumerologyProfile('1990-01-01', 'ru', new Date(STORAGE_FIXTURE_TIME));
const daySpread = tarotSpreads.find((spread) => spread.id === 'day');
if (!daySpread) throw new Error('Day spread fixture is unavailable.');
const context: TarotReadingContext = {
  birthDate: '1990-01-01',
  deckTheme: 'cosmic-minimal',
  interests: ['technology'],
  locale: 'ru',
  numerology,
  period: 'day',
  psychologyAnswers: [{ optionId: 'test', questionId: 'decision-style' }],
  seed: STORAGE_FIXTURE_SEED,
  selectionMode: 'automatic',
  spreadId: 'day',
};
export const storageFixtureReading = createTarotReading(
  context,
  [{ cardId: 'major-fool', orientation: 'upright', positionId: daySpread.positions[0]!.id }],
  STORAGE_FIXTURE_TIME,
);

const fixtureJourneyState = {
  dailyCards: {},
  identity: 'journey-storage-fixture',
  readings: [{ favorite: true, reading: storageFixtureReading, savedAt: STORAGE_FIXTURE_TIME }],
};
export const storageFixtureMemory = buildJourneyMemorySnapshot({
  generatedAt: STORAGE_FIXTURE_TIME,
  locale: 'ru',
  sources: journeyStateToMemorySources(fixtureJourneyState),
});

export function createFullStorageFixtureEnvelope(): ProductStorageEnvelope {
  return createProductStorageEnvelope({
    createdAt: STORAGE_FIXTURE_TIME,
    data: {
      completionState: {
        data: { completedStages: ['context', 'birth-date', 'reading'] },
        schemaVersion: 'completion-storage-v1',
      },
      draftPortrait: {
        data: { currentProfileId: null, draft: createEmptyDraftPortrait(), profiles: [] },
        schemaVersion: 'draft-storage-v1',
      },
      journey: {
        data: fixtureJourneyState,
        schemaVersion: 'journey-storage-v1',
      },
      journeyMemory: { data: storageFixtureMemory, schemaVersion: 'journey-memory-v1' },
      numerology: {
        data: { birthDate: numerology.birthDate, profile: numerology },
        schemaVersion: 'numerology-storage-v1',
      },
      preferences: {
        data: { deckTheme: 'cosmic-minimal', locale: 'ru', theme: 'dark' },
        schemaVersion: 'preferences-storage-v1',
      },
      tarotReadings: {
        data: [{ bookmarked: true, reading: storageFixtureReading, savedAt: STORAGE_FIXTURE_TIME }],
        schemaVersion: 'tarot-storage-v1',
      },
      tarotSession: {
        data: {
          answers: context.psychologyAnswers,
          birthDate: context.birthDate,
          deckTheme: context.deckTheme,
          reading: storageFixtureReading,
          reshuffled: false,
          seed: context.seed,
          selections: storageFixtureReading.selections,
          selectionMode: context.selectionMode,
          spreadId: context.spreadId,
        },
        schemaVersion: 'tarot-session-storage-v1',
      },
    },
    engineVersions: storageFixtureReading.expertInterpretation.metadata.versions,
    locale: 'ru',
    productVersion: '5.4-fixture',
  });
}

export type ProductStorageFixture = {
  expected: 'conflict' | 'failure' | 'migration' | 'recovery' | 'success';
  id: string;
  input: { locale: 'ru'; scenario: string };
  seed: string;
  timestamp: string;
};

const fixture = (
  id: string,
  expected: ProductStorageFixture['expected'] = 'success',
): ProductStorageFixture => ({
  expected,
  id,
  input: { locale: 'ru', scenario: id },
  seed: `${STORAGE_FIXTURE_SEED}:${id}`,
  timestamp: STORAGE_FIXTURE_TIME,
});

export const productStorageFixtures: readonly ProductStorageFixture[] = [
  fixture('empty-storage'),
  fixture('preferences-only'),
  fixture('draft-only'),
  fixture('one-tarot-reading'),
  fixture('multiple-readings'),
  fixture('numerology-only'),
  fixture('journey-only'),
  fixture('journey-memory-only'),
  fixture('full-valid-envelope'),
  fixture('legacy-journey', 'migration'),
  fixture('legacy-tarot', 'migration'),
  fixture('legacy-draft', 'migration'),
  fixture('mixed-legacy-storage', 'migration'),
  fixture('corrupted-json', 'recovery'),
  fixture('invalid-checksum', 'recovery'),
  fixture('missing-section'),
  fixture('invalid-tarot-section', 'recovery'),
  fixture('invalid-journey-section', 'recovery'),
  fixture('valid-active-valid-backup', 'recovery'),
  fixture('invalid-active-valid-backup', 'recovery'),
  fixture('invalid-active-invalid-backup', 'recovery'),
  fixture('interrupted-temporary-transaction', 'recovery'),
  fixture('unsupported-future-version', 'failure'),
  fixture('revision-conflict', 'conflict'),
  fixture('quota-failure-simulation', 'failure'),
  fixture('storage-unavailable', 'failure'),
  fixture('full-export'),
  fixture('partial-export'),
  fixture('valid-import-replace'),
  fixture('valid-import-merge'),
  fixture('duplicate-import-entries'),
  fixture('multi-year-journey'),
  fixture('master-number-data'),
  fixture('incompatible-engine-versions'),
  fixture('delete-one-section'),
  fixture('delete-all-keep-preferences'),
] as const;

export function legacyFixtureValues() {
  const envelope = createFullStorageFixtureEnvelope();
  return {
    [LEGACY_STORAGE_KEYS.draftPortrait[0]]: JSON.stringify(envelope.data.draftPortrait?.data),
    [LEGACY_STORAGE_KEYS.journey[0]]: JSON.stringify(envelope.data.journey?.data),
    [LEGACY_STORAGE_KEYS.locale[0]]: 'ru',
    [LEGACY_STORAGE_KEYS.numerologyBirthDate[0]]: '1990-01-01',
    [LEGACY_STORAGE_KEYS.tarotDeckTheme[0]]: 'cosmic-minimal',
    [LEGACY_STORAGE_KEYS.tarotState[0]]: JSON.stringify(envelope.data.tarotSession?.data),
    [LEGACY_STORAGE_KEYS.theme[0]]: 'dark',
  };
}

export type MaterializedStorageFixture = {
  activeRaw: string | null;
  backupRaw: string | null;
  envelope: ProductStorageEnvelope | null;
  legacyValues: Readonly<Record<string, string | null>>;
  temporaryRaw: string | null;
};

function raw(envelope: ProductStorageEnvelope) {
  return JSON.stringify(envelope);
}

export function materializeProductStorageFixture(
  fixture: ProductStorageFixture,
): MaterializedStorageFixture {
  const full = createFullStorageFixtureEnvelope();
  const sectionByScenario: Readonly<Record<string, keyof ProductStorageEnvelope['data']>> = {
    'draft-only': 'draftPortrait',
    'journey-memory-only': 'journeyMemory',
    'journey-only': 'journey',
    'numerology-only': 'numerology',
    'one-tarot-reading': 'tarotReadings',
    'preferences-only': 'preferences',
  };
  const selectedSection = sectionByScenario[fixture.id];
  let envelope = full;
  if (fixture.id === 'empty-storage')
    envelope = createProductStorageEnvelope({
      createdAt: fixture.timestamp,
      locale: 'ru',
      productVersion: '5.4-fixture',
    });
  else if (selectedSection) {
    const selected = full.data[selectedSection];
    envelope = createProductStorageEnvelope({
      createdAt: fixture.timestamp,
      data: selected ? { [selectedSection]: selected } : {},
      locale: 'ru',
      productVersion: '5.4-fixture',
    });
  } else if (fixture.id === 'multiple-readings' && full.data.tarotReadings) {
    const first = full.data.tarotReadings.data[0]!;
    const second = {
      ...first,
      reading: { ...first.reading, id: `${first.reading.id}:second` },
      savedAt: '2026-08-03T10:00:00.000Z',
    };
    envelope = createProductStorageEnvelope({
      createdAt: fixture.timestamp,
      data: { tarotReadings: { ...full.data.tarotReadings, data: [first, second] } },
      locale: 'ru',
      productVersion: '5.4-fixture',
    });
  } else if (fixture.id === 'master-number-data' && full.data.numerology?.data.profile) {
    const profile = full.data.numerology.data.profile;
    envelope = createProductStorageEnvelope({
      createdAt: fixture.timestamp,
      data: {
        numerology: {
          ...full.data.numerology,
          data: {
            ...full.data.numerology.data,
            profile: { ...profile, lifePath: { ...profile.lifePath, value: 11 } },
          },
        },
      },
      locale: 'ru',
      productVersion: '5.4-fixture',
    });
  } else if (fixture.id === 'incompatible-engine-versions') {
    envelope = createProductStorageEnvelope({
      createdAt: fixture.timestamp,
      data: full.data,
      engineVersions: { ...full.engineVersions, expertInterpretation: 'expert-interpretation-v0' },
      locale: 'ru',
      productVersion: '5.4-fixture',
    });
  } else if (fixture.id === 'multi-year-journey') {
    const sourceFixture = journeyMemoryFixtures.find((item) => item.id === 'multi-year-journey');
    if (!sourceFixture) throw new Error('Multi-year Journey fixture is unavailable.');
    const snapshot = buildJourneyMemorySnapshot({
      generatedAt: fixture.timestamp,
      locale: 'ru',
      sources: sourceFixture.sources,
    });
    envelope = createProductStorageEnvelope({
      createdAt: fixture.timestamp,
      data: { journeyMemory: { data: snapshot, schemaVersion: 'journey-memory-v1' } },
      engineVersions: snapshot.metadata.versions,
      locale: 'ru',
      productVersion: '5.4-fixture',
    });
  }

  const legacyValues = legacyFixtureValues();
  if (fixture.id.startsWith('legacy-')) {
    const selected: Record<string, string | null> = {};
    const key =
      fixture.id === 'legacy-journey'
        ? LEGACY_STORAGE_KEYS.journey[0]
        : fixture.id === 'legacy-tarot'
          ? LEGACY_STORAGE_KEYS.journey[0]
          : LEGACY_STORAGE_KEYS.draftPortrait[0];
    selected[key] = legacyValues[key] ?? null;
    return {
      activeRaw: null,
      backupRaw: null,
      envelope: null,
      legacyValues: selected,
      temporaryRaw: null,
    };
  }
  if (fixture.id === 'mixed-legacy-storage')
    return { activeRaw: null, backupRaw: null, envelope: null, legacyValues, temporaryRaw: null };
  if (fixture.id === 'corrupted-json')
    return {
      activeRaw: '{corrupted',
      backupRaw: null,
      envelope: null,
      legacyValues: {},
      temporaryRaw: null,
    };
  if (fixture.id === 'unsupported-future-version')
    return {
      activeRaw: JSON.stringify({ schemaVersion: 'product-storage-v99' }),
      backupRaw: null,
      envelope: null,
      legacyValues: {},
      temporaryRaw: null,
    };
  if (fixture.id === 'invalid-checksum') {
    const corrupted = { ...envelope, locale: 'en' as const };
    return {
      activeRaw: raw(corrupted),
      backupRaw: null,
      envelope: null,
      legacyValues: {},
      temporaryRaw: null,
    };
  }
  if (fixture.id === 'invalid-tarot-section' || fixture.id === 'invalid-journey-section') {
    const section = fixture.id === 'invalid-tarot-section' ? 'tarotReadings' : 'journey';
    const damaged = withEnvelopeChecksum({
      ...envelope,
      data: {
        ...envelope.data,
        [section]: {
          data: { invalid: true },
          schemaVersion: section === 'journey' ? 'journey-storage-v1' : 'tarot-storage-v1',
        },
      },
    } as ProductStorageEnvelope);
    return {
      activeRaw: raw(damaged),
      backupRaw: null,
      envelope: null,
      legacyValues: {},
      temporaryRaw: null,
    };
  }
  if (fixture.id === 'valid-active-valid-backup')
    return {
      activeRaw: raw(envelope),
      backupRaw: raw(envelope),
      envelope,
      legacyValues: {},
      temporaryRaw: null,
    };
  if (fixture.id === 'invalid-active-valid-backup')
    return {
      activeRaw: '{bad',
      backupRaw: raw(envelope),
      envelope: null,
      legacyValues: {},
      temporaryRaw: null,
    };
  if (fixture.id === 'invalid-active-invalid-backup')
    return {
      activeRaw: '{bad',
      backupRaw: '{bad',
      envelope: null,
      legacyValues: {},
      temporaryRaw: null,
    };
  if (fixture.id === 'interrupted-temporary-transaction')
    return {
      activeRaw: null,
      backupRaw: null,
      envelope: null,
      legacyValues: {},
      temporaryRaw: raw(envelope),
    };
  return {
    activeRaw: raw(envelope),
    backupRaw: null,
    envelope,
    legacyValues: {},
    temporaryRaw: null,
  };
}
