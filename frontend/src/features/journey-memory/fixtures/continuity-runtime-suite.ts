import { localExpertInterpretationProvider } from '@features/expert-interpretation/providers';
import { interpretationFixtures } from '@features/expert-interpretation/fixtures/fixtures';
import {
  buildProductStorageExport,
  createProductStorageDeletionPlan,
  createProductStorageEnvelope,
  journeyMemoryFingerprint,
  migrateProductStorageReadingLineage,
  migrateTarotReadingContinuity,
  parseProductStorageImport,
  reconcileJourneyStateAfterConflict,
  removeTarotReadingFromJourney,
  synchronizeJourneyMemory,
  validateProductStorageSection,
} from '@features/product-storage';
import {
  createFullStorageFixtureEnvelope,
  storageFixtureReading,
} from '@features/product-storage/fixtures/fixtures';
import type { JourneyMemorySource, ReadingContinuityQuery } from '../types';
import { buildJourneyMemorySnapshot } from '../model';
import { selectReadingContinuityContext, validateReadingContinuityContext } from '../continuity';
import { stableStringify } from '../utils';
import { journeyMemoryFixtures } from './fixtures';
import { readingContinuityFixtures } from './continuity-fixtures';

export type ReadingContinuityRuntimeReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

function queryFor(
  snapshot: ReturnType<typeof buildJourneyMemorySnapshot>,
  fixtureId: string,
): ReadingContinuityQuery {
  const entry = snapshot.entries[0];
  const unrelated =
    fixtureId === 'second-unrelated-reading' ||
    fixtureId === 'same-headline-unrelated-semantics' ||
    fixtureId === 'standard-mode-unaffected-by-irrelevant-history';
  return {
    cardIds: unrelated ? ['major-unrelated'] : (entry?.cards.map((card) => card.id) ?? []),
    ...(fixtureId === 'current-reading-excluded'
      ? {
          currentReadingId:
            entry?.sourceReferences
              .find((reference) => reference.kind === 'reading')
              ?.id.replace(/^reading:/u, '') ?? entry?.id,
        }
      : {}),
    numberValues: unrelated ? [99] : (entry?.numbers.map((number) => number.value) ?? []),
    sourceEngineVersions:
      fixtureId === 'incompatible-versions'
        ? { expertInterpretation: 'expert-interpretation-incompatible' }
        : (entry?.engineVersions ?? {}),
    spreadId: unrelated ? 'unrelated-spread' : (entry?.spreadId ?? 'week'),
    themeIds: unrelated
      ? ['theme.unrelated.semantic']
      : [entry?.leadingTheme, ...(entry?.supportingThemes ?? [])].filter(
          (theme): theme is string => theme !== null && theme !== undefined,
        ),
    topic: unrelated ? 'open' : (entry?.topic ?? null),
  };
}

function integrationSource(
  response: ReturnType<typeof localExpertInterpretationProvider.interpret>,
  request: (typeof interpretationFixtures)[number]['request'],
): JourneyMemorySource {
  return {
    bookmarked: false,
    cards: request.tarot.cards.map((card) => ({
      arcana: card.arcana,
      id: card.id,
      number: card.number,
      orientation: card.orientation,
      positionId: card.positionId,
      reversedMode: card.orientation === 'reversed' ? 'reassessment' : null,
      suit: card.suit ?? null,
    })),
    createdAt: request.generatedAt,
    engineVersions: response.result.metadata.versions,
    headline: response.result.content.headline,
    id: 'continuity-provider-previous',
    kind: 'tarot-reading',
    locale: request.locale,
    numbers: (request.numerology?.numbers ?? []).map((number) => ({
      calculationId: number.id,
      systemVersion: request.numerology?.system ?? 'pythagorean-date-v1',
      value: number.value,
    })),
    period: request.tarot.period ?? null,
    practicalFocuses: response.result.recommendations.map((recommendation) => ({
      category: 'decision',
      semanticId: `practical.${recommendation.relatedThemeId}`,
      sourceIds: recommendation.sources,
      text: recommendation.practicalFocus.key,
    })),
    quoteSources: [],
    readingType: request.tarot.spreadId,
    reflections: [],
    sourceReferences: [
      { id: 'reading:continuity-provider-previous', kind: 'reading', source: 'journey' },
    ],
    spreadId: request.tarot.spreadId,
    themes: response.result.themes.map((theme) => ({
      cardIds: theme.relatedCards,
      numberValues: theme.relatedNumbers,
      role: theme.role,
      semanticId: theme.semanticId,
      sourceIds: theme.sources,
    })),
    topic: request.tarot.topic ?? null,
    zodiac: request.zodiac
      ? {
          element: request.zodiac.element,
          modality: request.zodiac.modality,
          signId: request.zodiac.signId,
        }
      : null,
  };
}

