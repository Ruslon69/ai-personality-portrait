import type {
  InterpretationConfidence,
  InterpretationConnectionKind,
  InterpretationContext,
  InterpretationMessagePart,
  InterpretationTheme,
  InterpretationWording,
} from '../types';
import { compactParams } from '../utils';

export type WordingInput = {
  confidence: InterpretationConfidence;
  context: InterpretationContext;
  relationship: InterpretationConnectionKind | null;
  theme: InterpretationTheme;
};

function part(
  key: string,
  params: Record<string, boolean | number | string | null | undefined>,
): InterpretationMessagePart {
  return { key, params: compactParams(params) };
}

export function createInterpretationWording(input: WordingInput): InterpretationWording {
  const { context, theme } = input;
  const personalYear = context.numerology?.numbers.find(
    (number) => number.id === 'personal-year',
  )?.value;
  const shared = {
    concern: context.psychology.currentConcern,
    focus: context.psychology.desiredReadingFocus,
    period: context.tarot.period,
    personalYear,
    relationship: input.relationship,
    semanticTheme: theme.semanticId,
    topic: context.tarot.topic,
    zodiacElement: context.zodiac?.element,
    zodiacModality: context.zodiac?.modality,
    zodiacSign: context.zodiac?.signId,
  };
  return {
    connectionConcept: part('interpretation.connection', shared),
    headlineConcept: part(`interpretation.headline.${theme.kind}`, shared),
    locale: context.locale,
    openingConcept: part('interpretation.opening', shared),
    practicalConcept: part('interpretation.practical-focus', {
      ...shared,
      interest: context.interests.selected[0] ?? context.interests.custom,
    }),
    reflectionConcept: part('interpretation.reflection-question', shared),
    uncertaintyConcept: part(`interpretation.uncertainty.${input.confidence.uncertainty}`, {
      level: input.confidence.level,
    }),
  };
}
