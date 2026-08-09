import type {
  InterpretationConnection,
  InterpretationContext,
  InterpretationEvidence,
  InterpretationTheme,
  ThemeComposition,
} from '../../expert-interpretation/types';
import type { CrossSystemLink, CrossSystemResult } from '../../cross-system-reasoning';
import {
  authorTarotKnowledgeBase,
  resolveTarotKnowledge,
  type TarotKnowledgeRelationKind,
  type TarotKnowledgeSpreadContext,
} from '../../tarot-knowledge';
import {
  authorNumerologyKnowledgeBase,
  resolveAdvancedNumerologyKnowledge,
  resolveNumerologyKnowledge,
  type NumerologyKnowledgeRole,
} from '../../numerology-knowledge';
import type {
  NarrativeBlockRole,
  NarrativeCandidate,
  NarrativeCompositionRequest,
  NarrativeMemoryContext,
  NarrativeMode,
  NarrativePriorityFactor,
  NarrativeRelationInput,
} from '../types';
import { narrativeStableId, uniqueValues } from '../utils';

type CandidateInput = Omit<NarrativeCandidate, 'id' | 'mergedFromIds'>;

function candidate(input: CandidateInput): NarrativeCandidate {
  return {
    ...input,
    cardIds: uniqueValues(input.cardIds),
    evidenceIds: uniqueValues(input.evidenceIds),
    id: narrativeStableId(
      'narrative-block',
      `${input.sourceKind}:${input.sourceId}:${input.semanticId}`,
    ),
    mergedFromIds: [],
    numberValues: uniqueValues(input.numberValues),
    priorityFactors: uniqueValues(input.priorityFactors),
    roles: uniqueValues(input.roles),
    tags: uniqueValues(input.tags),
  };
}

function semanticTags(...values: readonly string[]) {
  return uniqueValues(
    values.flatMap((value) =>
      value
        .toLowerCase()
        .split(/[.:/_-]/u)
        .filter((part) => part.length > 2),
    ),
  );
}

function themeRoles(theme: InterpretationTheme): readonly NarrativeBlockRole[] {
  const roles: NarrativeBlockRole[] =
    theme.role === 'leading' ? ['lead', 'current', 'closure'] : ['support'];
  if (theme.kind === 'period') roles.push('current', 'turning-point');
  if (theme.kind === 'practical') roles.push('practical');
  if (theme.kind === 'symbolic') roles.push('softener');
  if (theme.tensionIds.length) roles.push('conflict');
  return uniqueValues(roles);
}

function themeCandidate(theme: InterpretationTheme, leadingThemeId: string) {
  const priorityFactors: NarrativePriorityFactor[] = [];
  if (theme.id === leadingThemeId) priorityFactors.push('leading-card');
  if (theme.kind === 'period') priorityFactors.push('current-period');
  if (theme.tensionIds.length) priorityFactors.push('tension');
  return candidate({
    basePriority: theme.priority,
    cardIds: theme.relatedCards,
    evidenceIds: theme.evidenceIds,
    numberValues: theme.relatedNumbers,
    polarity: theme.tensionIds.length ? 'tensional' : 'neutral',
    priorityFactors,
    roles: themeRoles(theme),
    semanticId: theme.semanticId,
    sourceId: theme.id,
    sourceKind: 'theme',
    tags: semanticTags(theme.semanticId, ...theme.relatedContext),
  });
}

function relationKind(kind: InterpretationConnection['kind']): NarrativeRelationInput['kind'] {
  const map: Readonly<Record<InterpretationConnection['kind'], NarrativeRelationInput['kind']>> = {
    blockage: 'blockage',
    contrast: 'contrast',
    opportunity: 'opportunity',
    progression: 'progression',
    'practical-direction': 'progression',
    reinforcement: 'reinforcement',
    'unresolved-tension': 'tension',
  };
  return map[kind];
}

