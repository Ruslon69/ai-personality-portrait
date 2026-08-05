import { standardTarotDeck } from '../../tarot/data/deck';
import { TAROT_KNOWLEDGE_SPREAD_CONTEXTS } from '../constants';
import type { TarotKnowledgeSpreadContext } from '../types';

export type TarotKnowledgeFixture = {
  cardId: string;
  expectedArcana: 'major' | 'minor';
  expectedSpreadContexts: readonly TarotKnowledgeSpreadContext[];
  id: string;
};

export const tarotKnowledgeFixtures: readonly TarotKnowledgeFixture[] = standardTarotDeck.cards.map(
  (card) => ({
    cardId: card.id,
    expectedArcana: card.arcana,
    expectedSpreadContexts: TAROT_KNOWLEDGE_SPREAD_CONTEXTS,
    id: `knowledge.${card.id}`,
  }),
);
