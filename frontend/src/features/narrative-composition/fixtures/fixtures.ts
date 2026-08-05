import type { NarrativeCandidate, NarrativeCompositionRequest, NarrativeMode } from '../types';

function block(
  id: string,
  input: Pick<NarrativeCandidate, 'cardIds' | 'polarity' | 'priorityFactors' | 'roles' | 'tags'> & {
    priority: number;
  },
): NarrativeCandidate {
  return {
    basePriority: input.priority,
    cardIds: input.cardIds,
    evidenceIds: [`evidence:${id}`],
    id: `block:${id}`,
    mergedFromIds: [],
    numberValues: [],
    polarity: input.polarity,
    priorityFactors: input.priorityFactors,
    roles: input.roles,
    semanticId: `semantic.${id}`,
    sourceId: `source:${id}`,
    sourceKind: id.startsWith('memory') ? 'journey-memory' : 'theme',
    tags: input.tags,
  };
}

const candidates: readonly NarrativeCandidate[] = [
  block('leading-direction', {
    cardIds: ['major-magician'],
    polarity: 'neutral',
    priority: 120,
    priorityFactors: ['leading-card', 'major-arcana'],
    roles: ['lead', 'current', 'closure'],
    tags: ['direction', 'focus'],
  }),
  block('current-structure', {
    cardIds: [],
    polarity: 'neutral',
    priority: 95,
    priorityFactors: ['spread-position'],
    roles: ['current', 'support'],
    tags: ['boundaries', 'stability'],
  }),
  block('hidden-pause', {
    cardIds: ['major-hanged-man'],
    polarity: 'tensional',
    priority: 110,
    priorityFactors: ['tension', 'major-arcana'],
    roles: ['conflict', 'support'],
    tags: ['pause', 'patience'],
  }),
  block('turning-transition', {
    cardIds: [],
    polarity: 'integrative',
    priority: 100,
    priorityFactors: ['strong-connection'],
    roles: ['turning-point', 'softener'],
    tags: ['transition', 'clarity'],
  }),
  block('practical-plan', {
    cardIds: [],
    polarity: 'supportive',
    priority: 85,
    priorityFactors: ['practical-action'],
    roles: ['practical'],
    tags: ['planning', 'action'],
  }),
  block('reflection-intuition', {
    cardIds: [],
    polarity: 'neutral',
    priority: 75,
    priorityFactors: ['reflection'],
    roles: ['reflection'],
    tags: ['intuition', 'focus'],
  }),
  block('closing-integration', {
    cardIds: [],
    polarity: 'integrative',
    priority: 70,
    priorityFactors: [],
    roles: ['closure', 'softener'],
    tags: ['integration', 'completion'],
  }),
  block('support-resource', {
    cardIds: [],
    polarity: 'supportive',
    priority: 65,
    priorityFactors: [],
    roles: ['support', 'current'],
    tags: ['resource', 'discipline'],
  }),
  block('movement-magician', {
    cardIds: ['major-magician'],
    polarity: 'supportive',
    priority: 90,
    priorityFactors: ['major-arcana'],
    roles: ['support', 'turning-point'],
    tags: ['action', 'momentum'],
  }),
  block('numerology-cycle', {
    cardIds: [],
    polarity: 'neutral',
    priority: 80,
    priorityFactors: ['numerology-resonance', 'current-period'],
    roles: ['current', 'turning-point'],
    tags: ['cycle', 'tempo'],
  }),
  block('psychological-choice', {
    cardIds: [],
    polarity: 'neutral',
    priority: 68,
    priorityFactors: ['psychological-context'],
    roles: ['current', 'reflection'],
    tags: ['choice', 'context'],
  }),
  block('duplicate-inner-guidance', {
    cardIds: [],
    polarity: 'neutral',
    priority: 30,
    priorityFactors: ['reflection'],
    roles: ['reflection'],
    tags: ['reflection', 'focus'],
  }),
];

function fixture(mode: NarrativeMode): NarrativeCompositionRequest {
  return {
    candidates,
    fingerprint: 'narrative-fixture-v1',
    leadingSemanticId: 'semantic.leading-direction',
    ...(mode === 'journey'
      ? {
          memory: {
            emergingThemeIds: ['theme.change'],
            recurringThemeIds: ['theme.boundaries'],
            resolvedThemeIds: ['theme.pause'],
            transitionIds: ['transition.previous.current'],
          },
        }
      : {}),
    mode,
    relations: [
      {
        cardIds: ['major-magician', 'major-hanged-man'],
        id: 'relation.magician-hanged-man',
        kind: 'contrast',
        semanticId: 'relation.movement-pause',
        strength: 'primary',
      },
    ],
  };
}

export const narrativeCompositionFixtures = (['short', 'standard', 'deep', 'journey'] as const).map(
  (mode) => ({ id: `narrative-${mode}`, request: fixture(mode) }),
);