function relationRoles(kind: NarrativeRelationInput['kind']): readonly NarrativeBlockRole[] {
  if (['blockage', 'contrast', 'tension'].includes(kind)) return ['conflict', 'turning-point'];
  if (kind === 'balance') return ['softener', 'turning-point'];
  if (kind === 'opportunity' || kind === 'transformation') return ['turning-point', 'closure'];
  return ['support', 'turning-point'];
}

function connectionCandidate(connection: InterpretationConnection) {
  const kind = relationKind(connection.kind);
  return candidate({
    basePriority:
      connection.strength === 'primary' ? 130 : connection.strength === 'secondary' ? 100 : 70,
    cardIds: connection.cardIds,
    evidenceIds: connection.evidenceIds,
    numberValues: connection.numberValues,
    polarity: ['blockage', 'contrast', 'tension'].includes(kind) ? 'tensional' : 'integrative',
    priorityFactors: [
      'strong-connection',
      ...(connection.source === 'numerology' ? (['numerology-resonance'] as const) : []),
    ],
    roles: relationRoles(kind),
    semanticId: connection.semanticId,
    sourceId: connection.id,
    sourceKind: 'connection',
    tags: semanticTags(connection.semanticId, kind),
  });
}

function evidenceCandidate(evidence: InterpretationEvidence) {
  const roles: NarrativeBlockRole[] = ['support'];
  const factors: NarrativePriorityFactor[] = [];
  if (evidence.source === 'tarot-position') {
    roles.push('current');
    factors.push('spread-position');
  }
  if (evidence.source === 'numerology') {
    roles.push('current', 'turning-point');
    factors.push('numerology-resonance');
  }
  if (evidence.source === 'psychological-context') {
    roles.push('current', 'reflection');
    factors.push('psychological-context');
  }
  if (evidence.source === 'zodiac') roles.push('softener');
  if (evidence.source === 'interest') roles.push('practical');
  return candidate({
    basePriority:
      evidence.strength === 'primary' ? 90 : evidence.strength === 'secondary' ? 65 : 45,
    cardIds: evidence.reference?.kind === 'card' ? [evidence.reference.id] : [],
    evidenceIds: [evidence.id],
    numberValues: typeof evidence.value === 'number' ? [evidence.value] : [],
    polarity:
      evidence.polarity === 'challenging'
        ? 'tensional'
        : evidence.polarity === 'supportive'
          ? 'supportive'
          : 'neutral',
    priorityFactors: factors,
    roles,
    semanticId: evidence.semanticType,
    sourceId: evidence.id,
    sourceKind: 'evidence',
    tags: semanticTags(evidence.semanticType, evidence.scope, evidence.source),
  });
}

function numerologyKnowledgeCandidates(
  context: InterpretationContext,
): readonly NarrativeCandidate[] {
  if (!context.numerology) return [];
  const roleMap = {
    'life-path': 'life-path',
    birthday: 'birthday',
    'first-impression': 'attitude',
    'personal-year': 'personal-year',
    'personal-month': 'personal-month',
    'personal-day': 'personal-day',
  } as const satisfies Readonly<Record<string, NumerologyKnowledgeRole>>;
  return context.numerology.numbers.flatMap((number) => {
    const role = roleMap[number.id];
    const knowledge = authorNumerologyKnowledgeBase.entries.find(
      (entry) => entry.identity.value === number.value,
    );
    if (!knowledge) return [];
    const resolved = resolveNumerologyKnowledge(number.value, role);
    const isPeriod = role.startsWith('personal-');
    const primary = candidate({
      basePriority: role === 'personal-year' ? 105 : isPeriod ? 80 : 90,
      cardIds: [],
      evidenceIds: [],
      numberValues: [number.value],
      polarity: 'integrative',
      priorityFactors: ['numerology-resonance', ...(isPeriod ? (['current-period'] as const) : [])],
      roles: isPeriod ? ['current', 'turning-point'] : ['current', 'support'],
      semanticId: resolved.role.coreMeaning.id,
      sourceId: `${number.id}:${number.value}`,
      sourceKind: 'numerology-knowledge',
      tags: uniqueValues([
        ...knowledge.tagIds,
        resolved.role.coreMeaning.subject,
        resolved.role.coreMeaning.object,
      ]),
    });
    const reflection = candidate({
      basePriority: 50,
      cardIds: [],
      evidenceIds: [],
      numberValues: [number.value],
      polarity: 'neutral',
      priorityFactors: ['reflection'],
      roles: ['reflection'],
      semanticId: resolved.role.reflection.id,
      sourceId: `${number.id}:${number.value}:reflection`,
      sourceKind: 'numerology-knowledge',
      tags: [resolved.role.reflection.subject, resolved.role.reflection.object],
    });
    return [primary, reflection];
  });
}

