import { sourcesFromEvidence } from '../evidence';
import type {
  InterpretationConnection,
  InterpretationContext,
  InterpretationRecommendation,
  InterpretationSignal,
  InterpretationTension,
  InterpretationTheme,
  ThemeComposition,
} from '../types';
import { stableId, uniqueSorted } from '../utils';

type Candidate = Omit<InterpretationTheme, 'id' | 'role' | 'tensionIds'>;

function evidenceByReferences(
  evidence: readonly InterpretationSignal[],
  cardIds: readonly string[],
  positionIds: readonly string[],
) {
  return evidence.filter(
    (item) =>
      (item.reference?.kind === 'card' && cardIds.includes(item.reference.id)) ||
      (item.reference?.kind === 'position' && positionIds.includes(item.reference.id)),
  );
}

function createCandidate(
  input: Omit<Candidate, 'sources'> & { evidence: readonly InterpretationSignal[] },
): Candidate {
  const { evidence, ...candidate } = input;
  return { ...candidate, sources: sourcesFromEvidence(evidence) };
}

function cardCandidates(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
  connections: readonly InterpretationConnection[],
): Candidate[] {
  return context.tarot.cards.map((card, index) => {
    const selectedEvidence = evidenceByReferences(evidence, [card.id], [card.positionId]);
    const relatedConnections = connections.filter((connection) =>
      connection.cardIds.includes(card.id),
    );
    return createCandidate({
      connectionIds: relatedConnections.map((connection) => connection.id),
      evidence: selectedEvidence,
      evidenceIds: selectedEvidence.map((item) => item.id),
      kind: 'card',
      priority: card.id === context.tarot.leadingCardId ? 120 : 100 - index,
      relatedCards: [card.id],
      relatedContext: [card.positionId],
      relatedNumbers: [card.number],
      semanticId: `theme.card.${card.id}.position.${card.positionId}`,
    });
  });
}

function contextCandidates(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
  connections: readonly InterpretationConnection[],
): Candidate[] {
  const result: Candidate[] = [];
  const periodOrTopic = context.tarot.topic ?? context.tarot.period ?? 'open';
  const spreadEvidence = evidence.filter(
    (item) => item.source === 'tarot-position' || item.source === 'psychological-context',
  );
  result.push(
    createCandidate({
      connectionIds: connections
        .filter((connection) => connection.strength === 'primary')
        .map((connection) => connection.id),
      evidence: spreadEvidence,
      evidenceIds: spreadEvidence.map((item) => item.id),
      kind: 'context',
      priority: 92,
      relatedCards: [],
      relatedContext: [context.tarot.spreadId, periodOrTopic],
      relatedNumbers: [],
      semanticId: `theme.spread.${context.tarot.spreadId}.${periodOrTopic}`,
    }),
  );

  const periodConnections = connections.filter(
    (connection) =>
      connection.source === 'numerology' && connection.semanticId.startsWith('numerology.period.'),
  );
  if (periodConnections.length) {
    const periodEvidenceIds = uniqueSorted(
      periodConnections.flatMap((connection) => connection.evidenceIds),
    );
    const periodEvidence = evidence.filter((item) => periodEvidenceIds.includes(item.id));
    result.push(
      createCandidate({
        connectionIds: periodConnections.map((connection) => connection.id),
        evidence: periodEvidence,
        evidenceIds: periodEvidenceIds,
        kind: 'period',
        priority: 78,
        relatedCards: uniqueSorted(periodConnections.flatMap((item) => item.cardIds)),
        relatedContext: ['numerology.period'],
        relatedNumbers: uniqueSorted(periodConnections.flatMap((item) => item.numberValues)),
        semanticId: 'theme.numerology.current-period',
      }),
    );
  }

  const practicalEvidence = evidence.filter(
    (item) => item.source === 'interest' || item.source === 'psychological-context',
  );
  result.push(
    createCandidate({
      connectionIds: connections
        .filter((connection) => connection.kind === 'practical-direction')
        .map((connection) => connection.id),
      evidence: practicalEvidence.length ? practicalEvidence : spreadEvidence,
      evidenceIds: (practicalEvidence.length ? practicalEvidence : spreadEvidence).map(
        (item) => item.id,
      ),
      kind: 'practical',
      priority: 70,
      relatedCards: [context.tarot.leadingCardId],
      relatedContext: uniqueSorted([
        context.psychology.desiredReadingFocus ?? 'reading-focus.unspecified',
        ...context.interests.selected,
      ]),
      relatedNumbers: [],
      semanticId: `theme.practical.${context.psychology.desiredReadingFocus ?? 'open'}`,
    }),
  );

  if (context.zodiac) {
    const zodiacEvidence = evidence.filter((item) => item.source === 'zodiac');
    result.push(
      createCandidate({
        connectionIds: [],
        evidence: zodiacEvidence,
        evidenceIds: zodiacEvidence.map((item) => item.id),
        kind: 'symbolic',
        priority: 40,
        relatedCards: [],
        relatedContext: [
          `zodiac.sign.${context.zodiac.signId}`,
          `zodiac.element.${context.zodiac.element}`,
          `zodiac.modality.${context.zodiac.modality}`,
        ],
        relatedNumbers: [],
        semanticId: `theme.zodiac.${context.zodiac.signId}`,
      }),
    );
  }
  return result;
}

