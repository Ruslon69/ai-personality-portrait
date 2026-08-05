import { standardTarotDeck } from '../../tarot/data/deck';
import {
  TAROT_ARCHETYPE_IDS,
  TAROT_KNOWLEDGE_RELATION_KINDS,
  TAROT_KNOWLEDGE_SPREAD_CONTEXTS,
  TAROT_REFLECTION_STEMS,
  TAROT_REVERSED_FACETS,
  TAROT_SEMANTIC_PROCESSES,
  TAROT_SEMANTIC_TAGS,
  TAROT_SYMBOLIC_MOTIF_IDS,
} from '../constants';
import { serializeTarotKnowledgeBase } from '../serialization';
import type {
  AuthorTarotKnowledgeBase,
  TarotCardKnowledge,
  TarotKnowledgeValidationError,
  TarotKnowledgeValidationResult,
  TarotSemanticConcept,
} from '../types';

function allConcepts(card: TarotCardKnowledge): readonly TarotSemanticConcept[] {
  return [
    card.coreEnergy,
    card.lightExpression,
    card.shadowExpression,
    card.gift,
    card.challenge,
    card.growthDirection,
    card.typicalObstacle,
    card.relationshipMeaning,
    card.careerMeaning,
    card.moneyMeaning,
    card.personalDevelopment,
    card.decisionMaking,
    card.energyToday,
    card.warning,
    card.opportunity,
    card.misconception,
    ...Object.values(card.reversed.facets),
    card.reversed.integration,
    ...Object.values(card.spreadContexts).map((modifier) => modifier.emphasis),
  ];
}

function findCycle(
  cardIds: readonly string[],
  edges: readonly { sourceCardId: string; targetCardId: string }[],
): readonly string[] | undefined {
  const adjacency = new Map(cardIds.map((id) => [id, [] as string[]]));
  edges.forEach((edge) => adjacency.get(edge.sourceCardId)?.push(edge.targetCardId));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const path: string[] = [];
  const walk = (id: string): readonly string[] | undefined => {
    if (visiting.has(id)) return [...path.slice(path.indexOf(id)), id];
    if (visited.has(id)) return undefined;
    visiting.add(id);
    path.push(id);
    for (const target of adjacency.get(id) ?? []) {
      const cycle = walk(target);
      if (cycle) return cycle;
    }
    path.pop();
    visiting.delete(id);
    visited.add(id);
    return undefined;
  };
  for (const id of cardIds) {
    const cycle = walk(id);
    if (cycle) return cycle;
  }
  return undefined;
}

function addDuplicateErrors(
  values: readonly string[],
  path: string,
  errors: TarotKnowledgeValidationError[],
) {
  const seen = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) {
      errors.push({ code: 'duplicate-id', message: `Duplicate stable id: ${value}.`, path });
    }
    seen.add(value);
  });
}

function jaccard(left: readonly string[], right: readonly string[]): number {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const overlap = [...leftSet].filter((value) => rightSet.has(value)).length;
  return overlap / new Set([...leftSet, ...rightSet]).size;
}