function numerologyTarotRelations(
  context: InterpretationContext,
): readonly NarrativeRelationInput[] {
  if (!context.numerology) return [];
  const values = new Set(context.numerology.numbers.map((number) => number.value));
  const cards = new Set(context.tarot.cards.map((card) => card.id));
  return authorNumerologyKnowledgeBase.tarotResonances
    .filter(
      (relation) =>
        values.has(relation.value) && relation.cardIds.some((cardId) => cards.has(cardId)),
    )
    .map((relation) => ({
      cardIds: relation.cardIds.filter((cardId) => cards.has(cardId)),
      id: relation.id,
      kind:
        relation.kind === 'balances' || relation.kind === 'grounds'
          ? ('balance' as const)
          : relation.kind === 'opens'
            ? ('opportunity' as const)
            : ('reinforcement' as const),
      semanticId: `numerology-tarot.${relation.value}.${relation.reasonTags.join('.')}`,
      strength: 'contextual' as const,
    }));
}

function spreadContext(context: InterpretationContext): TarotKnowledgeSpreadContext {
  if (context.tarot.topic === 'love') return 'love';
  if (context.tarot.topic === 'money') return 'money';
  if (context.tarot.topic === 'decision') return 'decision';
  if (context.tarot.topic === 'work') return 'career';
  return context.tarot.period ?? 'generic';
}

function knowledgeCandidates(context: InterpretationContext): readonly NarrativeCandidate[] {
  const spread = spreadContext(context);
  return context.tarot.cards.flatMap((card) => {
    const knowledge = authorTarotKnowledgeBase.entries.find(
      (entry) => entry.identity.cardId === card.id,
    );
    if (!knowledge) return [];
    const resolved = resolveTarotKnowledge(
      authorTarotKnowledgeBase,
      card.id,
      card.orientation,
      spread,
      knowledge.tagIds,
    );
    const commonFactors: NarrativePriorityFactor[] = [
      ...(card.id === context.tarot.leadingCardId ? (['leading-card'] as const) : []),
      ...(card.arcana === 'major' ? (['major-arcana'] as const) : []),
    ];
    const core = candidate({
      basePriority: 105,
      cardIds: [card.id],
      evidenceIds: [],
      numberValues: [card.number],
      polarity: card.orientation === 'reversed' ? 'tensional' : 'neutral',
      priorityFactors: commonFactors,
      roles: card.orientation === 'reversed' ? ['current', 'conflict'] : ['current', 'support'],
      semanticId: resolved.concepts.map((item) => item.id).join('+'),
      sourceId: `${card.id}:resolved:${spread}`,
      sourceKind: 'tarot-knowledge',
      tags: uniqueValues([
        ...knowledge.tagIds,
        ...resolved.concepts.flatMap((item) => [item.subject, item.object]),
      ]),
    });
    const turning = candidate({
      basePriority: 85,
      cardIds: [card.id],
      evidenceIds: [],
      numberValues: [card.number],
      polarity: 'integrative',
      priorityFactors: commonFactors,
      roles: ['turning-point', 'softener', 'closure'],
      semanticId: resolved.spreadModifier.emphasis.id,
      sourceId: `${card.id}:spread:${spread}`,
      sourceKind: 'tarot-knowledge',
      tags: [
        resolved.spreadModifier.emphasis.subject,
        resolved.spreadModifier.emphasis.object,
        ...resolved.spreadModifier.reflectionTags,
      ],
    });
    const reflection = candidate({
      basePriority: 60,
      cardIds: [card.id],
      evidenceIds: [],
      numberValues: [],
      polarity: 'neutral',
      priorityFactors: ['reflection'],
      roles: ['reflection'],
      semanticId: resolved.reflection.id,
      sourceId: resolved.reflection.id,
      sourceKind: 'tarot-knowledge',
      tags: [...resolved.reflection.focusTags, ...resolved.reflection.themeTags],
    });
    const practical = candidate({
      basePriority: 55,
      cardIds: [card.id],
      evidenceIds: [],
      numberValues: [],
      polarity: 'supportive',
      priorityFactors: ['practical-action'],
      roles: ['practical'],
      semanticId: knowledge.practical.smallAction.id,
      sourceId: knowledge.practical.smallAction.id,
      sourceKind: 'tarot-knowledge',
      tags: [knowledge.practical.smallAction.object, knowledge.practical.smallAction.supportingTag],
    });
    return [core, turning, reflection, practical];
  });
}