function createTensions(
  connections: readonly InterpretationConnection[],
): readonly InterpretationTension[] {
  return connections
    .filter((connection) =>
      ['blockage', 'contrast', 'unresolved-tension'].includes(connection.kind),
    )
    .map((connection) => ({
      connectionIds: [connection.id],
      evidenceIds: connection.evidenceIds,
      id: stableId('tension', connection.id),
      semanticId: `tension.${connection.semanticId}`,
    }));
}

function createRecommendations(
  themes: readonly InterpretationTheme[],
  context: InterpretationContext,
): readonly InterpretationRecommendation[] {
  return themes
    .filter((theme) => theme.kind !== 'symbolic')
    .slice(0, 3)
    .map((theme) => ({
      contextIds: uniqueSorted([
        ...theme.relatedContext,
        ...(context.interests.selected[0] ? [context.interests.selected[0]] : []),
      ]),
      evidenceIds: theme.evidenceIds,
      id: stableId('recommendation', theme.id),
      practicalFocus: {
        key: 'interpretation.recommendation.small-observable-step',
        params: {
          theme: theme.semanticId,
          ...(context.interests.selected[0] ? { interest: context.interests.selected[0] } : {}),
        },
      },
      relatedThemeId: theme.id,
      sources: theme.sources,
    }));
}

export function composeInterpretationThemes(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
  connections: readonly InterpretationConnection[],
): ThemeComposition {
  const candidates = [
    ...cardCandidates(context, evidence, connections),
    ...contextCandidates(context, evidence, connections),
  ];
  const uniqueCandidates = [...new Map(candidates.map((item) => [item.semanticId, item])).values()]
    .sort(
      (left, right) =>
        right.priority - left.priority || left.semanticId.localeCompare(right.semanticId),
    )
    .slice(0, 7);
  const tensions = createTensions(connections);
  const themes: InterpretationTheme[] = uniqueCandidates.map((candidate, index) => {
    const tensionIds = tensions
      .filter((tension) => tension.connectionIds.some((id) => candidate.connectionIds.includes(id)))
      .map((tension) => tension.id);
    return {
      ...candidate,
      id: stableId('theme', candidate.semanticId),
      role: index === 0 ? 'leading' : 'supporting',
      tensionIds,
    };
  });
  if (themes.length < 3) throw new Error('Theme composition requires at least three themes.');
  const leadingThemeId = themes[0]?.id;
  if (!leadingThemeId) throw new Error('Theme composition requires a leading theme.');
  return {
    leadingThemeId,
    recommendations: createRecommendations(themes, context),
    tensions,
    themes,
  };
}
