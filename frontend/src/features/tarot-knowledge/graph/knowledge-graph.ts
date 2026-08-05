import type {
  TarotCardKnowledge,
  TarotKnowledgeRelation,
  TarotKnowledgeRelationKind,
  TarotSemanticTagId,
} from '../types';

type RelationSeed = {
  kind: TarotKnowledgeRelationKind;
  left: string;
  reasonTags: readonly TarotSemanticTagId[];
  right: string;
};

const explicitRelations: readonly RelationSeed[] = [
  {
    left: 'major-fool',
    right: 'major-world',
    kind: 'closes',
    reasonTags: ['growth', 'completion'],
  },
  {
    left: 'major-magician',
    right: 'major-high-priestess',
    kind: 'balances',
    reasonTags: ['action', 'intuition'],
  },
  {
    left: 'major-empress',
    right: 'major-emperor',
    kind: 'balances',
    reasonTags: ['growth', 'boundaries'],
  },
  {
    left: 'major-hierophant',
    right: 'major-lovers',
    kind: 'redirects',
    reasonTags: ['tradition', 'choice'],
  },
  {
    left: 'major-chariot',
    right: 'major-strength',
    kind: 'softens',
    reasonTags: ['momentum', 'patience'],
  },
  {
    left: 'major-hermit',
    right: 'major-sun',
    kind: 'contrasts',
    reasonTags: ['reflection', 'energy'],
  },
  {
    left: 'major-wheel',
    right: 'major-justice',
    kind: 'mirrors',
    reasonTags: ['change', 'responsibility'],
  },
  {
    left: 'major-hanged-man',
    right: 'major-death',
    kind: 'transforms',
    reasonTags: ['pause', 'transition'],
  },
  {
    left: 'major-temperance',
    right: 'major-devil',
    kind: 'contrasts',
    reasonTags: ['balance', 'attachment'],
  },
  { left: 'major-tower', right: 'major-star', kind: 'opens', reasonTags: ['change', 'recovery'] },
  {
    left: 'major-moon',
    right: 'major-sun',
    kind: 'intensifies',
    reasonTags: ['uncertainty', 'clarity'],
  },
  {
    left: 'major-judgement',
    right: 'major-world',
    kind: 'reinforces',
    reasonTags: ['decision', 'completion'],
  },
];

function relationId(sourceCardId: string, targetCardId: string, kind: TarotKnowledgeRelationKind) {
  return `relation.${sourceCardId}.${kind}.${targetCardId}`;
}

export function buildTarotKnowledgeGraph(
  cards: readonly TarotCardKnowledge[],
): readonly TarotKnowledgeRelation[] {
  const order = new Map(cards.map((card, index) => [card.identity.cardId, index]));
  const relations = new Map<string, TarotKnowledgeRelation>();
  const add = (seed: RelationSeed) => {
    const leftIndex = order.get(seed.left);
    const rightIndex = order.get(seed.right);
    if (leftIndex === undefined || rightIndex === undefined || leftIndex === rightIndex) return;
    const [sourceCardId, targetCardId] =
      leftIndex < rightIndex ? [seed.left, seed.right] : [seed.right, seed.left];
    const id = relationId(sourceCardId, targetCardId, seed.kind);
    relations.set(id, {
      id,
      kind: seed.kind,
      reasonTags: seed.reasonTags,
      sourceCardId,
      targetCardId,
    });
  };

  explicitRelations.forEach(add);

  const majors = cards.filter((card) => card.identity.arcana === 'major');
  majors.slice(0, -1).forEach((card, index) => {
    const next = majors[index + 1];
    add({
      kind: index % 3 === 0 ? 'transforms' : index % 3 === 1 ? 'redirects' : 'reinforces',
      left: card.identity.cardId,
      reasonTags: [card.tagIds[0], next.tagIds[0]],
      right: next.identity.cardId,
    });
  });

  (['wands', 'cups', 'swords', 'pentacles'] as const).forEach((suit) => {
    const suited = cards.filter((card) => card.identity.suit === suit);
    suited.slice(0, -1).forEach((card, index) => {
      const next = suited[index + 1];
      add({
        kind: index % 2 === 0 ? 'reinforces' : 'transforms',
        left: card.identity.cardId,
        reasonTags: [card.tagIds[0], next.tagIds[0]],
        right: next.identity.cardId,
      });
    });
  });

  const suitPairs: readonly [string, string, TarotKnowledgeRelationKind][] = [
    ['wands', 'cups', 'softens'],
    ['cups', 'swords', 'redirects'],
    ['swords', 'pentacles', 'balances'],
    ['wands', 'swords', 'intensifies'],
    ['cups', 'pentacles', 'reinforces'],
    ['wands', 'pentacles', 'opens'],
  ];
  const minorByIdentity = new Map(
    cards
      .filter((card) => card.identity.arcana === 'minor')
      .map((card) => [`${card.identity.suit}:${card.identity.rankId}`, card]),
  );
  Object.keys(
    Object.fromEntries(
      cards
        .filter((card) => card.identity.arcana === 'minor')
        .map((card) => [card.identity.rankId, true]),
    ),
  ).forEach((rankId) => {
    suitPairs.forEach(([leftSuit, rightSuit, kind]) => {
      const left = minorByIdentity.get(`${leftSuit}:${rankId}`);
      const right = minorByIdentity.get(`${rightSuit}:${rankId}`);
      if (!left || !right) return;
      add({
        kind,
        left: left.identity.cardId,
        reasonTags: [left.tagIds[0], right.tagIds[0]],
        right: right.identity.cardId,
      });
    });
  });

  return [...relations.values()].sort((left, right) => left.id.localeCompare(right.id));
}