function knowledgeRelations(context: InterpretationContext): readonly NarrativeRelationInput[] {
  const cardIds = new Set(context.tarot.cards.map((card) => card.id));
  const kindMap: Readonly<Record<TarotKnowledgeRelationKind, NarrativeRelationInput['kind']>> = {
    balances: 'balance',
    closes: 'transformation',
    contrasts: 'contrast',
    intensifies: 'reinforcement',
    mirrors: 'reinforcement',
    opens: 'opportunity',
    redirects: 'progression',
    reinforces: 'reinforcement',
    softens: 'balance',
    transforms: 'transformation',
  };
  return authorTarotKnowledgeBase.relations
    .filter((relation) => cardIds.has(relation.sourceCardId) && cardIds.has(relation.targetCardId))
    .map((relation) => ({
      cardIds: [relation.sourceCardId, relation.targetCardId],
      id: relation.id,
      kind: kindMap[relation.kind],
      semanticId: `knowledge.${relation.kind}.${relation.reasonTags.join('.')}`,
      strength: 'secondary' as const,
    }));
}

function repeatedMotifCandidates(context: InterpretationContext): readonly NarrativeCandidate[] {
  const selected = context.tarot.cards
    .map((card) =>
      authorTarotKnowledgeBase.entries.find((entry) => entry.identity.cardId === card.id),
    )
    .filter((entry) => entry !== undefined);
  const motifs = new Map<string, string[]>();
  selected.forEach((entry) =>
    entry.symbolicMotifIds.forEach((motif) => {
      motifs.set(motif, [...(motifs.get(motif) ?? []), entry.identity.cardId]);
    }),
  );
  return [...motifs.entries()]
    .filter(([, cardIds]) => cardIds.length > 1)
    .map(([motif, cardIds]) =>
      candidate({
        basePriority: 80,
        cardIds,
        evidenceIds: [],
        numberValues: [],
        polarity: 'integrative',
        priorityFactors: ['repeated-symbol'],
        roles: ['support', 'turning-point'],
        semanticId: `motif.repeated.${motif}`,
        sourceId: `motif:${motif}`,
        sourceKind: 'tarot-knowledge',
        tags: [motif, 'repeated-symbol'],
      }),
    );
}

