import { CROSS_SYSTEM_VERSIONS } from '../constants';
import { createCrossSystemExplanation } from '../explanations';
import type {
  CrossSystemEntityReference,
  CrossSystemExclusionReason,
  CrossSystemLink,
  CrossSystemLinkSemanticType,
  CrossSystemReliability,
  CrossSystemSignal,
  CrossSystemSource,
  CrossSystemStrength,
  CrossSystemUncertainty,
} from '../types';
import { crossSystemStableId, uniqueSorted } from '../utils';

const reliabilityOrder: readonly CrossSystemReliability[] = [
  'symbolic',
  'contextual',
  'deterministic',
  'direct',
];

export function weakestReliability(signals: readonly CrossSystemSignal[]): CrossSystemReliability {
  const reliabilities = signals.map((item) => item.reliability);
  if (reliabilities.includes('symbolic') && reliabilities.some((item) => item !== 'symbolic'))
    return 'contextual';
  return (
    [...signals]
      .map((item) => item.reliability)
      .sort((left, right) => reliabilityOrder.indexOf(left) - reliabilityOrder.indexOf(right))[0] ??
    'symbolic'
  );
}

function uniqueEntities(
  values: readonly CrossSystemEntityReference[],
): readonly CrossSystemEntityReference[] {
  return [
    ...new Map(values.map((item) => [`${item.kind}:${item.id}`, item] as const)).values(),
  ].sort((left, right) => `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`));
}

export function createCrossSystemLink(input: {
  direction: CrossSystemLink['direction'];
  displayEligible: boolean;
  exclusionReason?: CrossSystemExclusionReason | null;
  integrationThemeId?: string;
  priority: number;
  semanticType: CrossSystemLinkSemanticType;
  signals: readonly CrossSystemSignal[];
  sources: readonly CrossSystemSource[];
  strength: CrossSystemStrength;
  themeId: string;
  uncertainty: CrossSystemUncertainty;
}): CrossSystemLink {
  const sourceIds = uniqueSorted(input.signals.map((item) => item.sourceId));
  const evidenceReferences = uniqueSorted(input.signals.flatMap((item) => item.evidenceReferences));
  const entityReferences = uniqueEntities(input.signals.flatMap((item) => item.entityReferences));
  return {
    direction: input.direction,
    displayEligible: input.displayEligible,
    engineVersions: CROSS_SYSTEM_VERSIONS,
    entityReferences,
    evidenceReferences,
    exclusionReason: input.exclusionReason ?? null,
    explanation: createCrossSystemExplanation({
      direction: input.direction,
      ...(input.integrationThemeId ? { integrationThemeId: input.integrationThemeId } : {}),
      sourceIds,
      sources: input.sources,
      themeId: input.themeId,
      uncertainty: input.uncertainty,
    }),
    id: crossSystemStableId('cross-link', {
      direction: input.direction,
      entities: entityReferences,
      semanticType: input.semanticType,
      sourceIds,
      themeId: input.themeId,
    }),
    priority: input.priority,
    reliability: weakestReliability(input.signals),
    semanticType: input.semanticType,
    sourceIds,
    strength: input.strength,
    themeId: input.themeId,
    uncertainty: input.uncertainty,
  };
}
