import { MASTER_NUMBERS } from '../../numerology/lib/numerology-engine';
import {
  NUMEROLOGY_ARCHETYPE_IDS,
  NUMEROLOGY_KARMIC_VALUES,
  NUMEROLOGY_MASTER_VALUES,
  NUMEROLOGY_MOTIF_IDS,
  NUMEROLOGY_NARRATIVE_PURPOSES,
} from '../constants';
import {
  authorNumerologyKnowledgeBase,
  buildAuthorNumerologyKnowledgeBase,
  resolveNumerologyKnowledge,
  resolvePersonalMonthContext,
} from '../model';
import {
  deserializeNumerologyKnowledgeBase,
  serializeNumerologyKnowledgeBase,
} from '../serialization';
import type {
  AuthorNumerologyKnowledgeBase,
  NumerologyArchetypeId,
  NumerologyMotifId,
} from '../types';
import {
  validateAuthorNumerologyKnowledgeBase,
  validateNumerologyKnowledgeRepetition,
} from '../validation';
import { numerologyKnowledgeFixtures } from './fixtures';

export type NumerologyKnowledgeRuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runNumerologyKnowledgeFixtureSuite(): NumerologyKnowledgeRuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const validation = validateAuthorNumerologyKnowledgeBase(authorNumerologyKnowledgeBase);
  assert(
    validation.valid,
    `Knowledge validator failed: ${validation.errors.map((item) => item.message).join(' | ')}`,
  );
  numerologyKnowledgeFixtures.forEach((fixture) => {
    const entry = authorNumerologyKnowledgeBase.entries.find(
      (item) => item.identity.value === fixture.value,
    );
    assert(Boolean(entry), `${fixture.id}: number knowledge is missing.`);
    if (!entry) return;
    assert(entry.keywords.length >= 4, `${fixture.id}: keywords are incomplete.`);
    assert(entry.archetypeIds.length >= 2, `${fixture.id}: archetypes are incomplete.`);
    assert(entry.motifIds.length >= 2, `${fixture.id}: motifs are incomplete.`);
    assert(
      entry.narrativeFragments.length === 7,
      `${fixture.id}: narrative fragments are incomplete.`,
    );
    assert(
      NUMEROLOGY_NARRATIVE_PURPOSES.every((purpose) =>
        entry.narrativeFragments.some((item) => item.purpose === purpose),
      ),
      `${fixture.id}: a narrative purpose is missing.`,
    );
    fixture.expectedRoles.forEach((role) => {
      const first = resolveNumerologyKnowledge(fixture.value, role);
      const second = resolveNumerologyKnowledge(fixture.value, role);
      assert(
        Boolean(
          first.role.coreMeaning.id &&
          first.role.strength.id &&
          first.role.challenge.id &&
          first.role.growth.id &&
          first.role.innerLesson.id &&
          first.role.commonPattern.id &&
          first.role.energy.id &&
          first.role.warning.id &&
          first.role.opportunity.id &&
          first.role.reflection.id &&
          first.role.practicalAdvice.id,
        ),
        `${fixture.id}/${role}: semantic model is incomplete.`,
      );
      assert(
        JSON.stringify(first) === JSON.stringify(second),
        `${fixture.id}/${role}: resolution is not deterministic.`,
      );
      assert(first.role.identity.role === role, `${fixture.id}/${role}: role identity changed.`);
    });
    assert(
      Boolean(
        entry.personalYear.mainTheme.id &&
        entry.personalYear.amplified.id &&
        entry.personalYear.complexity.id &&
        entry.personalYear.bestDirection.id &&
        entry.personalYear.typicalLesson.id &&
        entry.personalYear.typicalMistake.id &&
        entry.personalYear.rhythm,
      ),
      `${fixture.id}: Personal Year philosophy is incomplete.`,
    );
    assert(
      Boolean(entry.personalMonth.emphasis.id && entry.personalMonth.practicalFocus.id),
      `${fixture.id}: Personal Month modifier is incomplete.`,
    );
    assert(
      Boolean(entry.personalDay.attention.id && entry.personalDay.boundary.id),
      `${fixture.id}: Personal Day micro-context is incomplete.`,
    );
    const isMaster = NUMEROLOGY_MASTER_VALUES.includes(fixture.value as 11 | 22 | 33);
    assert(
      Boolean(entry.masterPhilosophy) === isMaster,
      `${fixture.id}: master philosophy mismatch.`,
    );
    if (entry.masterPhilosophy)
      assert(
        entry.masterPhilosophy.preservedValue === fixture.value &&
          MASTER_NUMBERS.includes(entry.masterPhilosophy.preservedValue),
        `${fixture.id}: master value was reduced.`,
      );
    numerologyKnowledgeFixtures.forEach((monthFixture) => {
      const first = resolvePersonalMonthContext(fixture.value, monthFixture.value);
      const second = resolvePersonalMonthContext(fixture.value, monthFixture.value);
      assert(
        JSON.stringify(first) === JSON.stringify(second),
        `${fixture.id}/${monthFixture.value}: period modifier is not deterministic.`,
      );
      assert(
        first.year === entry.personalYear,
        `${fixture.id}: month context lost year philosophy.`,
      );
      assert(first.month.value === monthFixture.value, `${fixture.id}: month value changed.`);
    });
  });
  NUMEROLOGY_ARCHETYPE_IDS.forEach((id) => {
    assert(
      authorNumerologyKnowledgeBase.archetypes.some((item) => item.id === id),
      `Archetype ${id} is undefined.`,
    );
    assert(
      authorNumerologyKnowledgeBase.entries.some((item) => item.archetypeIds.includes(id)),
      `Archetype ${id} is unused.`,
    );
  });
  NUMEROLOGY_MOTIF_IDS.forEach((id) => {
    assert(
      authorNumerologyKnowledgeBase.motifs.some((item) => item.id === id),
      `Motif ${id} is undefined.`,
    );
    assert(
      authorNumerologyKnowledgeBase.entries.some((item) => item.motifIds.includes(id)),
      `Motif ${id} is unused.`,
    );
  });
  NUMEROLOGY_KARMIC_VALUES.forEach((value) =>
    assert(
      authorNumerologyKnowledgeBase.karmicLessons.some(
        (item) => item.value === value && item.activeByDefault === false,
      ),
      `Karmic ${value} was not preserved as inactive knowledge.`,
    ),
  );
  assert(
    authorNumerologyKnowledgeBase.lifeCycleContracts.every(
      (item) => item.calculationImplemented === false,
    ),
    'A future life-cycle calculation was activated.',
  );
  assert(
    validateNumerologyKnowledgeRepetition(authorNumerologyKnowledgeBase).length === 0,
    'Semantic repetition validation failed.',
  );
  const rebuilt = buildAuthorNumerologyKnowledgeBase();
  const serialized = serializeNumerologyKnowledgeBase(authorNumerologyKnowledgeBase);
  assert(
    serialized === serializeNumerologyKnowledgeBase(rebuilt),
    'Knowledge build is not deterministic.',
  );
  assert(
    serialized === serializeNumerologyKnowledgeBase(deserializeNumerologyKnowledgeBase(serialized)),
    'Serialization round-trip is unstable.',
  );

  const first = authorNumerologyKnowledgeBase.entries[0];
  const duplicate: AuthorNumerologyKnowledgeBase = {
    ...authorNumerologyKnowledgeBase,
    entries: [...authorNumerologyKnowledgeBase.entries, first],
  };
  assert(
    validateAuthorNumerologyKnowledgeBase(duplicate).errors.some(
      (item) => item.code === 'duplicate-id',
    ),
    'Validator accepted duplicate number knowledge.',
  );
  const unknownArchetype: AuthorNumerologyKnowledgeBase = {
    ...authorNumerologyKnowledgeBase,
    entries: [
      { ...first, archetypeIds: [...first.archetypeIds, 'unknown' as NumerologyArchetypeId] },
      ...authorNumerologyKnowledgeBase.entries.slice(1),
    ],
  };
  assert(
    validateAuthorNumerologyKnowledgeBase(unknownArchetype).errors.some(
      (item) => item.code === 'broken-reference',
    ),
    'Validator accepted an unknown archetype.',
  );
  const unknownMotif: AuthorNumerologyKnowledgeBase = {
    ...authorNumerologyKnowledgeBase,
    entries: [
      { ...first, motifIds: [...first.motifIds, 'unknown' as NumerologyMotifId] },
      ...authorNumerologyKnowledgeBase.entries.slice(1),
    ],
  };
  assert(
    validateAuthorNumerologyKnowledgeBase(unknownMotif).errors.some(
      (item) => item.code === 'broken-reference',
    ),
    'Validator accepted an unknown motif.',
  );
  const brokenRelation: AuthorNumerologyKnowledgeBase = {
    ...authorNumerologyKnowledgeBase,
    tarotResonances: [
      { ...authorNumerologyKnowledgeBase.tarotResonances[0], cardIds: ['missing-card'] },
      ...authorNumerologyKnowledgeBase.tarotResonances.slice(1),
    ],
  };
  assert(
    validateAuthorNumerologyKnowledgeBase(brokenRelation).errors.some(
      (item) => item.code === 'broken-reference',
    ),
    'Validator accepted a broken Tarot relation.',
  );

  return {
    assertionCount,
    errors,
    fixtureCount: numerologyKnowledgeFixtures.length,
    valid: errors.length === 0,
  };
}