function advancedNumerologyCandidates(context: InterpretationContext, mode: NarrativeMode) {
  const advanced = context.numerology?.advanced;
  if (!advanced || (mode !== 'deep' && mode !== 'journey')) return [];
  const periods = [
    {
      kind: 'pinnacle' as const,
      role: ['current', 'turning-point'] as const,
      semanticId: 'long-term-cycle',
      value: advanced.currentPinnacle.value,
    },
    {
      kind: 'challenge' as const,
      role: ['conflict', 'reflection'] as const,
      semanticId: 'structural-challenge',
      value: advanced.currentChallenge.value,
    },
    {
      kind: 'life-cycle' as const,
      role: ['current', 'support'] as const,
      semanticId: 'development-phase',
      value: advanced.currentLifeCycle.value,
    },
  ];
  const candidates = periods.map((period) => {
    const knowledge = resolveAdvancedNumerologyKnowledge(period.kind, period.value);
    return candidate({
      basePriority: period.kind === 'challenge' ? 82 : 92,
      cardIds: [],
      evidenceIds: [`calculation:${advanced.calculationSystem}:${period.kind}`],
      numberValues: [period.value],
      polarity: period.kind === 'challenge' ? 'tensional' : 'neutral',
      priorityFactors: ['current-period', 'numerology-resonance'],
      roles: period.role,
      semanticId: `numerology.advanced.${period.semanticId}.${period.value}`,
      sourceId: `advanced-numerology:${period.kind}:${period.value}`,
      sourceKind: 'numerology-knowledge',
      tags: uniqueValues([
        period.semanticId,
        ...knowledge.number.tagIds,
        ...knowledge.contract.contextRoles,
      ]),
    });
  });
  if (advanced.upcomingTransition)
    candidates.push(
      candidate({
        basePriority: advanced.upcomingTransition.withinTransitionWindow ? 98 : 68,
        cardIds: [],
        evidenceIds: [`calculation:${advanced.calculationSystem}:transition`],
        numberValues: [advanced.upcomingTransition.nextValue],
        polarity: 'integrative',
        priorityFactors: ['current-period'],
        roles: ['turning-point', 'support'],
        semanticId: `numerology.advanced.transition.${advanced.upcomingTransition.kind}`,
        sourceId: `advanced-numerology:transition:${advanced.upcomingTransition.kind}`,
        sourceKind: 'numerology-knowledge',
        tags: ['transition', 'development-phase'],
      }),
    );
  return candidates;
}

