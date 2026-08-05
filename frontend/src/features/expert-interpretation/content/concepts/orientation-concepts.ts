import type { InterpretationContext, InterpretationTarotCardContext } from '../../types';
import { stableHash } from '../../utils';

export type ReversedMode =
  'blockage' | 'delay' | 'excess' | 'inner-expression' | 'lack' | 'reassessment' | 'revision';

const reversedModes: readonly ReversedMode[] = [
  'inner-expression',
  'delay',
  'blockage',
  'excess',
  'lack',
  'reassessment',
  'revision',
];

export function resolveReversedMode(
  card: InterpretationTarotCardContext,
  context: InterpretationContext,
): ReversedMode | null {
  if (card.orientation === 'upright') return null;
  const fingerprint = [
    card.id,
    card.positionId,
    context.tarot.topic ?? context.tarot.period ?? 'open',
    ...card.neighbouringCardIds,
  ].join(':');
  return (
    reversedModes[Number.parseInt(stableHash(fingerprint), 36) % reversedModes.length] ?? 'revision'
  );
}
