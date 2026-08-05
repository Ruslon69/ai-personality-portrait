import type {
  InterpretationConnection,
  InterpretationConnectionKind,
  InterpretationContext,
  InterpretationSignal,
  InterpretationStrength,
  InterpretationTarotCardInput,
} from '../types';
import { stableId, uniqueSorted } from '../utils';

const conflictingSuitPairs = new Set(['cups:wands', 'pentacles:swords']);
const opportunityPositionTerms = ['advice', 'opportunity', 'resource', 'step', 'support'];
const blockagePositionTerms = ['hidden', 'obstacle', 'risk', 'tension'];

function evidenceIdsForCards(
  evidence: readonly InterpretationSignal[],
  cardIds: readonly string[],
) {
  return uniqueSorted(
    evidence
      .filter((item) => item.reference?.kind === 'card' && cardIds.includes(item.reference.id))
      .map((item) => item.id),
  );
}

function createConnection(input: {
  cards: readonly InterpretationTarotCardInput[];
  evidence: readonly InterpretationSignal[];
  kind: InterpretationConnectionKind;
  semanticId: string;
  strength: InterpretationStrength;
}): InterpretationConnection {
  const cardIds = input.cards.map((card) => card.id);
  return {
    cardIds,
    evidenceIds: evidenceIdsForCards(input.evidence, cardIds),
    id: stableId('connection', {
      cardIds,
      kind: input.kind,
      semanticId: input.semanticId,
    }),
    kind: input.kind,
    numberValues: uniqueSorted(input.cards.map((card) => card.number)),
    semanticId: input.semanticId,
    source: 'tarot-connection',
    strength: input.strength,
  };
}

function suitRelationship(
  left: InterpretationTarotCardInput,
  right: InterpretationTarotCardInput,
): InterpretationConnectionKind | null {
  if (!left.suit || !right.suit) return null;
  if (left.suit === right.suit) return 'reinforcement';
  const pair = [left.suit, right.suit].sort().join(':');
  return conflictingSuitPairs.has(pair) ? 'contrast' : 'progression';
}

function arcanaRelationship(
  left: InterpretationTarotCardInput,
  right: InterpretationTarotCardInput,
): InterpretationConnectionKind {
  if (left.orientation === 'reversed' && right.orientation === 'reversed') return 'blockage';
  if (left.orientation !== right.orientation) return 'unresolved-tension';
  if (left.arcana === 'major' && right.arcana === 'major') return 'reinforcement';
  if (left.arcana !== right.arcana) return 'opportunity';
  return 'progression';
}

function pairConnections(
  left: InterpretationTarotCardInput,
  right: InterpretationTarotCardInput,
  evidence: readonly InterpretationSignal[],
): InterpretationConnection[] {
  const cards = [left, right];
  const connections = [
    createConnection({
      cards,
      evidence,
      kind: arcanaRelationship(left, right),
      semanticId: `tarot.arcana.${left.arcana}.${right.arcana}.${left.orientation}.${right.orientation}`,
      strength: 'primary',
    }),
  ];
  const suitKind = suitRelationship(left, right);
  if (suitKind) {
    connections.push(
      createConnection({
        cards,
        evidence,
        kind: suitKind,
        semanticId: `tarot.suits.${left.suit}.${right.suit}`,
        strength: 'secondary',
      }),
    );
  }
  if (left.number === right.number) {
    connections.push(
      createConnection({
        cards,
        evidence,
        kind: 'reinforcement',
        semanticId: `tarot.repeated-number.${left.number}`,
        strength: 'secondary',
      }),
    );
  }
  if (
    (left.arcana === 'minor' && left.number >= 11) ||
    (right.arcana === 'minor' && right.number >= 11)
  ) {
    connections.push(
      createConnection({
        cards,
        evidence,
        kind: 'opportunity',
        semanticId: 'tarot.court-card-agency',
        strength: 'contextual',
      }),
    );
  }
  return connections;
}

function positionConnections(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
): InterpretationConnection[] {
  return context.tarot.cards.flatMap((card) => {
    const position = card.positionId.toLowerCase();
    const kind = blockagePositionTerms.some((term) => position.includes(term))
      ? 'blockage'
      : opportunityPositionTerms.some((term) => position.includes(term))
        ? 'opportunity'
        : card.id === context.tarot.leadingCardId
          ? 'practical-direction'
          : null;
    if (!kind) return [];
    return [
      createConnection({
        cards: [card],
        evidence,
        kind,
        semanticId: `tarot.position.${card.positionId}.${kind}`,
        strength: card.id === context.tarot.leadingCardId ? 'primary' : 'contextual',
      }),
    ];
  });
}

function readingContextConnections(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
): InterpretationConnection[] {
  const leading = context.tarot.cards.find((card) => card.id === context.tarot.leadingCardId);
  if (!leading) return [];
  const contextId = context.tarot.topic
    ? `topic.${context.tarot.topic}`
    : `period.${context.tarot.period ?? 'open'}`;
  return [
    createConnection({
      cards: [leading],
      evidence,
      kind: 'practical-direction',
      semanticId: `tarot.reading-context.${contextId}`,
      strength: 'primary',
    }),
  ];
}

export function resolveTarotConnections(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
): readonly InterpretationConnection[] {
  const neighbourConnections = context.tarot.cards.flatMap((card, index, cards) => {
    const neighbour = cards[index + 1];
    return neighbour ? pairConnections(card, neighbour, evidence) : [];
  });
  const deduplicated = new Map(
    [
      ...neighbourConnections,
      ...positionConnections(context, evidence),
      ...readingContextConnections(context, evidence),
    ].map((connection) => [connection.id, connection]),
  );
  return [...deduplicated.values()].sort((left, right) => left.id.localeCompare(right.id));
}
