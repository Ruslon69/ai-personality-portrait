import { standardTarotDeck } from '../../tarot/data/deck';
import type { TarotCard, TarotOrientation, TarotSuit } from '../../tarot/types';
import {
  TAROT_KNOWLEDGE_SPREAD_CONTEXTS,
  TAROT_REFLECTION_STEMS,
  TAROT_REVERSED_FACETS,
  TAROT_SEMANTIC_TAGS,
} from '../constants';
import {
  majorFoundations,
  rankFoundations,
  suitFoundations,
  tarotArchetypes,
  tarotSymbolicMotifs,
} from '../data';
import type {
  AuthorTarotKnowledgeBase,
  ResolvedTarotKnowledge,
  TarotActionConcept,
  TarotCardKnowledge,
  TarotKnowledgeSpreadContext,
  TarotReflectionConcept,
  TarotReversedFacet,
  TarotSemanticConcept,
  TarotSemanticPolarity,
  TarotSemanticProcess,
  TarotSemanticTagId,
  TarotSemanticWeight,
} from '../types';
import { buildTarotKnowledgeGraph } from '../graph';

type ConceptInput = {
  object: TarotSemanticTagId;
  polarity?: TarotSemanticPolarity;
  process: TarotSemanticProcess;
  qualifier?: TarotSemanticTagId;
  subject: TarotSemanticTagId;
  weight?: TarotSemanticWeight;
};

function concept(cardId: string, field: string, input: ConceptInput): TarotSemanticConcept {
  return {
    id: `${cardId}.${field}`,
    object: input.object,
    polarity: input.polarity ?? 'neutral',
    process: input.process,
    ...(input.qualifier ? { qualifier: input.qualifier } : {}),
    subject: input.subject,
    weight: input.weight ?? 'supporting',
  };
}

function rankIdFor(card: TarotCard): string {
  return card.arcana === 'major'
    ? card.id.slice('major-'.length)
    : card.id.slice(card.suit!.length + 1);
}

function foundationFor(card: TarotCard) {
  if (card.arcana === 'major') {
    const foundation = majorFoundations[card.id];
    if (!foundation) throw new Error(`Missing knowledge foundation for ${card.id}.`);
    return foundation;
  }
  const suit = card.suit as TarotSuit;
  const rankId = rankIdFor(card);
  const rank = rankFoundations[rankId as keyof typeof rankFoundations];
  if (!rank) throw new Error(`Missing rank foundation for ${card.id}.`);
  const suitFoundation = suitFoundations[suit];
  return {
    archetypeIds: [...new Set([...suitFoundation.archetypeIds, rank[4]])],
    challenge: suitFoundation.challenge,
    gift: rank[0],
    growth: rank[1],
    motifIds: [...new Set([...suitFoundation.motifIds, rank[5]])],
    obstacle: suitFoundation.obstacle,
    primary: rank[0],
    process: rank[2],
    reversedPrimary: rank[3],
    secondary: suitFoundation.primary,
  } as const;
}

const spreadSpecs: Readonly<
  Record<
    TarotKnowledgeSpreadContext,
    readonly [TarotSemanticTagId, TarotSemanticProcess, TarotSemanticTagId]
  >
> = {
  day: ['energy', 'observe', 'action'],
  week: ['tempo', 'build', 'planning'],
  month: ['planning', 'cultivate', 'growth'],
  year: ['transition', 'integrate', 'vision'],
  love: ['relationship', 'connect', 'reciprocity'],
  career: ['work', 'build', 'discipline'],
  money: ['money', 'verify', 'resource'],
  decision: ['decision', 'choose', 'clarity'],
  generic: ['reflection', 'examine', 'focus'],
};

