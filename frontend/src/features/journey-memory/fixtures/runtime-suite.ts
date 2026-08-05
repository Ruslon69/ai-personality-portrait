import { createNumerologyProfile } from '@features/numerology';
import { createTarotReading, type TarotReadingContext } from '@features/tarot';
import type { JourneyState } from '@features/journey';

import { buildJourneyMemorySnapshot } from '../model';
import {
  canonicalThemeId,
  journeyStateToMemorySources,
  prepareJourneyMemoryMigration,
} from '../normalization';
import { deserializeJourneyMemorySnapshot, serializeJourneyMemorySnapshot } from '../serialization';
import type { JourneyMemorySnapshot } from '../types';
import { stableStringify } from '../utils';
import { validateJourneyMemorySnapshot } from '../validation';
import { journeyMemoryFixtures } from './fixtures';

export type JourneyMemoryRuntimeReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  suites: Readonly<Record<'determinism' | 'integration' | 'serialization' | 'validation', boolean>>;
  valid: boolean;
};

type Assert = (condition: boolean, message: string) => void;

function runFixtureChecks(assert: Assert) {
  const snapshots = new Map<string, JourneyMemorySnapshot>();
  journeyMemoryFixtures.forEach((fixture) => {
    const first = buildJourneyMemorySnapshot({
      generatedAt: fixture.generatedAt,
      locale: 'ru',
      sources: fixture.sources,
    });
    const second = buildJourneyMemorySnapshot({
      generatedAt: fixture.generatedAt,
      locale: 'ru',
      sources: [...fixture.sources].reverse(),
    });
    snapshots.set(fixture.id, first);
    assert(first.validation.valid, `${fixture.id}: snapshot validation failed.`);
    assert(
      first.entries.length === fixture.expected.entryCount,
      `${fixture.id}: unexpected entry count.`,
    );
    assert(
      stableStringify(first) === stableStringify(second),
      `${fixture.id}: input order changed the deterministic snapshot.`,
    );
    assert(
      first.chapters.every((chapter, index) => chapter.ordinal === index + 1),
      `${fixture.id}: chapter order is unstable.`,
    );
    assert(
      new Set(first.chapters.flatMap((chapter) => chapter.linkedEntryIds)).size ===
        first.entries.length,
      `${fixture.id}: chapter entry inclusion is inconsistent.`,
    );
    assert(
      stableStringify(deserializeJourneyMemorySnapshot(serializeJourneyMemorySnapshot(first))) ===
        stableStringify(first),
      `${fixture.id}: JSON round-trip changed the snapshot.`,
    );
    if (fixture.expected.recurringTheme)
      assert(
        first.recurringThemes.some((theme) => theme.themeId === fixture.expected.recurringTheme),
        `${fixture.id}: recurring theme was not detected.`,
      );
    if (fixture.expected.trend)
      assert(
        first.trends.some((theme) => theme.currentTrend === fixture.expected.trend),
        `${fixture.id}: expected trend ${fixture.expected.trend} was not detected.`,
      );
    if (fixture.expected.milestone)
      assert(
        first.milestones.some((milestone) => milestone.type === fixture.expected.milestone),
        `${fixture.id}: milestone ${fixture.expected.milestone} was not detected.`,
      );
    if (fixture.expected.patternRelation)
      assert(
        first.cardPatterns.some((pattern) => pattern.relation === fixture.expected.patternRelation),
        `${fixture.id}: card relation ${fixture.expected.patternRelation} was not detected.`,
      );
    if (fixture.expected.numberCompatibility)
      assert(
        first.numberPatterns.some(
          (pattern) => pattern.compatibility === fixture.expected.numberCompatibility,
        ),
        `${fixture.id}: number compatibility was not classified.`,
      );
    if (fixture.expected.yearCount !== undefined)
      assert(
        first.yearSummaries.length === fixture.expected.yearCount,
        `${fixture.id}: unexpected year summary count.`,
      );
  });
  const sameHeadline = snapshots.get('same-headline-different-theme');
  assert(
    Boolean(sameHeadline && sameHeadline.recurringThemes.length === 0),
    'Matching headlines were incorrectly treated as semantic recurrence.',
  );
  const duplicate = snapshots.get('duplicate-serialized-entry');
  assert(
    Boolean(duplicate && duplicate.entries.length === 1),
    'Duplicate entry was not normalized predictably.',
  );
  const resolved = snapshots.get('resolved-theme');
  assert(
    Boolean(resolved?.trends.some((trend) => trend.currentTrend === 'resolved')),
    'Resolved theme logic failed.',
  );
  const multiYear = snapshots.get('multi-year-journey');
  assert(Boolean(multiYear?.yearSummaries.length === 3), 'Multi-year summaries are incomplete.');
  assert(
    canonicalThemeId('theme.context.relationships') ===
      canonicalThemeId('theme.context.relationship'),
    'Semantic theme aliases were not normalized.',
  );
  return snapshots;
}