function memoryCandidates(memory: NarrativeMemoryContext | undefined) {
  if (!memory) return [];
  return [
    ...(memory.lastRelatedEntryId
      ? [
          candidate({
            basePriority: 85,
            cardIds: [],
            evidenceIds: [],
            numberValues: [],
            polarity: 'neutral',
            priorityFactors: [],
            roles: ['current', 'support'],
            semanticId: `continuity.previous-chapter.${memory.lastRelatedEntryId}`,
            sourceId: `memory:previous:${memory.lastRelatedEntryId}`,
            sourceKind: 'journey-memory',
            tags: ['previous-chapter', 'continuation'],
          }),
        ]
      : []),
    ...memory.emergingThemeIds.map((semanticId) =>
      candidate({
        basePriority: 105,
        cardIds: [],
        evidenceIds: [],
        numberValues: [],
        polarity: 'integrative',
        priorityFactors: ['current-period'],
        roles: ['turning-point', 'support'],
        semanticId,
        sourceId: `memory:emerging:${semanticId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(semanticId, 'emerging'),
      }),
    ),
    ...memory.recurringThemeIds.map((semanticId) =>
      candidate({
        basePriority: 115,
        cardIds: [],
        evidenceIds: [],
        numberValues: [],
        polarity: 'neutral',
        priorityFactors: ['current-period'],
        roles: ['current', 'support'],
        semanticId,
        sourceId: `memory:recurring:${semanticId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(semanticId, 'recurring'),
      }),
    ),
    ...memory.resolvedThemeIds.map((semanticId) =>
      candidate({
        basePriority: 95,
        cardIds: [],
        evidenceIds: [],
        numberValues: [],
        polarity: 'integrative',
        priorityFactors: [],
        roles: ['softener', 'closure'],
        semanticId,
        sourceId: `memory:resolved:${semanticId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(semanticId, 'resolved'),
      }),
    ),
    ...(memory.fadingThemeIds ?? []).map((semanticId) =>
      candidate({
        basePriority: 65,
        cardIds: [],
        evidenceIds: [],
        numberValues: [],
        polarity: 'neutral',
        priorityFactors: [],
        roles: ['softener', 'closure'],
        semanticId: `continuity.softened.${semanticId}`,
        sourceId: `memory:fading:${semanticId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(semanticId, 'fading', 'changed'),
      }),
    ),
    ...(memory.repeatedPracticalFocusIds ?? []).map((semanticId) =>
      candidate({
        basePriority: 72,
        cardIds: [],
        evidenceIds: [],
        numberValues: [],
        polarity: 'supportive',
        priorityFactors: ['practical-action'],
        roles: ['practical', 'support'],
        semanticId: `continuity.practical.${semanticId}`,
        sourceId: `memory:practical:${semanticId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(semanticId, 'continued'),
      }),
    ),
    ...(memory.repeatedCardIds ?? []).map((cardId) =>
      candidate({
        basePriority: 78,
        cardIds: [cardId],
        evidenceIds: [],
        numberValues: [],
        polarity: 'neutral',
        priorityFactors: ['repeated-symbol'],
        roles: ['current', 'support'],
        semanticId: `continuity.card-returned.${cardId}`,
        sourceId: `memory:card:${cardId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(cardId, 'returned', 'changed-form'),
      }),
    ),
    ...memory.transitionIds.map((semanticId) =>
      candidate({
        basePriority: 70,
        cardIds: [],
        evidenceIds: [],
        numberValues: [],
        polarity: 'neutral',
        priorityFactors: [],
        roles: ['support', 'turning-point'],
        semanticId,
        sourceId: `memory:transition:${semanticId}`,
        sourceKind: 'journey-memory',
        tags: semanticTags(semanticId, 'transition'),
      }),
    ),
  ];
}

function crossSystemRoles(link: CrossSystemLink): readonly NarrativeBlockRole[] {
  if (['modality-contrast', 'symbolic-tension', 'thematic-contrast'].includes(link.semanticType))
    return ['conflict', 'turning-point'];
  if (link.semanticType === 'journey-continuity') return ['current', 'support', 'closure'];
  return ['turning-point', 'support', 'practical'];
}

function crossSystemCandidates(reasoning: CrossSystemResult | undefined, mode: NarrativeMode) {
  if (!reasoning) return [];
  const selectedIds = new Set(
    [
      reasoning.priority.leadingLinkId,
      reasoning.priority.mainContrastId,
      reasoning.priority.journeyContinuityId,
      ...reasoning.priority.supportingLinkIds,
    ].filter((id): id is string => id !== null),
  );
  return reasoning.links
    .filter(
      (link) =>
        selectedIds.has(link.id) &&
        link.displayEligible &&
        !(
          mode === 'short' &&
          link.sourceIds.some((sourceId) => sourceId.includes(':numerology-advanced:'))
        ),
    )
    .map((link) =>
      candidate({
        basePriority:
          link.id === reasoning.priority.leadingLinkId
            ? 155
            : link.id === reasoning.priority.mainContrastId
              ? 140
              : link.semanticType === 'journey-continuity'
                ? 125
                : 110,
        cardIds: link.entityReferences
          .filter((reference) => reference.kind === 'card')
          .map((reference) => reference.id),
        evidenceIds: link.evidenceReferences,
        numberValues: link.entityReferences
          .filter((reference) => reference.kind === 'number')
          .map((reference) => Number(reference.id.split(':').at(-1)))
          .filter(Number.isFinite),
        polarity: ['contrasts', 'redirects'].includes(link.direction) ? 'tensional' : 'integrative',
        priorityFactors: [
          'strong-connection',
          ...(link.semanticType === 'period-resonance' ? (['current-period'] as const) : []),
          ...(link.semanticType === 'journey-continuity' ? (['repeated-symbol'] as const) : []),
        ],
        roles: crossSystemRoles(link),
        semanticId: `cross-system.${link.semanticType}.${link.themeId}`,
        sourceId: link.id,
        sourceKind: 'cross-system',
        tags: semanticTags(
          link.themeId,
          link.explanation.relationConcept,
          link.explanation.practicalConcept,
        ),
      }),
    );
}

function crossSystemRelations(reasoning: CrossSystemResult | undefined) {
  if (!reasoning) return [];
  return reasoning.links
    .filter((link) => link.displayEligible)
    .map((link) => ({
      cardIds: link.entityReferences
        .filter((reference) => reference.kind === 'card')
        .map((reference) => reference.id),
      id: link.id,
      kind:
        link.direction === 'contrasts'
          ? ('contrast' as const)
          : link.direction === 'balances' || link.direction === 'softens'
            ? ('balance' as const)
            : link.direction === 'redirects'
              ? ('progression' as const)
              : ('reinforcement' as const),
      semanticId: `cross-system.${link.semanticType}.${link.themeId}`,
      strength: link.strength === 'primary' ? ('primary' as const) : ('secondary' as const),
    }));
}

export function createNarrativeCompositionRequest(input: {
  composition: ThemeComposition;
  connections: readonly InterpretationConnection[];
  context: InterpretationContext;
  evidence: readonly InterpretationEvidence[];
  fingerprint: string;
  memory?: NarrativeMemoryContext;
  mode?: NarrativeMode;
  reasoning?: CrossSystemResult;
}): NarrativeCompositionRequest {
  const { composition, connections, context, evidence, fingerprint, memory, reasoning } = input;
  const mode = input.mode ?? 'standard';
  const expertRelations = connections.map((connection) => ({
    cardIds: connection.cardIds,
    id: connection.id,
    kind: relationKind(connection.kind),
    semanticId: connection.semanticId,
    strength: connection.strength,
  }));
  return {
    candidates: [
      ...composition.themes.map((theme) => themeCandidate(theme, composition.leadingThemeId)),
      ...connections.map(connectionCandidate),
      ...composition.tensions.map((tension) =>
        candidate({
          basePriority: 140,
          cardIds: connections
            .filter((connection) => tension.connectionIds.includes(connection.id))
            .flatMap((connection) => connection.cardIds),
          evidenceIds: tension.evidenceIds,
          numberValues: [],
          polarity: 'tensional',
          priorityFactors: ['tension'],
          roles: ['conflict'],
          semanticId: tension.semanticId,
          sourceId: tension.id,
          sourceKind: 'tension',
          tags: semanticTags(tension.semanticId),
        }),
      ),
      ...composition.recommendations.map((recommendation) =>
        candidate({
          basePriority: 75,
          cardIds: [],
          evidenceIds: recommendation.evidenceIds,
          numberValues: [],
          polarity: 'supportive',
          priorityFactors: ['practical-action'],
          roles: ['practical'],
          semanticId: `recommendation.${recommendation.relatedThemeId}`,
          sourceId: recommendation.id,
          sourceKind: 'recommendation',
          tags: semanticTags(recommendation.relatedThemeId, ...recommendation.contextIds),
        }),
      ),
      ...evidence.map(evidenceCandidate),
      ...numerologyKnowledgeCandidates(context),
      ...advancedNumerologyCandidates(context, mode),
      ...knowledgeCandidates(context),
      ...repeatedMotifCandidates(context),
      ...memoryCandidates(memory),
      ...crossSystemCandidates(reasoning, mode),
    ],
    fingerprint,
    leadingSemanticId:
      composition.themes.find((theme) => theme.id === composition.leadingThemeId)?.semanticId ??
      composition.leadingThemeId,
    ...(memory ? { memory } : {}),
    mode,
    ...(reasoning ? { reasoning: reasoning.priority } : {}),
    relations: [
      ...expertRelations,
      ...knowledgeRelations(context),
      ...numerologyTarotRelations(context),
      ...crossSystemRelations(reasoning),
    ],
  };
}
