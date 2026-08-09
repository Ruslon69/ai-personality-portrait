import { createNumerologyProfile } from '../../lib/numerology-engine';
import {
  authorNumerologyKnowledgeBase,
  resolveAdvancedNumerologyKnowledge,
  validateAuthorNumerologyKnowledgeBase,
} from '@features/numerology-knowledge';
import { crossSystemFixtures } from '@features/cross-system-reasoning/fixtures';
import { LocalCrossSystemReasoningProvider } from '@features/cross-system-reasoning';
import {
  createNarrativeCompositionRequest,
  LocalNarrativeComposer,
  type NarrativeCandidate,
} from '@features/narrative-composition';
import { buildJourneyMemorySnapshot, type JourneyMemorySource } from '@features/journey-memory';
import { validateProductStorageSection } from '@features/product-storage/validation';
import { createAdvancedInterpretationNumerologyInput } from '@features/expert-interpretation';
import {
  createAdvancedNumerologyProfile,
  decomposeNumerologyBirthDate,
  explainNumerologyCalculation,
} from '../calculations';
import { MASTER_NUMBER_POLICY } from '../constants';
import {
  deserializeAdvancedNumerologyProfile,
  serializeAdvancedNumerologyProfile,
} from '../serialization';
import { validateAdvancedNumerologyProfile } from '../validation';
import { advancedNumerologyFixtures } from './fixtures';
import {
  ADVANCED_NUMEROLOGY_REFERENCE_VECTORS,
  independentlyCalculateReferenceVector,
} from './reference-vectors';