function buildSpreadContexts(
  cardId: string,
  primary: TarotSemanticTagId,
  secondary: TarotSemanticTagId,
) {
  return Object.fromEntries(
    TAROT_KNOWLEDGE_SPREAD_CONTEXTS.map((context) => {
      const [subject, process, qualifier] = spreadSpecs[context];
      return [
        context,
        {
          context,
          emphasis: concept(cardId, `spread.${context}`, {
            object: context === 'generic' ? primary : secondary,
            process,
            qualifier,
            subject,
            weight: 'contextual',
          }),
          reflectionTags: [subject, qualifier, primary],
        },
      ];
    }),
  ) as unknown as TarotCardKnowledge['spreadContexts'];
}

function buildReversed(
  cardId: string,
  primary: TarotSemanticTagId,
  secondary: TarotSemanticTagId,
  gift: TarotSemanticTagId,
  challenge: TarotSemanticTagId,
  growth: TarotSemanticTagId,
  obstacle: TarotSemanticTagId,
  primaryFacet: TarotReversedFacet,
): TarotCardKnowledge['reversed'] {
  const specs: Readonly<
    Record<
      TarotReversedFacet,
      readonly [TarotSemanticTagId, TarotSemanticProcess, TarotSemanticTagId]
    >
  > = {
    'inner-expression': [primary, 'internalize', gift],
    'blocked-energy': [primary, 'obstruct', obstacle],
    'unfinished-lesson': [challenge, 'revisit', growth],
    overcompensation: [gift, 'amplify', challenge],
    'suppressed-potential': [gift, 'suppress', obstacle],
    delay: [primary, 'defer', 'tempo'],
    reassessment: [secondary, 'revise', 'decision'],
    'false-certainty': ['clarity', 'overstate', challenge],
  };
  const facets = Object.fromEntries(
    TAROT_REVERSED_FACETS.map((facet) => {
      const [subject, process, object] = specs[facet];
      return [
        facet,
        concept(cardId, `reversed.${facet}`, {
          object,
          polarity: 'tensional',
          process,
          qualifier: secondary,
          subject,
          weight: facet === primaryFacet ? 'core' : 'supporting',
        }),
      ];
    }),
  ) as TarotCardKnowledge['reversed']['facets'];
  return {
    facets,
    integration: concept(cardId, 'reversed.integration', {
      object: growth,
      polarity: 'integrative',
      process: 'integrate',
      qualifier: primary,
      subject: challenge,
    }),
    primaryFacet,
  };
}

function action(
  cardId: string,
  field: keyof TarotCardKnowledge['practical'],
  verb: TarotSemanticProcess,
  object: TarotSemanticTagId,
  supportingTag: TarotSemanticTagId,
): TarotActionConcept {
  return { id: `${cardId}.practical.${field}`, object, scale: 'small', supportingTag, verb };
}

function buildReflections(
  card: TarotCard,
  primary: TarotSemanticTagId,
  secondary: TarotSemanticTagId,
  challenge: TarotSemanticTagId,
  growth: TarotSemanticTagId,
): readonly TarotReflectionConcept[] {
  const offset =
    card.number + (card.suit ? ['wands', 'cups', 'swords', 'pentacles'].indexOf(card.suit) : 4);
  const make = (
    index: number,
    orientation: TarotOrientation | 'both',
    spreads: readonly TarotKnowledgeSpreadContext[],
    focusTags: readonly TarotSemanticTagId[],
  ): TarotReflectionConcept => ({
    focusTags: [...new Set([primary, ...focusTags])],
    id: `${card.id}.reflection.${index + 1}`,
    orientation,
    spreadContexts: spreads,
    stem: TAROT_REFLECTION_STEMS[(offset + index) % TAROT_REFLECTION_STEMS.length],
    themeTags: index % 2 === 0 ? [primary, challenge] : [secondary, growth],
  });
  return [
    make(0, 'both', ['generic', 'day', 'week'], [primary, growth]),
    make(1, 'both', ['generic', 'day', 'week'], [secondary, challenge]),
    make(2, 'upright', ['month', 'year'], [primary, growth]),
    make(3, 'upright', ['month', 'year'], [secondary, growth]),
    make(4, 'reversed', ['generic', 'week', 'month', 'year'], [challenge, primary]),
    make(5, 'reversed', ['generic', 'week', 'month', 'year'], [challenge, secondary]),
    make(6, 'both', ['love'], ['relationship', primary]),
    make(7, 'both', ['love'], ['relationship', secondary]),
    make(8, 'both', ['career', 'money', 'decision'], ['decision', primary]),
    make(9, 'both', ['career', 'money', 'decision'], ['decision', growth]),
  ];
}

