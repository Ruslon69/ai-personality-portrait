import type { InterpretationContext, InterpretationSignal } from '../types';
import { resolveNumerologyConnections } from './numerology-connections';
import { resolveTarotConnections } from './tarot-connections';

export function resolveInterpretationConnections(
  context: InterpretationContext,
  evidence: readonly InterpretationSignal[],
) {
  return [
    ...resolveTarotConnections(context, evidence),
    ...resolveNumerologyConnections(context, evidence),
  ].sort((left, right) => left.id.localeCompare(right.id));
}