export type AdvancedNumerologyRuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runAdvancedNumerologyRuntimeSuite(): AdvancedNumerologyRuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  advancedNumerologyFixtures.forEach((fixture) => {
    const first = createAdvancedNumerologyProfile(
      fixture.birthDate,
      fixture.referenceDate,
      fixture.locale,
    );
    const second = createAdvancedNumerologyProfile(
      fixture.birthDate,
      fixture.referenceDate,
      fixture.locale,
    );
    const validation = validateAdvancedNumerologyProfile(first);
    assert(
      validation.valid,
      `${fixture.id}: ${validation.errors.map((item) => item.message).join(' | ')}`,
    );
    assert(
      serializeAdvancedNumerologyProfile(first) === serializeAdvancedNumerologyProfile(second),
      `${fixture.id}: same input is not deterministic.`,
    );
    assert(first.pinnacles.length === 4, `${fixture.id}: Pinnacle coverage is incomplete.`);
    assert(
      first.challenges.length === fixture.expected.challengeCount,
      `${fixture.id}: Challenge coverage changed.`,
    );
    assert(first.lifeCycles.length === 3, `${fixture.id}: Life Cycle coverage is incomplete.`);
    assert(
      first.existingCanonicalProfile.lifePath.value ===
        (fixture.expected.lifePath ?? first.existingCanonicalProfile.lifePath.value),
      `${fixture.id}: canonical Life Path changed (${first.existingCanonicalProfile.lifePath.value} !== ${fixture.expected.lifePath}).`,
    );
    if (fixture.expected.currentPinnacleOrdinal)
      assert(
        first.currentPinnacle.ordinal === fixture.expected.currentPinnacleOrdinal,
        `${fixture.id}: current Pinnacle mismatch.`,
      );
    if (fixture.expected.currentLifeCycleOrdinal)
      assert(
        first.currentLifeCycle.ordinal === fixture.expected.currentLifeCycleOrdinal,
        `${fixture.id}: current Life Cycle mismatch.`,
      );
    assert(
      explainNumerologyCalculation(first).length === 16,
      `${fixture.id}: explainability trace coverage changed.`,
    );
    const serialized = serializeAdvancedNumerologyProfile(first);
    assert(
      serializeAdvancedNumerologyProfile(deserializeAdvancedNumerologyProfile(serialized)) ===
        serialized,
      `${fixture.id}: serialization round-trip is unstable.`,
    );
  });
  ADVANCED_NUMEROLOGY_REFERENCE_VECTORS.forEach((vector) => {
    const profile = createAdvancedNumerologyProfile(vector.birthDate, vector.referenceDate, 'en');
    const actual = {
      challenges: profile.challenges.map((item) => item.result),
      decomposition: [
        profile.dateComponents.reducedMonth.value,
        profile.dateComponents.reducedDay.value,
        profile.dateComponents.reducedYear.value,
      ],
      lifeCycles: profile.lifeCycles.map((item) => item.value),
      lifePath: profile.existingCanonicalProfile.lifePath.value,
      pinnacles: profile.pinnacles.map((item) => item.result),
    };
    assert(
      JSON.stringify(actual) === JSON.stringify(vector.expected),
      `${vector.id}: canonical ${JSON.stringify(actual)} differs from ${JSON.stringify(vector.expected)}.`,
    );
    assert(
      JSON.stringify(independentlyCalculateReferenceVector(vector.birthDate)) ===
        JSON.stringify(vector.expected),
      `${vector.id}: independent algorithm disagrees with the reference vector.`,
    );
  });
  const karmicProfiles = ['1985-07-13', '1992-04-14', '1966-06-16', '1975-05-19'].map((birthDate) =>
    createAdvancedNumerologyProfile(birthDate, '2026-08-09', 'en'),
  );
  [13, 14, 16, 19].forEach((number, index) =>
    assert(
      karmicProfiles[index]?.karmicDebts.some((item) => item.debtNumber === number) ?? false,
      `Karmic debt ${number} was not detected from an eligible raw step.`,
    ),
  );
  const noDebt = createAdvancedNumerologyProfile('1991-01-01', '2026-08-09', 'en');
  assert(noDebt.karmicDebts.length === 0, 'A reduced 4/5/7/1 was falsely marked as karmic debt.');
  assert(
    Object.keys(MASTER_NUMBER_POLICY).length === 12 &&
      Object.values(MASTER_NUMBER_POLICY).every(Boolean),
    'Master Number policy matrix is incomplete.',
  );
  const leap = createAdvancedNumerologyProfile('2000-02-29', '2032-02-29', 'en');
  assert(
    leap.pinnacles.map((period) => period.startDate).join(':') ===
      ['2000-02-29', '2031-02-28', '2040-02-29', '2049-02-28'].join(':'),
    'Leap-day boundaries were not clamped deterministically.',
  );
  const before = createAdvancedNumerologyProfile('1990-01-01', '2023-07-01', 'en');
  const exact = createAdvancedNumerologyProfile('1990-01-01', '2024-01-01', 'en');
  const after = createAdvancedNumerologyProfile('1990-01-01', '2024-07-01', 'en');
  assert(
    before.transitions.pinnacle.withinTransitionWindow,
    'Six-month pre-transition window is missing.',
  );
  assert(
    exact.currentPinnacle.ordinal === 2,
    'Exact transition date did not select the new Pinnacle.',
  );
  assert(
    after.transitions.pinnacle.withinTransitionWindow,
    'Six-month post-transition window is missing.',
  );
  const baseAtFirst = createNumerologyProfile('1985-07-13', 'en', new Date(2026, 7, 9, 12));
  const advancedAtFirst = createAdvancedNumerologyProfile('1985-07-13', '2026-08-09', 'en');
  assert(
    JSON.stringify(baseAtFirst) === JSON.stringify(advancedAtFirst.existingCanonicalProfile),
    'Advanced calculation altered the canonical profile.',
  );
  const later = createAdvancedNumerologyProfile('1985-07-13', '2036-08-09', 'en');
  assert(
    later.existingCanonicalProfile.lifePath.value ===
      advancedAtFirst.existingCanonicalProfile.lifePath.value &&
      later.pinnacles.map((item) => item.result).join(':') ===
        advancedAtFirst.pinnacles.map((item) => item.result).join(':'),
    'Reference date changed the base advanced profile.',
  );
  assert(
    later.currentPinnacle.ordinal !== advancedAtFirst.currentPinnacle.ordinal,
    'Reference date did not change current-cycle resolution.',
  );
  ['2023-02-29', '2024-13-01', 'not-a-date'].forEach((birthDate) => {
    let rejected = false;
    try {
      decomposeNumerologyBirthDate(birthDate);
    } catch {
      rejected = true;
    }
    assert(rejected, `Impossible birth date ${birthDate} was accepted.`);
  });
  const damaged = {
    ...advancedAtFirst,
    currentPinnacle: { ...advancedAtFirst.currentPinnacle, status: 'past' as const },
  };
  assert(
    !validateAdvancedNumerologyProfile(damaged).valid,
    'Validator accepted a stale current Pinnacle.',
  );
  (['pinnacle', 'challenge', 'life-cycle'] as const).forEach((kind) =>
    assert(
      resolveAdvancedNumerologyKnowledge(kind, 4).contract.calculationSystem ===
        'pythagorean-date-cycles-v1',
      `${kind}: knowledge contract was not activated.`,
    ),
  );
  assert(
    validateAuthorNumerologyKnowledgeBase(authorNumerologyKnowledgeBase).valid,
    'Author Numerology Knowledge Base rejected activated lifecycle contracts.',
  );
  const baseCrossFixture = crossSystemFixtures.find((fixture) => fixture.input.context.numerology);
  if (!baseCrossFixture) errors.push('Cross-system integration fixture is unavailable.');
  else {
    const advancedInput = createAdvancedInterpretationNumerologyInput(advancedAtFirst);
    const input = {
      ...baseCrossFixture.input,
      context: {
        ...baseCrossFixture.input.context,
        numerology: {
          ...baseCrossFixture.input.context.numerology!,
          advanced: advancedInput,
        },
      },
    };
    const reasoningProvider = new LocalCrossSystemReasoningProvider();
    const reasoning = reasoningProvider.reason(input);
    assert(reasoningProvider.validate(reasoning).valid, 'Advanced Cross-System result is invalid.');
    assert(
      reasoning.signals.some((signal) => signal.semanticType === 'numerology.advanced.pinnacle'),
      'Cross-System reasoning did not receive current Pinnacle.',
    );
    assert(
      reasoning.signals.some((signal) => signal.semanticType === 'numerology.advanced.challenge'),
      'Cross-System reasoning did not receive current Challenge.',
    );
    const deep = createNarrativeCompositionRequest({
      composition: input.composition,
      connections: input.connections,
      context: input.context,
      evidence: input.evidence,
      fingerprint: 'advanced-numerology-deep',
      mode: 'deep',
      reasoning,
    });
    const short = createNarrativeCompositionRequest({
      composition: input.composition,
      connections: input.connections,
      context: input.context,
      evidence: input.evidence,
      fingerprint: 'advanced-numerology-short',
      mode: 'short',
      reasoning,
    });
    const isAdvancedCandidate = (item: NarrativeCandidate) =>
      item.semanticId.startsWith('numerology.advanced.');
    assert(deep.candidates.some(isAdvancedCandidate), 'Deep narrative omitted advanced periods.');
    assert(
      !short.candidates.some(isAdvancedCandidate),
      'Short narrative was overloaded with cycles.',
    );
    const composer = new LocalNarrativeComposer();
    const deepNarrative = composer.compose(deep);
    assert(composer.validate(deepNarrative).valid, 'Deep narrative with cycles is invalid.');
    assert(
      !short.candidates.some((item) => item.sourceId.includes('advanced-numerology')),
      'Short narrative retained an advanced-period source.',
    );
  }
  const memorySource = (
    id: string,
    createdAt: string,
    pinnacle: number,
    lifeCycle: number,
  ): JourneyMemorySource => ({
    bookmarked: false,
    cards: [],
    createdAt,
    engineVersions: { numerology: 'pythagorean-date-cycles-v1' },
    headline: id,
    id,
    interpretationFingerprint: `fingerprint:${id}`,
    kind: 'tarot-reading',
    locale: 'en',
    numbers: [
      {
        calculationId: 'current-pinnacle',
        systemVersion: 'pythagorean-date-cycles-v1',
        value: pinnacle,
      },
      {
        calculationId: 'current-life-cycle',
        systemVersion: 'pythagorean-date-cycles-v1',
        value: lifeCycle,
      },
      { calculationId: 'current-challenge', systemVersion: 'pythagorean-date-cycles-v1', value: 3 },
    ],
    period: 'year',
    practicalFocuses: [],
    quoteSources: [],
    readingType: 'year',
    reflections: [],
    sourceReferences: [{ id: `reading:${id}`, kind: 'reading', source: 'journey' }],
    spreadId: 'year',
    themes: [],
    topic: null,
    zodiac: null,
  });
  const noTransitionSnapshot = buildJourneyMemorySnapshot({
    generatedAt: '2026-01-01T12:00:00.000Z',
    locale: 'en',
    sources: [memorySource('one', '2026-01-01T12:00:00.000Z', 4, 2)],
  });
  const transitionSnapshot = buildJourneyMemorySnapshot({
    generatedAt: '2027-01-01T12:00:00.000Z',
    locale: 'en',
    sources: [
      memorySource('one', '2026-01-01T12:00:00.000Z', 4, 2),
      memorySource('two', '2027-01-01T12:00:00.000Z', 5, 3),
    ],
  });
  assert(
    !noTransitionSnapshot.milestones.some((item) =>
      ['first-pinnacle-transition', 'first-life-cycle-transition'].includes(item.type),
    ),
    'Journey created a long-term milestone without an actual transition.',
  );
  assert(
    transitionSnapshot.milestones.some((item) => item.type === 'first-pinnacle-transition') &&
      transitionSnapshot.milestones.some((item) => item.type === 'first-life-cycle-transition'),
    'Journey did not preserve actual long-term transitions.',
  );
  assert(
    transitionSnapshot.validation.valid,
    'Journey Memory rejected long-term transition integration.',
  );
  const storageSection = {
    data: {
      advancedProfile: advancedAtFirst,
      birthDate: advancedAtFirst.calculationMetadata.birthDate,
      profile: advancedAtFirst.existingCanonicalProfile,
    },
    schemaVersion: 'numerology-storage-v1' as const,
  };
  assert(
    validateProductStorageSection('numerology', storageSection).length === 0,
    'Storage rejected a valid optional advanced profile.',
  );
  assert(
    validateProductStorageSection('numerology', {
      data: { birthDate: '1985-07-13', profile: advancedAtFirst.existingCanonicalProfile },
      schemaVersion: 'numerology-storage-v1',
    }).length === 0,
    'Legacy Numerology storage compatibility changed.',
  );
  return {
    assertionCount,
    errors,
    fixtureCount: advancedNumerologyFixtures.length,
    valid: errors.length === 0,
  };
}