function buildCardKnowledge(card: TarotCard): TarotCardKnowledge {
  const foundation = foundationFor(card);
  const { primary, secondary, gift, challenge, growth, obstacle, process } = foundation;
  const rankId = rankIdFor(card);
  const tagIds = [...new Set([primary, secondary, gift, challenge, growth, obstacle])].sort();
  return {
    archetypeIds: foundation.archetypeIds,
    careerMeaning: concept(card.id, 'career', {
      object: growth,
      process: 'build',
      qualifier: 'discipline',
      subject: 'work',
    }),
    challenge: concept(card.id, 'challenge', {
      object: obstacle,
      polarity: 'tensional',
      process: 'challenge',
      qualifier: secondary,
      subject: challenge,
      weight: 'core',
    }),
    coreEnergy: concept(card.id, 'core', {
      object: secondary,
      process,
      qualifier: growth,
      subject: primary,
      weight: 'core',
    }),
    decisionMaking: concept(card.id, 'decision', {
      object: growth,
      process: 'choose',
      qualifier: obstacle,
      subject: 'decision',
    }),
    energyToday: concept(card.id, 'today', {
      object: primary,
      process: 'observe',
      qualifier: 'tempo',
      subject: 'energy',
    }),
    gift: concept(card.id, 'gift', {
      object: growth,
      polarity: 'supportive',
      process: 'cultivate',
      qualifier: primary,
      subject: gift,
      weight: 'core',
    }),
    growthDirection: concept(card.id, 'growth', {
      object: growth,
      polarity: 'integrative',
      process: 'integrate',
      qualifier: challenge,
      subject: primary,
      weight: 'core',
    }),
    identity: {
      arcana: card.arcana,
      cardId: card.id,
      number: card.number,
      rankId,
      signature: `${card.arcana}:${card.suit ?? 'major'}:${rankId}:${primary}:${secondary}`,
      ...(card.suit ? { suit: card.suit } : {}),
    },
    keywords: [
      `${primary}:${secondary}`,
      `${gift}:${process}`,
      `${challenge}:${obstacle}`,
      `${growth}:${rankId}`,
    ],
    lightExpression: concept(card.id, 'light', {
      object: gift,
      polarity: 'supportive',
      process,
      qualifier: growth,
      subject: primary,
      weight: 'core',
    }),
    misconception: concept(card.id, 'misconception', {
      object: challenge,
      polarity: 'tensional',
      process: 'overstate',
      qualifier: obstacle,
      subject: primary,
    }),
    moneyMeaning: concept(card.id, 'money', {
      object: obstacle,
      process: 'verify',
      qualifier: 'boundaries',
      subject: 'money',
    }),
    opportunity: concept(card.id, 'opportunity', {
      object: growth,
      polarity: 'supportive',
      process: 'open',
      qualifier: gift,
      subject: 'opportunity',
    }),
    personalDevelopment: concept(card.id, 'personal-development', {
      object: growth,
      polarity: 'integrative',
      process: 'cultivate',
      qualifier: primary,
      subject: 'growth',
    }),
    practical: {
      avoidToday: action(card.id, 'avoidToday', 'pause', obstacle, challenge),
      bestQuestion: action(card.id, 'bestQuestion', 'question', challenge, primary),
      payAttention: action(card.id, 'payAttention', 'observe', secondary, obstacle),
      smallAction: action(card.id, 'smallAction', process, primary, growth),
      smallExperiment: action(card.id, 'smallExperiment', 'test', growth, gift),
    },
    reflections: buildReflections(card, primary, secondary, challenge, growth),
    relationshipMeaning: concept(card.id, 'relationship', {
      object: challenge,
      process: 'connect',
      qualifier: 'communication',
      subject: 'relationship',
    }),
    reversed: buildReversed(
      card.id,
      primary,
      secondary,
      gift,
      challenge,
      growth,
      obstacle,
      foundation.reversedPrimary,
    ),
    shadowExpression: concept(card.id, 'shadow', {
      object: obstacle,
      polarity: 'tensional',
      process: 'obstruct',
      qualifier: challenge,
      subject: primary,
      weight: 'core',
    }),
    spreadContexts: buildSpreadContexts(card.id, primary, secondary),
    symbolicMotifIds: foundation.motifIds,
    tagIds,
    typicalObstacle: concept(card.id, 'obstacle', {
      object: obstacle,
      polarity: 'tensional',
      process: 'examine',
      qualifier: challenge,
      subject: secondary,
    }),
    warning: concept(card.id, 'warning', {
      object: obstacle,
      polarity: 'tensional',
      process: 'verify',
      qualifier: challenge,
      subject: 'risk',
    }),
  };
}

