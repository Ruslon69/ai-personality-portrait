import { authorNumerologyKnowledgeBase } from '@features/numerology-knowledge';
import { authorTarotKnowledgeBase } from '@features/tarot-knowledge';
import {
  POSITION_THEME_MAPPINGS,
  PSYCHOLOGICAL_THEME_MAPPINGS,
  ZODIAC_THEME_MAPPINGS,
} from '../mappings';
import type {
  CrossSystemInput,
  CrossSystemReliability,
  CrossSystemSignal,
  CrossSystemSource,
  CrossSystemSourceKind,
  CrossSystemSourceTier,
} from '../types';
import { canonicalThemes, crossSystemStableId, uniqueSorted } from '../utils';

type SignalDraft = Omit<CrossSystemSignal, 'id'>;

function source(input: {
  engineVersions: Readonly<Record<string, string>>;
  kind: CrossSystemSourceKind;
  lineage: string;
  reliability: CrossSystemReliability;
  tier: CrossSystemSourceTier;
}): CrossSystemSource {
  return {
    ...input,
    id: `source:${input.kind}:${input.lineage}`,
  };
}

function signal(input: SignalDraft): CrossSystemSignal {
  return {
    ...input,
    entityReferences: [...input.entityReferences].sort((left, right) =>
      `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`),
    ),
    evidenceReferences: uniqueSorted(input.evidenceReferences),
    id: crossSystemStableId('cross-signal', {
      independentGroup: input.independentGroup,
      provenance: input.provenance,
      semanticType: input.semanticType,
      sourceId: input.sourceId,
      themes: input.themeIds,
    }),
    themeIds: canonicalThemes(input.themeIds),
  };
}

function tarotSignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const cardSource = sources.find(
    (item) => item.kind === 'tarot-card' && item.lineage === 'selection-v1',
  );
  const knowledgeSource = sources.find(
    (item) => item.kind === 'tarot-card' && item.lineage === 'author-tarot-knowledge-v1',
  );
  const positionSource = sources.find((item) => item.kind === 'tarot-position');
  if (!cardSource || !knowledgeSource || !positionSource) return [];
  return input.context.tarot.cards.flatMap((card) => {
    const knowledge = authorTarotKnowledgeBase.entries.find(
      (entry) => entry.identity.cardId === card.id,
    );
    const cardEvidence = input.evidence
      .filter((item) => item.reference?.kind === 'card' && item.reference.id === card.id)
      .map((item) => item.id);
    const positionTerms = Object.entries(POSITION_THEME_MAPPINGS)
      .filter(([term]) => card.positionId.includes(term))
      .flatMap(([, themes]) => themes);
    const direct = signal({
      direction: card.orientation === 'reversed' ? 'redirects' : 'frames',
      entityReferences: [{ id: card.id, kind: 'card' }],
      evidenceReferences: cardEvidence,
      independentGroup: `tarot-card:${card.id}`,
      provenance: `context.tarot.cards.${card.id}`,
      reliability: 'direct',
      semanticType: `tarot.card.${card.arcana}.${card.orientation}`,
      sourceId: cardSource.id,
      strength: card.id === input.context.tarot.leadingCardId ? 'primary' : 'secondary',
      themeIds: card.baseThemeIds,
      uncertainty: 'direct-input',
    });
    const symbolic = signal({
      direction: card.orientation === 'reversed' ? 'redirects' : 'frames',
      entityReferences: [{ id: card.id, kind: 'card' }],
      evidenceReferences: cardEvidence,
      independentGroup: `tarot-card:${card.id}`,
      provenance: `author-tarot-knowledge-v1.${card.id}`,
      reliability: 'symbolic',
      semanticType: `tarot.meaning.${card.orientation}`,
      sourceId: knowledgeSource.id,
      strength: card.id === input.context.tarot.leadingCardId ? 'primary' : 'secondary',
      themeIds: knowledge?.tagIds ?? card.baseThemeIds,
      uncertainty: 'symbolic-interpretation',
    });
    const position = signal({
      direction: 'frames',
      entityReferences: [
        { id: card.id, kind: 'card' },
        { id: card.positionId, kind: 'position' },
      ],
      evidenceReferences: input.evidence
        .filter(
          (item) => item.reference?.kind === 'position' && item.reference.id === card.positionId,
        )
        .map((item) => item.id),
      independentGroup: `tarot-position:${card.positionId}`,
      provenance: `context.tarot.position.${card.positionId}`,
      reliability: 'direct',
      semanticType: `tarot.position.${card.positionId}`,
      sourceId: positionSource.id,
      strength: card.id === input.context.tarot.leadingCardId ? 'primary' : 'secondary',
      themeIds: positionTerms.length ? positionTerms : [card.positionId],
      uncertainty: 'direct-input',
    });
    return [direct, symbolic, position];
  });
}

function readingContextSignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const targetSource = sources.find((item) => item.kind === 'tarot-position');
  if (!targetSource) return [];
  const topic = input.context.tarot.topic;
  const period = input.context.tarot.period;
  const topicThemes = {
    decision: ['decision', 'clarity'],
    love: ['connection', 'boundaries'],
    money: ['resource', 'stability'],
    open: ['reflection'],
    work: ['work', 'structure'],
  } as const;
  return [
    ...(topic
      ? [
          signal({
            direction: 'frames',
            entityReferences: [{ id: topic, kind: 'theme' }],
            evidenceReferences: [`direct:topic:${topic}`],
            independentGroup: 'reading-context:topic',
            provenance: `context.tarot.topic.${topic}`,
            reliability: 'direct',
            semanticType: 'reading.selected-topic',
            sourceId: targetSource.id,
            strength: 'primary',
            themeIds: topicThemes[topic],
            uncertainty: 'direct-input',
          }),
        ]
      : []),
    ...(period
      ? [
          signal({
            direction: 'frames',
            entityReferences: [{ id: period, kind: 'theme' }],
            evidenceReferences: [`direct:period:${period}`],
            independentGroup: 'reading-context:period',
            provenance: `context.tarot.period.${period}`,
            reliability: 'direct',
            semanticType: 'reading.selected-period',
            sourceId: targetSource.id,
            strength: 'primary',
            themeIds: [period],
            uncertainty: 'direct-input',
          }),
        ]
      : []),
  ];
}

function connectionSignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const connectionSource = sources.find((item) => item.kind === 'tarot-connection');
  if (!connectionSource) return [];
  return input.connections
    .filter((connection) => connection.source === 'tarot-connection')
    .map((connection) =>
      signal({
        direction:
          connection.kind === 'contrast' || connection.kind === 'unresolved-tension'
            ? 'contrasts'
            : connection.kind === 'blockage'
              ? 'softens'
              : 'reinforces',
        entityReferences: connection.cardIds.map((id) => ({ id, kind: 'card' as const })),
        evidenceReferences: connection.evidenceIds,
        independentGroup: `tarot-connection:${connection.id}`,
        provenance: `expert-interpretation.${connection.id}`,
        reliability: 'deterministic',
        semanticType: connection.semanticId,
        sourceId: connectionSource.id,
        strength: connection.strength,
        themeIds: [
          connection.semanticId,
          ...connection.cardIds.flatMap(
            (cardId) =>
              authorTarotKnowledgeBase.entries.find((entry) => entry.identity.cardId === cardId)
                ?.tagIds ?? [],
          ),
        ],
        uncertainty: 'deterministic-structure',
      }),
    );
}

function numerologySignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const numerology = input.context.numerology;
  if (!numerology) return [];
  return numerology.numbers.flatMap((number) => {
    const period = number.id.startsWith('personal-');
    const kind: CrossSystemSourceKind = period ? 'numerology-period' : 'numerology-core';
    const calculationSource = sources.find(
      (item) => item.kind === kind && item.lineage === numerology.system,
    );
    const knowledgeSource = sources.find(
      (item) => item.kind === kind && item.lineage === 'author-numerology-knowledge-v1',
    );
    const knowledge = authorNumerologyKnowledgeBase.entries.find(
      (entry) => entry.identity.value === number.value,
    );
    if (!calculationSource || !knowledgeSource || !knowledge) return [];
    const evidence = input.evidence
      .filter((item) => item.reference?.kind === 'number' && item.reference.id === number.id)
      .map((item) => item.id);
    const role = number.id === 'first-impression' ? 'attitude' : number.id;
    const roleKnowledge = knowledge.roleModels[role];
    const direct = signal({
      direction: 'frames',
      entityReferences: [{ id: `${number.id}:${number.value}`, kind: 'number' }],
      evidenceReferences: evidence,
      independentGroup: `numerology:${number.id}`,
      provenance: `${numerology.system}.${number.id}`,
      reliability: 'deterministic',
      semanticType: `numerology.calculated.${number.id}`,
      sourceId: calculationSource.id,
      strength:
        number.id === 'personal-year' || number.id === 'life-path' ? 'primary' : 'secondary',
      themeIds: [`number:${number.value}`],
      uncertainty: 'deterministic-structure',
    });
    const symbolic = signal({
      direction: 'frames',
      entityReferences: [{ id: `${number.id}:${number.value}`, kind: 'number' }],
      evidenceReferences: evidence,
      independentGroup: `numerology:${number.id}`,
      provenance: `author-numerology-knowledge-v1.${number.id}.${number.value}`,
      reliability: 'symbolic',
      semanticType: roleKnowledge.coreMeaning.id,
      sourceId: knowledgeSource.id,
      strength:
        number.id === 'personal-year' || number.id === 'life-path' ? 'primary' : 'secondary',
      themeIds: [
        ...knowledge.tagIds,
        roleKnowledge.coreMeaning.subject,
        roleKnowledge.coreMeaning.object,
      ],
      uncertainty: 'symbolic-interpretation',
    });
    return [direct, symbolic];
  });
}

function psychologySignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const directSource = sources.find(
    (item) => item.kind === 'psychological-context' && item.lineage === 'direct-answers-v1',
  );
  const inferenceSource = sources.find(
    (item) => item.kind === 'psychological-context' && item.lineage === 'context-inference-v1',
  );
  if (!directSource || !inferenceSource) return [];
  const direct = input.context.psychology.answers.map((answer) =>
    signal({
      direction: 'frames',
      entityReferences: [{ id: `${answer.questionId}:${answer.optionId}`, kind: 'answer' }],
      evidenceReferences: input.evidence
        .filter((item) => item.provenance === `psychological-context.answer.${answer.questionId}`)
        .map((item) => item.id),
      independentGroup: `psychology-answer:${answer.questionId}`,
      provenance: `context.psychology.answer.${answer.questionId}`,
      reliability: 'direct',
      semanticType: `psychology.answer.${answer.questionId}.${answer.optionId}`,
      sourceId: directSource.id,
      strength: 'contextual',
      themeIds: PSYCHOLOGICAL_THEME_MAPPINGS[`${answer.questionId}.${answer.optionId}`] ?? [
        answer.optionId,
      ],
      uncertainty: 'direct-input',
    }),
  );
  const inferred = input.context.psychology.derivedContextualTendencies.map((tendency) =>
    signal({
      direction: 'frames',
      entityReferences: [{ id: tendency, kind: 'theme' }],
      evidenceReferences: input.evidence
        .filter((item) => item.provenance === `psychological-context.derived.${tendency}`)
        .map((item) => item.id),
      independentGroup: `psychology-inference:${tendency}`,
      provenance: `context.psychology.derived.${tendency}`,
      reliability: 'contextual',
      semanticType: tendency,
      sourceId: inferenceSource.id,
      strength: 'contextual',
      themeIds: PSYCHOLOGICAL_THEME_MAPPINGS[tendency] ?? [tendency],
      uncertainty: 'contextual-inference',
    }),
  );
  return [...direct, ...inferred];
}

function zodiacSignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const targetSource = sources.find((item) => item.kind === 'zodiac');
  if (!targetSource || !input.context.zodiac) return [];
  return [
    signal({
      direction: 'frames',
      entityReferences: [{ id: input.context.zodiac.element, kind: 'zodiac' }],
      evidenceReferences: input.evidence
        .filter((item) => item.semanticType === 'zodiac.element')
        .map((item) => item.id),
      independentGroup: 'zodiac:sun',
      provenance: 'context.zodiac.sun.element',
      reliability: 'symbolic',
      semanticType: 'zodiac.elemental-lens',
      sourceId: targetSource.id,
      strength: 'contextual',
      themeIds: ZODIAC_THEME_MAPPINGS.element[input.context.zodiac.element],
      uncertainty: 'symbolic-interpretation',
    }),
    signal({
      direction: 'frames',
      entityReferences: [{ id: input.context.zodiac.modality, kind: 'zodiac' }],
      evidenceReferences: input.evidence
        .filter((item) => item.semanticType === 'zodiac.modality')
        .map((item) => item.id),
      independentGroup: 'zodiac:sun',
      provenance: 'context.zodiac.sun.modality',
      reliability: 'symbolic',
      semanticType: 'zodiac.modality-lens',
      sourceId: targetSource.id,
      strength: 'contextual',
      themeIds: ZODIAC_THEME_MAPPINGS.modality[input.context.zodiac.modality],
      uncertainty: 'symbolic-interpretation',
    }),
  ];
}

function interestSignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const targetSource = sources.find((item) => item.kind === 'interest');
  if (!targetSource) return [];
  const values = [
    ...input.context.interests.selected,
    ...(input.context.interests.custom ? [input.context.interests.custom] : []),
  ];
  return values.map((value) =>
    signal({
      direction: 'frames',
      entityReferences: [{ id: value, kind: 'interest' }],
      evidenceReferences: input.evidence
        .filter((item) => item.source === 'interest' && String(item.value).includes(value))
        .map((item) => item.id),
      independentGroup: `interest:${value}`,
      provenance: `context.interest.${value}`,
      reliability: 'direct',
      semanticType: 'interest.example-lens',
      sourceId: targetSource.id,
      strength: 'weak',
      themeIds: [value],
      uncertainty: 'direct-input',
    }),
  );
}

