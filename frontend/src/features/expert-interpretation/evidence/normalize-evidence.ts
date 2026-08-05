import type {
  InterpretationContext,
  InterpretationReference,
  InterpretationSignal,
  InterpretationSource,
} from '../types';
import { stableId, uniqueSorted } from '../utils';

type SignalInput = Omit<InterpretationSignal, 'id' | 'tags'> & { tags?: readonly string[] };

function createSignal(input: SignalInput): InterpretationSignal {
  return {
    ...input,
    id: stableId('evidence', {
      provenance: input.provenance,
      semanticType: input.semanticType,
      source: input.source,
      value: input.value,
    }),
    tags: uniqueSorted(input.tags ?? []),
  };
}

function reference(kind: InterpretationReference['kind'], id: string): InterpretationReference {
  return { id, kind };
}

function tarotSignals(context: InterpretationContext): InterpretationSignal[] {
  return context.tarot.cards.flatMap((card, index) => {
    const cardReference = reference('card', card.id);
    const positionReference = reference('position', card.positionId);
    return [
      createSignal({
        polarity: card.orientation === 'reversed' ? 'challenging' : 'supportive',
        provenance: `tarot.selection.${index}`,
        reference: cardReference,
        reliability: 'direct',
        scope: 'spread',
        semanticType: 'tarot.selected-card',
        source: 'tarot-card',
        strength: card.id === context.tarot.leadingCardId ? 'primary' : 'secondary',
        tags: [
          `arcana:${card.arcana}`,
          `orientation:${card.orientation}`,
          `number:${card.number}`,
          ...(card.suit ? [`suit:${card.suit}`] : []),
          ...card.baseThemeIds,
        ],
        value: card.id,
      }),
      createSignal({
        polarity: card.orientation === 'reversed' ? 'challenging' : 'neutral',
        provenance: `tarot.selection.${index}.orientation`,
        reference: cardReference,
        reliability: 'direct',
        scope: 'spread',
        semanticType: 'tarot.orientation',
        source: 'tarot-card',
        strength: 'secondary',
        tags: [`orientation:${card.orientation}`],
        value: card.orientation,
      }),
      createSignal({
        polarity: 'neutral',
        provenance: `tarot.spread.${context.tarot.spreadId}.position.${index}`,
        reference: positionReference,
        reliability: 'direct',
        scope: 'spread',
        semanticType: 'tarot.spread-position',
        source: 'tarot-position',
        strength: index === 0 ? 'primary' : 'secondary',
        tags: [`position:${card.positionId}`, `spread:${context.tarot.spreadId}`],
        value: card.positionId,
      }),
    ];
  });
}

function numerologySignals(context: InterpretationContext): InterpretationSignal[] {
  if (!context.numerology) return [];
  return context.numerology.numbers.map((number) =>
    createSignal({
      polarity: 'neutral',
      provenance: `numerology.${context.numerology?.system}.${number.id}`,
      reference: reference('number', number.id),
      reliability: 'deterministic',
      scope: 'calculation',
      semanticType: `numerology.${number.id}`,
      source: 'numerology',
      strength:
        number.id === 'life-path' || number.id === 'personal-year' ? 'primary' : 'secondary',
      tags: [
        `number:${number.value}`,
        ...(context.numerology?.masterNumbers.includes(number.value)
          ? [`master-number:${number.value}`]
          : []),
      ],
      value: number.value,
    }),
  );
}

function zodiacSignals(context: InterpretationContext): InterpretationSignal[] {
  if (!context.zodiac) return [];
  return [
    ['sign', context.zodiac.signId],
    ['element', context.zodiac.element],
    ['modality', context.zodiac.modality],
  ].map(([kind, value]) =>
    createSignal({
      polarity: 'neutral',
      provenance: `zodiac.sun.${kind}`,
      reference: reference('context', `zodiac-${kind}`),
      reliability: 'symbolic',
      scope: 'symbolic',
      semanticType: `zodiac.${kind}`,
      source: 'zodiac',
      strength: 'contextual',
      tags: [`zodiac:${kind}:${value}`],
      value: value ?? '',
    }),
  );
}

function psychologicalSignals(context: InterpretationContext): InterpretationSignal[] {
  const answers = context.psychology.answers.map((answer) =>
    createSignal({
      polarity: 'neutral',
      provenance: `psychological-context.answer.${answer.questionId}`,
      reference: reference('context', answer.questionId),
      reliability: 'direct',
      scope: 'context',
      semanticType: `psychological-context.${answer.questionId}`,
      source: 'psychological-context',
      strength: 'contextual',
      tags: [`answer:${answer.questionId}:${answer.optionId}`],
      value: answer.optionId,
    }),
  );
  const tendencies = context.psychology.derivedContextualTendencies.map((tendency) =>
    createSignal({
      polarity: 'neutral',
      provenance: `psychological-context.derived.${tendency}`,
      reference: reference('context', tendency),
      reliability: 'contextual',
      scope: 'context',
      semanticType: 'psychological-context.tendency',
      source: 'psychological-context',
      strength: 'contextual',
      tags: [tendency],
      value: tendency,
    }),
  );
  return [...answers, ...tendencies];
}

function interestSignals(context: InterpretationContext): InterpretationSignal[] {
  const interests = [
    ...context.interests.selected,
    ...(context.interests.custom ? [`custom:${context.interests.custom}`] : []),
  ];
  return interests.map((interest) =>
    createSignal({
      polarity: 'neutral',
      provenance: `interest.user-selected.${interest}`,
      reference: reference('context', interest),
      reliability: 'direct',
      scope: 'personalization',
      semanticType: 'interest.selected',
      source: 'interest',
      strength: 'contextual',
      tags: [`interest:${interest}`],
      value: interest,
    }),
  );
}

export function normalizeInterpretationEvidence(
  context: InterpretationContext,
): readonly InterpretationSignal[] {
  return [
    ...tarotSignals(context),
    ...numerologySignals(context),
    ...zodiacSignals(context),
    ...psychologicalSignals(context),
    ...interestSignals(context),
  ].sort((left, right) => left.id.localeCompare(right.id));
}

export function sourcesFromEvidence(
  evidence: readonly InterpretationSignal[],
): readonly InterpretationSource[] {
  return uniqueSorted(evidence.map((item) => item.source));
}