export function buildAuthorTarotKnowledgeBase(): AuthorTarotKnowledgeBase {
  const entries = standardTarotDeck.cards.map(buildCardKnowledge);
  return {
    archetypes: tarotArchetypes,
    entries,
    metadata: {
      cardCount: entries.length,
      schemaVersion: 'author-knowledge-schema-v1',
      system: 'tarot',
      version: 'author-tarot-knowledge-v1',
    },
    motifs: tarotSymbolicMotifs,
    relations: buildTarotKnowledgeGraph(entries),
    tags: TAROT_SEMANTIC_TAGS,
  };
}

function stableIndex(input: string, size: number): number {
  let value = 2166136261;
  for (const character of input) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value) % size;
}

export function resolveTarotKnowledge(
  knowledgeBase: AuthorTarotKnowledgeBase,
  cardId: string,
  orientation: TarotOrientation,
  spread: TarotKnowledgeSpreadContext,
  themeTags: readonly TarotSemanticTagId[] = [],
): ResolvedTarotKnowledge {
  const card = knowledgeBase.entries.find((entry) => entry.identity.cardId === cardId);
  if (!card) throw new Error(`Unknown Tarot knowledge card: ${cardId}.`);
  const candidates = card.reflections.filter(
    (reflection) =>
      (reflection.orientation === 'both' || reflection.orientation === orientation) &&
      reflection.spreadContexts.includes(spread),
  );
  const fallback = card.reflections.filter(
    (reflection) => reflection.orientation === 'both' || reflection.orientation === orientation,
  );
  const available = candidates.length > 0 ? candidates : fallback;
  const relevance = available.map(
    (reflection) => reflection.themeTags.filter((tag) => themeTags.includes(tag)).length,
  );
  const maximumRelevance = Math.max(...relevance);
  const relevant =
    maximumRelevance > 0
      ? available.filter((_, index) => relevance[index] === maximumRelevance)
      : available;
  const fingerprint = `${cardId}:${orientation}:${spread}:${[...themeTags].sort().join(',')}`;
  const reflection = relevant[stableIndex(fingerprint, relevant.length)];
  const concepts =
    orientation === 'upright'
      ? [card.coreEnergy, card.lightExpression, card.gift, card.opportunity]
      : [card.reversed.facets[card.reversed.primaryFacet], card.reversed.integration, card.warning];
  return {
    cardId,
    concepts,
    orientation,
    reflection,
    spread,
    spreadModifier: card.spreadContexts[spread],
  };
}

export const authorTarotKnowledgeBase = buildAuthorTarotKnowledgeBase();