function journeySignals(input: CrossSystemInput, sources: readonly CrossSystemSource[]) {
  const targetSource = sources.find((item) => item.kind === 'journey-memory');
  const continuity = input.continuityContext;
  const memory = input.journeyMemory;
  if (!targetSource || (!continuity && !memory)) return [];
  const continuityThemes = continuity
    ? [
        ...continuity.recurringThemes,
        ...continuity.emergingThemes,
        ...continuity.fadingThemes,
        ...continuity.resolvedThemes,
      ].map((theme) => ({
        currentTrend: theme.trend,
        occurrenceCount: theme.occurrenceCount,
        occurrences: theme.relatedEntryIds.map((entryId) => ({ entryId, themeId: theme.themeId })),
        themeId: theme.themeId,
      }))
    : (memory?.recurringThemes ?? []);
  const themes = continuityThemes.map((theme) =>
    signal({
      direction:
        theme.currentTrend === 'intensifying'
          ? 'intensifies'
          : theme.currentTrend === 'fading' || theme.currentTrend === 'resolved'
            ? 'softens'
            : 'reinforces',
      entityReferences: [{ id: theme.themeId, kind: 'theme' }],
      evidenceReferences: theme.occurrences.map(
        (occurrence) => `journey:${occurrence.entryId}:${occurrence.themeId}`,
      ),
      independentGroup: `journey-theme:${theme.themeId}`,
      provenance: `journey-memory.${theme.themeId}.${theme.currentTrend}`,
      reliability: 'deterministic',
      semanticType: `journey.${theme.currentTrend}`,
      sourceId: targetSource.id,
      strength:
        theme.currentTrend === 'isolated' || theme.currentTrend === 'fading' ? 'weak' : 'secondary',
      themeIds: [theme.themeId],
      uncertainty: 'deterministic-structure',
    }),
  );
  const recommendationPatterns =
    continuity?.repeatedPracticalFocuses ?? memory?.recommendationPatterns ?? [];
  const recommendations = recommendationPatterns.map((pattern) =>
    signal({
      direction: 'reinforces',
      entityReferences: [{ id: pattern.category, kind: 'theme' }],
      evidenceReferences: pattern.entryIds.map((id) => `journey:${id}:practical-focus`),
      independentGroup: `journey-practice:${pattern.category}`,
      provenance: `journey-memory.recommendation.${pattern.id}`,
      reliability: 'deterministic',
      semanticType: 'journey.repeated-practical-focus',
      sourceId: targetSource.id,
      strength: pattern.entryIds.length > 1 ? 'secondary' : 'weak',
      themeIds: [pattern.category],
      uncertainty: 'deterministic-structure',
    }),
  );
  const availableCardPatterns = continuity?.repeatedCards ?? memory?.cardPatterns ?? [];
  const cardPatterns = availableCardPatterns.map((pattern) =>
    signal({
      direction:
        pattern.relation === 'contrast' || pattern.relation === 'unresolved-sequence'
          ? 'contrasts'
          : pattern.relation === 'interruption'
            ? 'redirects'
            : 'reinforces',
      entityReferences: pattern.cardIds.map((id) => ({ id, kind: 'card' as const })),
      evidenceReferences: pattern.entryIds.map((id) => `journey:${id}:card-pattern`),
      independentGroup: `journey-card-pattern:${pattern.id}`,
      provenance: `journey-memory.card-pattern.${pattern.id}`,
      reliability: 'deterministic',
      semanticType: `journey.card-pattern.${'patternType' in pattern ? pattern.patternType : 'repeated-card'}.${pattern.relation}`,
      sourceId: targetSource.id,
      strength: pattern.entryIds.length > 1 ? 'secondary' : 'weak',
      themeIds: [pattern.semanticId, pattern.relation],
      uncertainty: 'deterministic-structure',
    }),
  );
  const transitions = (continuity?.recentTransitions ?? memory?.transitions ?? []).map(
    (transition) =>
      signal({
        direction:
          transition.type === 'theme-intensified'
            ? 'intensifies'
            : transition.type === 'theme-weakened'
              ? 'softens'
              : 'redirects',
        entityReferences: [
          { id: transition.fromEntryId, kind: 'theme' },
          { id: transition.toEntryId, kind: 'theme' },
        ],
        evidenceReferences: transition.evidence.map((item) => item.id),
        independentGroup: `journey-transition:${transition.id}`,
        provenance: `journey-memory.transition.${transition.id}`,
        reliability: 'deterministic',
        semanticType: `journey.transition.${transition.type}`,
        sourceId: targetSource.id,
        strength: 'secondary',
        themeIds: [transition.type, transition.semanticSummary.key],
        uncertainty: 'deterministic-structure',
      }),
  );
  const incompatibleNumbers = (continuity?.repeatedNumbers ?? memory?.numberPatterns ?? [])
    .filter((pattern) => pattern.compatibility !== 'compatible')
    .map((pattern) =>
      signal({
        direction: 'frames',
        entityReferences: pattern.values.map((value) => ({
          id: `journey-number:${value}`,
          kind: 'number' as const,
        })),
        evidenceReferences: pattern.entryIds.map((id) => `journey:${id}:number-lineage`),
        independentGroup: `journey-number-lineage:${pattern.id}`,
        provenance: `journey-memory.number-pattern.${pattern.id}.${pattern.compatibility}`,
        reliability: 'deterministic',
        semanticType: 'journey.incompatible-number-lineage',
        sourceId: targetSource.id,
        strength: 'weak',
        themeIds: ['incompatible-lineage'],
        uncertainty: 'insufficient-context',
      }),
    );
  return [...themes, ...recommendations, ...cardPatterns, ...transitions, ...incompatibleNumbers];
}