function runValidatorChecks(base: JourneyMemorySnapshot, assert: Assert) {
  const wrongVersion = {
    ...base,
    metadata: {
      ...base.metadata,
      versions: { ...base.metadata.versions, engine: 'journey-memory-v0' as 'journey-memory-v1' },
    },
  };
  assert(
    validateJourneyMemorySnapshot(wrongVersion).errors.some(
      (error) => error.code === 'invalid-version',
    ),
    'Validator accepted an invalid engine version.',
  );
  if (base.entries[0]) {
    if (base.entries[1]) {
      const duplicateId = {
        ...base,
        entries: [
          base.entries[0],
          { ...base.entries[1], id: base.entries[0].id },
          ...base.entries.slice(2),
        ],
      };
      assert(
        validateJourneyMemorySnapshot(duplicateId).errors.some(
          (error) => error.code === 'duplicate-id',
        ),
        'Validator accepted duplicate entry IDs.',
      );
      const wrongChronology = {
        ...base,
        entries: [
          { ...base.entries[0], createdAt: '2026-12-01T00:00:00.000Z' },
          { ...base.entries[1], createdAt: '2026-01-01T00:00:00.000Z' },
          ...base.entries.slice(2),
        ],
      };
      assert(
        validateJourneyMemorySnapshot(wrongChronology).errors.some(
          (error) => error.code === 'invalid-chronology',
        ),
        'Validator accepted non-chronological entries.',
      );
    }
    const nonFinite = {
      ...base,
      entries: [
        {
          ...base.entries[0],
          numbers: [{ calculationId: 'personal-year', systemVersion: 'v1', value: Infinity }],
        },
        ...base.entries.slice(1),
      ],
    };
    assert(
      validateJourneyMemorySnapshot(nonFinite).errors.some(
        (error) => error.code === 'non-finite-number',
      ),
      'Validator accepted Infinity.',
    );
    const undefinedValue = {
      ...base,
      metadata: { ...base.metadata, extra: undefined },
    } as unknown as JourneyMemorySnapshot;
    assert(
      validateJourneyMemorySnapshot(undefinedValue).errors.some(
        (error) => error.code === 'undefined-value',
      ),
      'Validator accepted undefined.',
    );
  }
  if (base.chapters[0]) {
    const wrongOrdinal = {
      ...base,
      chapters: [{ ...base.chapters[0], ordinal: 4 }, ...base.chapters.slice(1)],
    };
    assert(
      validateJourneyMemorySnapshot(wrongOrdinal).errors.some(
        (error) => error.code === 'invalid-chronology',
      ),
      'Validator accepted an invalid chapter ordinal.',
    );
    if (base.chapters[1] && base.chapters[0].linkedEntryIds[0]) {
      const duplicateInclusion = {
        ...base,
        chapters: [
          base.chapters[0],
          {
            ...base.chapters[1],
            linkedEntryIds: [
              ...base.chapters[1].linkedEntryIds,
              base.chapters[0].linkedEntryIds[0],
            ],
          },
          ...base.chapters.slice(2),
        ],
      };
      assert(
        validateJourneyMemorySnapshot(duplicateInclusion).errors.some(
          (error) => error.code === 'duplicate-entry-inclusion',
        ),
        'Validator accepted duplicate chapter entry inclusion.',
      );
    }
  }
  if (base.yearSummaries[0]) {
    const wrongYear = {
      ...base,
      yearSummaries: [{ ...base.yearSummaries[0], entryCount: 99 }, ...base.yearSummaries.slice(1)],
    };
    assert(
      validateJourneyMemorySnapshot(wrongYear).errors.some(
        (error) => error.code === 'inconsistent-year-summary',
      ),
      'Validator accepted an inconsistent year summary.',
    );
  }
  if (base.transitions[0]) {
    const invalidReference = {
      ...base,
      transitions: [
        { ...base.transitions[0], toEntryId: 'missing-entry' },
        ...base.transitions.slice(1),
      ],
    };
    assert(
      validateJourneyMemorySnapshot(invalidReference).errors.some(
        (error) => error.code === 'invalid-reference',
      ),
      'Validator accepted an unknown transition entry.',
    );
  }
  const inconsistentMilestone = {
    ...base,
    milestones: [
      ...base.milestones,
      {
        entryIds: ['missing-entry'],
        id: 'invalid-milestone',
        occurredAt: '2026-01-01T00:00:00.000Z',
        semanticSummary: { key: 'invalid', params: {} },
        type: 'first-reading' as const,
      },
    ],
  };
  assert(
    validateJourneyMemorySnapshot(inconsistentMilestone).errors.some(
      (error) => error.code === 'inconsistent-milestone',
    ),
    'Validator accepted an inconsistent milestone.',
  );
  const circular = { ...base, metadata: { ...base.metadata } } as JourneyMemorySnapshot & {
    circular?: unknown;
  };
  circular.circular = circular;
  assert(
    validateJourneyMemorySnapshot(circular).errors.some(
      (error) => error.code === 'serialization-error',
    ),
    'Validator accepted a circular reference.',
  );
}

