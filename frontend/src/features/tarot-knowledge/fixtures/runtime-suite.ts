import { standardTarotDeck } from '../../tarot/data/deck';
import type { TarotOrientation } from '../../tarot/types';
import {
  TAROT_ARCHETYPE_IDS,
  TAROT_KNOWLEDGE_RELATION_KINDS,
  TAROT_REVERSED_FACETS,
  TAROT_SYMBOLIC_MOTIF_IDS,
} from '../constants';
import {
  authorTarotKnowledgeBase,
  buildAuthorTarotKnowledgeBase,
  resolveTarotKnowledge,
} from '../model';
import { deserializeTarotKnowledgeBase, serializeTarotKnowledgeBase } from '../serialization';
import type { AuthorTarotKnowledgeBase, TarotSemanticTagId } from '../types';
import { validateAuthorTarotKnowledgeBase, validateTarotKnowledgeRepetition } from '../validation';
import { tarotKnowledgeFixtures } from './fixtures';

export type TarotKnowledgeRuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runTarotKnowledgeFixtureSuite(): TarotKnowledgeRuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const validation = validateAuthorTarotKnowledgeBase(authorTarotKnowledgeBase);
  assert(
    validation.valid,
    `Knowledge validator failed: ${validation.errors.map((error) => error.message).join(' | ')}`,
  );
  assert(
    authorTarotKnowledgeBase.entries.length === 78,
    'Knowledge base does not contain 78 cards.',
  );
  assert(
    authorTarotKnowledgeBase.entries.filter((card) => card.identity.arcana === 'major').length ===
      22,
    'Knowledge base does not contain 22 Major Arcana.',
  );
  assert(
    authorTarotKnowledgeBase.entries.filter((card) => card.identity.arcana === 'minor').length ===
      56,
    'Knowledge base does not contain 56 Minor Arcana.',
  );

  tarotKnowledgeFixtures.forEach((fixture) => {
    const card = authorTarotKnowledgeBase.entries.find(
      (entry) => entry.identity.cardId === fixture.cardId,
    );
    assert(Boolean(card), `${fixture.id}: card knowledge is missing.`);
    if (!card) return;
    assert(card.identity.arcana === fixture.expectedArcana, `${fixture.id}: arcana changed.`);
    assert(card.archetypeIds.length >= 2, `${fixture.id}: archetype context is too narrow.`);
    assert(card.symbolicMotifIds.length >= 2, `${fixture.id}: symbolic motifs are incomplete.`);
    assert(card.keywords.length >= 4, `${fixture.id}: semantic keywords are incomplete.`);
    assert(card.reflections.length >= 5, `${fixture.id}: reflection concepts are incomplete.`);
    assert(
      TAROT_REVERSED_FACETS.every((facet) => Boolean(card.reversed.facets[facet])),
      `${fixture.id}: reversed philosophy is incomplete.`,
    );
    assert(
      Object.values(card.practical).every((item) =>
        Boolean(item.id && item.verb && item.object && item.supportingTag),
      ),
      `${fixture.id}: practical layer is incomplete.`,
    );
    fixture.expectedSpreadContexts.forEach((spread) => {
      assert(Boolean(card.spreadContexts[spread]), `${fixture.id}: ${spread} modifier is missing.`);
      (['upright', 'reversed'] as const satisfies readonly TarotOrientation[]).forEach(
        (orientation) => {
          const first = resolveTarotKnowledge(
            authorTarotKnowledgeBase,
            fixture.cardId,
            orientation,
            spread,
            card.tagIds.slice(0, 2),
          );
          const second = resolveTarotKnowledge(
            authorTarotKnowledgeBase,
            fixture.cardId,
            orientation,
            spread,
            card.tagIds.slice(0, 2),
          );
          assert(
            serializeValue(first) === serializeValue(second),
            `${fixture.id}: ${orientation}/${spread} resolution is not deterministic.`,
          );
          assert(first.concepts.length >= 3, `${fixture.id}: resolved concepts are incomplete.`);
          assert(
            first.spreadModifier.context === spread,
            `${fixture.id}: spread modifier changed.`,
          );
          assert(
            first.reflection.orientation === 'both' || first.reflection.orientation === orientation,
            `${fixture.id}: reflection orientation is incompatible.`,
          );
          assert(
            first.reflection.spreadContexts.includes(spread),
            `${fixture.id}: reflection does not represent ${spread}.`,
          );
        },
      );
    });
    const upright = resolveTarotKnowledge(
      authorTarotKnowledgeBase,
      fixture.cardId,
      'upright',
      'generic',
    );
    const reversed = resolveTarotKnowledge(
      authorTarotKnowledgeBase,
      fixture.cardId,
      'reversed',
      'generic',
    );
    assert(
      serializeValue(upright.concepts) !== serializeValue(reversed.concepts),
      `${fixture.id}: reversed semantics duplicate upright semantics.`,
    );
    const primaryReflection = resolveTarotKnowledge(
      authorTarotKnowledgeBase,
      fixture.cardId,
      'upright',
      'generic',
      [card.coreEnergy.subject],
    ).reflection;
    const secondaryReflection = resolveTarotKnowledge(
      authorTarotKnowledgeBase,
      fixture.cardId,
      'upright',
      'generic',
      [card.coreEnergy.object],
    ).reflection;
    assert(
      primaryReflection.id !== secondaryReflection.id,
      `${fixture.id}: reflection did not respond to the selected theme.`,
    );
  });

  TAROT_ARCHETYPE_IDS.forEach((id) => {
    assert(
      authorTarotKnowledgeBase.archetypes.some((archetype) => archetype.id === id),
      `Archetype ${id} is not defined.`,
    );
    assert(
      authorTarotKnowledgeBase.entries.some((card) => card.archetypeIds.includes(id)),
      `Archetype ${id} is not referenced by a card.`,
    );
  });
  TAROT_SYMBOLIC_MOTIF_IDS.forEach((id) => {
    assert(
      authorTarotKnowledgeBase.motifs.some((motif) => motif.id === id),
      `Motif ${id} is not defined.`,
    );
    assert(
      authorTarotKnowledgeBase.entries.some((card) => card.symbolicMotifIds.includes(id)),
      `Motif ${id} is not referenced by a card.`,
    );
  });
  TAROT_KNOWLEDGE_RELATION_KINDS.forEach((kind) => {
    assert(
      authorTarotKnowledgeBase.relations.some((relation) => relation.kind === kind),
      `Knowledge graph relation ${kind} is not represented.`,
    );
  });

  const rebuilt = buildAuthorTarotKnowledgeBase();
  const serialized = serializeTarotKnowledgeBase(authorTarotKnowledgeBase);
  assert(
    serialized === serializeTarotKnowledgeBase(rebuilt),
    'Knowledge-base build is not deterministic.',
  );
  assert(
    serialized === serializeTarotKnowledgeBase(deserializeTarotKnowledgeBase(serialized)),
    'Knowledge-base JSON round-trip is not stable.',
  );
  assert(
    validateTarotKnowledgeRepetition(authorTarotKnowledgeBase).length === 0,
    'Repetition validation failed.',
  );
  assert(
    standardTarotDeck.cards.every((card) =>
      authorTarotKnowledgeBase.entries.some((entry) => entry.identity.cardId === card.id),
    ),
    'Canonical deck and knowledge-base coverage differ.',
  );

  const firstCard = authorTarotKnowledgeBase.entries[0];
  const duplicateBase: AuthorTarotKnowledgeBase = {
    ...authorTarotKnowledgeBase,
    entries: [...authorTarotKnowledgeBase.entries, firstCard],
  };
  assert(
    validateAuthorTarotKnowledgeBase(duplicateBase).errors.some(
      (error) => error.code === 'duplicate-id',
    ),
    'Validator accepted a duplicate card id.',
  );
  const unknownTagBase: AuthorTarotKnowledgeBase = {
    ...authorTarotKnowledgeBase,
    entries: [
      {
        ...firstCard,
        tagIds: [...firstCard.tagIds, 'unknown-tag' as TarotSemanticTagId],
      },
      ...authorTarotKnowledgeBase.entries.slice(1),
    ],
  };
  assert(
    validateAuthorTarotKnowledgeBase(unknownTagBase).errors.some(
      (error) => error.code === 'invalid-enum',
    ),
    'Validator accepted an unknown semantic tag.',
  );
  const cycleBase: AuthorTarotKnowledgeBase = {
    ...authorTarotKnowledgeBase,
    relations: [
      ...authorTarotKnowledgeBase.relations,
      {
        id: 'fixture.self-cycle',
        kind: 'mirrors',
        reasonTags: ['reflection'],
        sourceCardId: firstCard.identity.cardId,
        targetCardId: firstCard.identity.cardId,
      },
    ],
  };
  assert(
    validateAuthorTarotKnowledgeBase(cycleBase).errors.some((error) => error.code === 'cycle'),
    'Validator accepted a cyclic relation.',
  );

  return {
    assertionCount,
    errors,
    fixtureCount: tarotKnowledgeFixtures.length,
    valid: errors.length === 0,
  };
}

function serializeValue(value: unknown): string {
  return JSON.stringify(value);
}