export function normalizeCrossSystemInput(input: CrossSystemInput): {
  signals: readonly CrossSystemSignal[];
  sources: readonly CrossSystemSource[];
} {
  const versions = input.sourceEngineVersions;
  const sources: CrossSystemSource[] = [
    source({
      engineVersions: versions,
      kind: 'tarot-card',
      lineage: 'selection-v1',
      reliability: 'direct',
      tier: 1,
    }),
    source({
      engineVersions: versions,
      kind: 'tarot-card',
      lineage: 'author-tarot-knowledge-v1',
      reliability: 'symbolic',
      tier: 4,
    }),
    source({
      engineVersions: versions,
      kind: 'tarot-position',
      lineage: 'tarot-v1',
      reliability: 'direct',
      tier: 1,
    }),
    source({
      engineVersions: versions,
      kind: 'tarot-connection',
      lineage: 'tarot-v1',
      reliability: 'deterministic',
      tier: 2,
    }),
  ];
  if (input.context.numerology) {
    sources.push(
      source({
        engineVersions: versions,
        kind: 'numerology-core',
        lineage: input.context.numerology.system,
        reliability: 'deterministic',
        tier: 1,
      }),
      source({
        engineVersions: versions,
        kind: 'numerology-core',
        lineage: 'author-numerology-knowledge-v1',
        reliability: 'symbolic',
        tier: 4,
      }),
      source({
        engineVersions: versions,
        kind: 'numerology-period',
        lineage: input.context.numerology.system,
        reliability: 'deterministic',
        tier: 1,
      }),
      source({
        engineVersions: versions,
        kind: 'numerology-period',
        lineage: 'author-numerology-knowledge-v1',
        reliability: 'symbolic',
        tier: 4,
      }),
    );
  }
  if (input.context.psychology.answers.length) {
    sources.push(
      source({
        engineVersions: versions,
        kind: 'psychological-context',
        lineage: 'direct-answers-v1',
        reliability: 'direct',
        tier: 1,
      }),
      source({
        engineVersions: versions,
        kind: 'psychological-context',
        lineage: 'context-inference-v1',
        reliability: 'contextual',
        tier: 3,
      }),
    );
  }
  if (input.context.interests.selected.length || input.context.interests.custom) {
    sources.push(
      source({
        engineVersions: versions,
        kind: 'interest',
        lineage: 'direct-input-v1',
        reliability: 'direct',
        tier: 1,
      }),
    );
  }
  if (input.context.zodiac) {
    sources.push(
      source({
        engineVersions: versions,
        kind: 'zodiac',
        lineage: 'sun-sign-v1',
        reliability: 'symbolic',
        tier: 4,
      }),
    );
  }
  if (input.continuityContext || input.journeyMemory) {
    const versions = input.continuityContext
      ? { journeyMemory: input.continuityContext.journeySnapshotVersion }
      : input.journeyMemory!.metadata.versions;
    sources.push(
      source({
        engineVersions: versions,
        kind: 'journey-memory',
        lineage:
          input.continuityContext?.journeySnapshotVersion ??
          input.journeyMemory!.metadata.versions.engine,
        reliability: 'deterministic',
        tier: 2,
      }),
    );
  }
  const signals = [
    ...tarotSignals(input, sources),
    ...readingContextSignals(input, sources),
    ...connectionSignals(input, sources),
    ...numerologySignals(input, sources),
    ...psychologySignals(input, sources),
    ...zodiacSignals(input, sources),
    ...interestSignals(input, sources),
    ...journeySignals(input, sources),
  ];
  return {
    signals: [...new Map(signals.map((item) => [item.id, item])).values()].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    sources: [...sources].sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export function collectCrossSystemThemes(
  signals: readonly CrossSystemSignal[],
): readonly import('../types').CrossSystemTheme[] {
  const themes = new Map<string, CrossSystemSignal[]>();
  signals.forEach((item) =>
    item.themeIds.forEach((theme) => themes.set(theme, [...(themes.get(theme) ?? []), item])),
  );
  return [...themes.entries()]
    .map(([id, occurrences]) => ({
      id,
      occurrenceCount: occurrences.length,
      signalIds: uniqueSorted(occurrences.map((item) => item.id)),
      sourceIds: uniqueSorted(occurrences.map((item) => item.sourceId)),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}