function runIntegrationChecks(assert: Assert) {
  const numerology = createNumerologyProfile(
    '1990-05-17',
    'ru',
    new Date('2026-08-04T12:00:00.000Z'),
  );
  const context: TarotReadingContext = {
    birthDate: '1990-05-17',
    deckTheme: 'cosmic-minimal',
    interests: ['technology'],
    locale: 'ru',
    numerology,
    period: 'day',
    psychologyAnswers: [
      { optionId: 'test', questionId: 'decision-style' },
      { optionId: 'clarity', questionId: 'reading-intent' },
    ],
    seed: 'journey-adapter-fixture',
    selectionMode: 'automatic',
    spreadId: 'day',
  };
  const reading = createTarotReading(
    context,
    [{ cardId: 'major-star', orientation: 'upright', positionId: 'day-energy' }],
    '2026-08-04T12:30:00.000Z',
  );
  const state: JourneyState = {
    dailyCards: {},
    identity: 'fixture-identity',
    readings: [{ favorite: true, reading, savedAt: '2026-08-04T12:31:00.000Z' }],
  };
  const sources = journeyStateToMemorySources(state);
  const migration = prepareJourneyMemoryMigration(state, '2026-08-04T12:32:00.000Z');
  const snapshot = buildJourneyMemorySnapshot({
    generatedAt: migration.generatedAt,
    locale: 'ru',
    sources: migration.sources,
  });
  assert(sources.length === 1, 'Journey state adapter changed reading count.');
  assert(snapshot.validation.valid, 'Adapted Journey state produced an invalid snapshot.');
  assert(snapshot.entries[0]?.bookmarked === true, 'Bookmark state was not preserved.');
  assert(snapshot.entries[0]?.cards[0]?.id === 'major-star', 'Card reference was not preserved.');
  assert(
    snapshot.entries[0]?.engineVersions.content === 'author-content-v1',
    'Interpretation engine versions were not preserved.',
  );
}

export function runJourneyMemoryRuntimeSuite(): JourneyMemoryRuntimeReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert: Assert = (condition, message) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const start = errors.length;
  const snapshots = runFixtureChecks(assert);
  const determinism = errors.length === start;
  const validationStart = errors.length;
  const validatorBase = snapshots.get('ten-readings');
  if (validatorBase) runValidatorChecks(validatorBase, assert);
  const validation = errors.length === validationStart;
  const serializationStart = errors.length;
  snapshots.forEach((snapshot, id) =>
    assert(
      stableStringify(
        deserializeJourneyMemorySnapshot(serializeJourneyMemorySnapshot(snapshot)),
      ) === stableStringify(snapshot),
      `${id}: serialization suite failed.`,
    ),
  );
  const serialization = errors.length === serializationStart;
  const integrationStart = errors.length;
  runIntegrationChecks(assert);
  const integration = errors.length === integrationStart;
  return {
    assertionCount,
    errors,
    fixtureCount: journeyMemoryFixtures.length,
    suites: { determinism, integration, serialization, validation },
    valid: errors.length === 0,
  };
}
