import type {
  CrossSystemDirection,
  CrossSystemExplanation,
  CrossSystemSource,
  CrossSystemUncertainty,
} from '../types';

export function createCrossSystemExplanation(input: {
  direction: CrossSystemDirection;
  integrationThemeId?: string;
  sourceIds: readonly string[];
  sources: readonly CrossSystemSource[];
  themeId: string;
  uncertainty: CrossSystemUncertainty;
}): CrossSystemExplanation {
  return {
    integrationConcept: input.integrationThemeId
      ? `cross-system.integration.${input.integrationThemeId}`
      : null,
    limitationConcept: `cross-system.uncertainty.${input.uncertainty}`,
    practicalConcept: `cross-system.practice.${input.themeId}`,
    relationConcept: `cross-system.relation.${input.direction}.${input.themeId}`,
    sourceConcepts: input.sourceIds.map((id) => {
      const source = input.sources.find((item) => item.id === id);
      return `cross-system.source.${source?.kind ?? 'unknown'}`;
    }),
  };
}
