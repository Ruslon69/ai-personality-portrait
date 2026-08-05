import { NUMEROLOGY_ACTIVE_VALUES, NUMEROLOGY_KNOWLEDGE_ROLES } from '../constants';
import type { NumerologyActiveValue } from '../types';

export type NumerologyKnowledgeFixture = {
  expectedRoles: typeof NUMEROLOGY_KNOWLEDGE_ROLES;
  id: string;
  value: NumerologyActiveValue;
};

export const numerologyKnowledgeFixtures: readonly NumerologyKnowledgeFixture[] =
  NUMEROLOGY_ACTIVE_VALUES.map((value) => ({
    expectedRoles: NUMEROLOGY_KNOWLEDGE_ROLES,
    id: `numerology-knowledge.${value}`,
    value,
  }));