export function validateTarotKnowledgeRepetition(
  knowledgeBase: AuthorTarotKnowledgeBase,
): readonly TarotKnowledgeValidationError[] {
  const errors: TarotKnowledgeValidationError[] = [];
  const semanticSignatures = new Map<string, string>();
  const reflectionSignatures = new Map<string, string>();
  const practicalSignatures = new Map<string, string>();
  knowledgeBase.entries.forEach((card) => {
    const cardId = card.identity.cardId;
    const semantic = [
      card.coreEnergy.subject,
      card.coreEnergy.process,
      card.coreEnergy.object,
      card.challenge.subject,
      card.growthDirection.object,
      card.identity.rankId,
      card.identity.suit ?? 'major',
    ].join(':');
    const previousSemantic = semanticSignatures.get(semantic);
    if (previousSemantic) {
      errors.push({
        code: 'repetition',
        message: `${cardId} duplicates the semantic foundation of ${previousSemantic}.`,
        path: `entries.${cardId}`,
      });
    }
    semanticSignatures.set(semantic, cardId);

    card.reflections.forEach((reflection) => {
      const signature = [
        reflection.stem,
        reflection.orientation,
        reflection.spreadContexts.join(','),
        reflection.focusTags.join(','),
        reflection.themeTags.join(','),
      ].join(':');
      const previous = reflectionSignatures.get(signature);
      if (previous) {
        errors.push({
          code: 'repetition',
          message: `${reflection.id} duplicates reflection semantics from ${previous}.`,
          path: `entries.${cardId}.reflections`,
        });
      }
      reflectionSignatures.set(signature, reflection.id);
    });

    const practical = Object.values(card.practical)
      .map((item) => `${item.verb}:${item.object}:${item.supportingTag}`)
      .join('|');
    const previousPractical = practicalSignatures.get(practical);
    if (previousPractical) {
      errors.push({
        code: 'repetition',
        message: `${cardId} duplicates the practical layer of ${previousPractical}.`,
        path: `entries.${cardId}.practical`,
      });
    }
    practicalSignatures.set(practical, cardId);
  });
  for (let left = 0; left < knowledgeBase.entries.length; left += 1) {
    for (let right = left + 1; right < knowledgeBase.entries.length; right += 1) {
      const leftCard = knowledgeBase.entries[left];
      const rightCard = knowledgeBase.entries[right];
      if (jaccard(leftCard.keywords, rightCard.keywords) > 0.8) {
        errors.push({
          code: 'repetition',
          message: `${leftCard.identity.cardId} and ${rightCard.identity.cardId} have overly similar keywords.`,
          path: 'entries.keywords',
        });
      }
    }
  }
  return errors;
}