export function runReadingContinuityRuntimeSuite(): ReadingContinuityRuntimeReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: unknown, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const snapshots = new Map(
    journeyMemoryFixtures.map((fixture) => [
      fixture.id,
      buildJourneyMemorySnapshot({
        generatedAt: fixture.generatedAt,
        locale: 'ru',
        sources: fixture.sources,
      }),
    ]),
  );
  readingContinuityFixtures.forEach((fixture) => {
    const snapshot = snapshots.get(fixture.snapshotFixtureId);
    if (!snapshot) {
      assert(false, `${fixture.id}: source snapshot is missing.`);
      return;
    }
    const query = queryFor(snapshot, fixture.id);
    const first = selectReadingContinuityContext(snapshot, query);
    const second = selectReadingContinuityContext(snapshot, query);
    const validation = validateReadingContinuityContext(first);
    assert(validation.valid, `${fixture.id}: continuity validation failed.`);
    assert(
      stableStringify(first) === stableStringify(second),
      `${fixture.id}: continuity selection is not deterministic.`,
    );
    assert(
      fixture.expectedHistory === first.previousRelevantEntries.length > 0,
      `${fixture.id}: relevant-history expectation failed.`,
    );
    assert(first.previousRelevantEntries.length <= 10, `${fixture.id}: entry limit failed.`);
    assert(first.recurringThemes.length <= 5, `${fixture.id}: theme limit failed.`);
    assert(first.recentTransitions.length <= 3, `${fixture.id}: transition limit failed.`);
    assert(first.repeatedCards.length <= 3, `${fixture.id}: card-pattern limit failed.`);
    assert(
      stableStringify(JSON.parse(JSON.stringify(first))) === stableStringify(first),
      `${fixture.id}: JSON round-trip failed.`,
    );
  });

  const providerFixture = interpretationFixtures[0];
  if (!providerFixture) assert(false, 'Provider fixture is unavailable.');
  else {
    const base = localExpertInterpretationProvider.interpret(providerFixture.request);
    const snapshot = buildJourneyMemorySnapshot({
      generatedAt: providerFixture.request.generatedAt,
      locale: providerFixture.request.locale,
      sources: [integrationSource(base, providerFixture.request)],
    });
    const withHistory = localExpertInterpretationProvider.interpret(providerFixture.request, {
      journeyMemoryProvider: { getSnapshot: () => snapshot },
    });
    assert(withHistory.continuity !== null, 'Provider did not resolve continuity.');
    assert(
      withHistory.narrative.mode === 'journey',
      'Relevant history did not enable Journey mode.',
    );
    assert(
      stableStringify(withHistory.result) === stableStringify(base.result),
      'Continuity changed the backward-compatible interpretation result.',
    );
    assert(
      withHistory.reasoning.priority.leadingLinkId !==
        withHistory.reasoning.priority.journeyContinuityId,
      'Journey Memory became the leading cross-system conclusion.',
    );
    assert(
      !withHistory.continuity?.previousRelevantEntries.some(
        (entry) => entry.id === 'continuity-provider-current',
      ),
      'Current reading referenced itself.',
    );
    const unrelatedSource = {
      ...integrationSource(base, providerFixture.request),
      cards: [],
      id: 'continuity-provider-unrelated',
      numbers: [],
      readingType: 'unrelated-spread',
      sourceReferences: [
        {
          id: 'reading:continuity-provider-unrelated',
          kind: 'reading' as const,
          source: 'journey' as const,
        },
      ],
      spreadId: 'unrelated-spread',
      themes: [
        {
          cardIds: [],
          numberValues: [],
          role: 'leading' as const,
          semanticId: 'theme.unrelated.semantic',
          sourceIds: ['tarot-card' as const],
        },
      ],
      topic: null,
    };
    const unrelatedSnapshot = buildJourneyMemorySnapshot({
      generatedAt: providerFixture.request.generatedAt,
      locale: providerFixture.request.locale,
      sources: [unrelatedSource],
    });
    const unrelated = localExpertInterpretationProvider.interpret(providerFixture.request, {
      journeyMemoryProvider: { getSnapshot: () => unrelatedSnapshot },
    });
    assert(unrelated.continuity === null, 'Irrelevant history created a continuity context.');
    assert(unrelated.narrative.mode === 'standard', 'Irrelevant history changed Standard mode.');
    assert(
      stableStringify(unrelated.reasoning) === stableStringify(base.reasoning),
      'Irrelevant history changed cross-system reasoning.',
    );
    assert(
      stableStringify(unrelated.narrative) === stableStringify(base.narrative),
      'Irrelevant history changed the Standard narrative.',
    );
    const selfSnapshot = buildJourneyMemorySnapshot({
      generatedAt: providerFixture.request.generatedAt,
      locale: providerFixture.request.locale,
      sources: [integrationSource(base, providerFixture.request)],
    });
    const selfExcluded = localExpertInterpretationProvider.interpret(providerFixture.request, {
      currentReadingId: 'continuity-provider-previous',
      journeyMemoryProvider: { getSnapshot: () => selfSnapshot },
    });
    assert(selfExcluded.continuity === null, 'Provider allowed current reading self-reference.');
  }

  const storageEnvelope = createFullStorageFixtureEnvelope();
  const storedReading = storageEnvelope.data.tarotReadings?.data[0]?.reading;
  assert(Boolean(storedReading?.crossSystemReasoning), 'Cross-system result was not persisted.');
  assert(Boolean(storedReading?.narrative), 'Narrative result was not persisted.');
  assert(Boolean(storedReading?.reasoningVersions), 'Engine lineage was not persisted.');
  assert(
    storedReading?.reasoningVersions?.tarotKnowledge === 'author-tarot-knowledge-v1',
    'Tarot knowledge lineage is missing.',
  );
  assert(
    storedReading?.reasoningVersions?.numerologyKnowledge === 'author-numerology-knowledge-v1',
    'Numerology knowledge lineage is missing.',
  );
  const sectionErrors = storageEnvelope.data.tarotReadings
    ? validateProductStorageSection('tarotReadings', storageEnvelope.data.tarotReadings)
    : [{ code: 'missing-section' }];
  assert(sectionErrors.length === 0, 'Extended Tarot storage section is invalid.');
  const exported = buildProductStorageExport(storageEnvelope, {
    exportedAt: '2026-08-05T12:00:00.000Z',
    scope: 'tarot-readings',
  });
  const importTarget = createProductStorageEnvelope({
    createdAt: '2026-08-05T12:00:00.000Z',
    locale: 'ru',
    productVersion: '6.5-fixture',
  });
  const imported = parseProductStorageImport(exported.json, importTarget, {
    mode: 'merge',
    now: '2026-08-05T12:00:01.000Z',
    productVersion: '6.5-fixture',
  });
  assert(imported.status === 'ready', 'Continuity export could not be imported.');
  assert(
    Boolean(imported.envelope?.data.tarotReadings?.data[0]?.reading.narrative),
    'Narrative was lost during export/import.',
  );
  assert(
    Boolean(imported.envelope?.data.tarotReadings?.data[0]?.reading.crossSystemReasoning),
    'Cross-system provenance was lost during export/import.',
  );
  if (storedReading) {
    const excluded = new Set([
      'continuity',
      'crossSystemReasoning',
      'expertInterpretation',
      'narrative',
      'reasoningVersions',
    ]);
    const legacyReading = Object.fromEntries(
      Object.entries(storedReading).filter(([key]) => !excluded.has(key)),
    );
    const migrated = migrateTarotReadingContinuity(legacyReading);
    const migratedAgain = migrateTarotReadingContinuity(migrated);
    assert(
      stableStringify(migrated) === stableStringify(migratedAgain),
      'Legacy reading migration is not idempotent.',
    );
    assert(
      migrated.reasoningVersions.status !== 'current',
      'Legacy reading received invented current lineage.',
    );
    assert(
      Object.values(migrated.reasoningVersions).includes('legacy-unavailable'),
      'Legacy lineage does not identify unavailable engine versions.',
    );
    const legacyData = {
      tarotReadings: {
        data: [{ bookmarked: false, reading: legacyReading, savedAt: storedReading.createdAt }],
        schemaVersion: 'tarot-storage-v1' as const,
      },
    };
    const firstLineageMigration = migrateProductStorageReadingLineage(
      legacyData as unknown as Parameters<typeof migrateProductStorageReadingLineage>[0],
    );
    const secondLineageMigration = migrateProductStorageReadingLineage(firstLineageMigration.data);
    assert(firstLineageMigration.changed, 'Legacy storage lineage migration was not activated.');
    assert(!secondLineageMigration.changed, 'Storage lineage migration is not idempotent.');
  }
  const journeyState = storageEnvelope.data.journey?.data;
  if (!journeyState) assert(false, 'Journey fixture state is unavailable.');
  else {
    const removed = removeTarotReadingFromJourney(journeyState, storageFixtureReading.id);
    const rebuilt = synchronizeJourneyMemory(
      removed,
      storageEnvelope.data.journeyMemory,
      '2026-08-05T12:00:02.000Z',
    );
    assert(removed.readings.length === 0, 'Reading deletion did not remove the target reading.');
    assert(
      rebuilt.section.data.entries.length === 0,
      'Deleted reading remained in Journey Memory.',
    );
    const visualOnlyState = {
      ...journeyState,
      readings: journeyState.readings.map((record) => ({
        ...record,
        reading: {
          ...record.reading,
          context: {
            ...record.reading.context,
            deckTheme: 'deep-water' as const,
            locale: 'en' as const,
          },
        },
      })),
    };
    assert(
      journeyMemoryFingerprint(visualOnlyState) === journeyMemoryFingerprint(journeyState),
      'Visual preferences invalidated Journey Memory.',
    );
    const bookmarkState = {
      ...journeyState,
      readings: journeyState.readings.map((record) => ({ ...record, favorite: !record.favorite })),
    };
    assert(
      journeyMemoryFingerprint(bookmarkState) !== journeyMemoryFingerprint(journeyState),
      'Bookmark change did not invalidate Journey Memory.',
    );
    const incomingReading = {
      ...storageFixtureReading,
      id: `${storageFixtureReading.id}:external`,
    };
    const reconciled = reconcileJourneyStateAfterConflict(
      journeyState,
      {
        ...journeyState,
        readings: [
          {
            favorite: false,
            reading: incomingReading,
            savedAt: '2026-08-05T12:00:03.000Z',
          },
        ],
      },
      '2026-08-05T12:00:03.000Z',
    );
    const reconciledReading = reconciled.readings.find(
      (record) => record.reading.id === incomingReading.id,
    )?.reading;
    assert(
      reconciled.readings.length === 2,
      'Conflict reconciliation lost or duplicated readings.',
    );
    assert(
      Boolean(reconciledReading?.continuity?.previousRelevantEntries.length),
      'Conflict retry did not rebuild continuity from the latest Journey.',
    );
    assert(
      createProductStorageDeletionPlan('tarot-readings').sectionsAffected.includes('journeyMemory'),
      'Tarot deletion plan does not invalidate Journey Memory.',
    );
  }
  return {
    assertionCount,
    errors,
    fixtureCount: readingContinuityFixtures.length,
    valid: errors.length === 0,
  };
}