export function validateAuthorTarotKnowledgeBase(
  knowledgeBase: AuthorTarotKnowledgeBase,
): TarotKnowledgeValidationResult {
  const errors: TarotKnowledgeValidationError[] = [];
  const cardIds = knowledgeBase.entries.map((card) => card.identity.cardId);
  const canonicalCardIds = standardTarotDeck.cards.map((card) => card.id);
  if (knowledgeBase.entries.length !== 78 || knowledgeBase.metadata.cardCount !== 78) {
    errors.push({
      code: 'invalid-count',
      message: 'Knowledge base must contain 78 cards.',
      path: 'entries',
    });
  }
  if (
    canonicalCardIds.some((id) => !cardIds.includes(id)) ||
    cardIds.some((id) => !canonicalCardIds.includes(id))
  ) {
    errors.push({
      code: 'broken-reference',
      message: 'Knowledge card ids do not match the canonical standard deck.',
      path: 'entries',
    });
  }
  addDuplicateErrors(cardIds, 'entries', errors);
  addDuplicateErrors(
    knowledgeBase.relations.map((relation) => relation.id),
    'relations',
    errors,
  );
  addDuplicateErrors(
    knowledgeBase.entries.flatMap((card) => [
      ...allConcepts(card).map((item) => item.id),
      ...card.reflections.map((item) => item.id),
      ...Object.values(card.practical).map((item) => item.id),
    ]),
    'entries.semanticIds',
    errors,
  );

  const validTags = new Set(TAROT_SEMANTIC_TAGS.map((tag) => tag.id));
  const validProcesses = new Set(TAROT_SEMANTIC_PROCESSES);
  const validArchetypes = new Set(TAROT_ARCHETYPE_IDS);
  const validMotifs = new Set(TAROT_SYMBOLIC_MOTIF_IDS);
  knowledgeBase.entries.forEach((card) => {
    const path = `entries.${card.identity.cardId}`;
    if (
      !card.identity.signature ||
      !card.identity.rankId ||
      card.keywords.some((keyword) => !keyword)
    ) {
      errors.push({ code: 'empty-field', message: 'Card identity or keywords are empty.', path });
    }
    card.tagIds.forEach((tag) => {
      if (!validTags.has(tag))
        errors.push({
          code: 'invalid-enum',
          message: `Unknown tag ${tag}.`,
          path: `${path}.tagIds`,
        });
    });
    card.archetypeIds.forEach((id) => {
      if (!validArchetypes.has(id))
        errors.push({
          code: 'broken-reference',
          message: `Unknown archetype ${id}.`,
          path: `${path}.archetypeIds`,
        });
    });
    card.symbolicMotifIds.forEach((id) => {
      if (!validMotifs.has(id))
        errors.push({
          code: 'broken-reference',
          message: `Unknown motif ${id}.`,
          path: `${path}.symbolicMotifIds`,
        });
    });
    if (
      TAROT_REVERSED_FACETS.some((facet) => !card.reversed.facets[facet]) ||
      !TAROT_REVERSED_FACETS.includes(card.reversed.primaryFacet)
    ) {
      errors.push({
        code: 'invalid-count',
        message: 'Reversed philosophy is incomplete.',
        path: `${path}.reversed`,
      });
    }
    if (TAROT_KNOWLEDGE_SPREAD_CONTEXTS.some((spread) => !card.spreadContexts[spread])) {
      errors.push({
        code: 'invalid-count',
        message: 'Spread contexts are incomplete.',
        path: `${path}.spreadContexts`,
      });
    }
    allConcepts(card).forEach((item) => {
      if (
        !item.id ||
        !validTags.has(item.subject) ||
        !validTags.has(item.object) ||
        (item.qualifier && !validTags.has(item.qualifier)) ||
        !validProcesses.has(item.process)
      ) {
        errors.push({
          code: 'invalid-enum',
          message: `Invalid semantic concept ${item.id}.`,
          path: `${path}.${item.id}`,
        });
      }
    });
    card.reflections.forEach((reflection) => {
      if (
        !TAROT_REFLECTION_STEMS.includes(reflection.stem) ||
        reflection.focusTags.some((tag) => !validTags.has(tag)) ||
        reflection.themeTags.some((tag) => !validTags.has(tag)) ||
        reflection.spreadContexts.some(
          (spread) => !TAROT_KNOWLEDGE_SPREAD_CONTEXTS.includes(spread),
        )
      ) {
        errors.push({
          code: 'invalid-enum',
          message: `Invalid reflection ${reflection.id}.`,
          path: `${path}.reflections`,
        });
      }
    });
    Object.values(card.practical).forEach((item) => {
      if (
        !item.id ||
        !validProcesses.has(item.verb) ||
        !validTags.has(item.object) ||
        !validTags.has(item.supportingTag)
      ) {
        errors.push({
          code: 'invalid-enum',
          message: `Invalid practical action ${item.id}.`,
          path: `${path}.practical`,
        });
      }
    });
  });

  knowledgeBase.relations.forEach((relation) => {
    if (!cardIds.includes(relation.sourceCardId) || !cardIds.includes(relation.targetCardId)) {
      errors.push({
        code: 'broken-reference',
        message: `Relation ${relation.id} references an unknown card.`,
        path: `relations.${relation.id}`,
      });
    }
    if (
      !TAROT_KNOWLEDGE_RELATION_KINDS.includes(relation.kind) ||
      relation.reasonTags.some((tag) => !validTags.has(tag))
    ) {
      errors.push({
        code: 'invalid-enum',
        message: `Relation ${relation.id} has unknown semantics.`,
        path: `relations.${relation.id}`,
      });
    }
  });
  const cycle = findCycle(cardIds, knowledgeBase.relations);
  if (cycle)
    errors.push({
      code: 'cycle',
      message: `Knowledge graph cycle: ${cycle.join(' -> ')}.`,
      path: 'relations',
    });
  errors.push(...validateTarotKnowledgeRepetition(knowledgeBase));
  try {
    serializeTarotKnowledgeBase(knowledgeBase);
  } catch (error) {
    errors.push({
      code: 'non-serializable',
      message: error instanceof Error ? error.message : 'Knowledge base is not serializable.',
      path: '$',
    });
  }
  return { errors, valid: errors.length === 0 };
}
