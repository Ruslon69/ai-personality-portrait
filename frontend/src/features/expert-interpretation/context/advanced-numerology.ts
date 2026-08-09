import type { AdvancedNumerologyProfile } from '@features/numerology';

import type { InterpretationAdvancedNumerologyInput } from '../types';

export function createAdvancedInterpretationNumerologyInput(
  profile: AdvancedNumerologyProfile,
): InterpretationAdvancedNumerologyInput {
  const candidates = [
    profile.transitions.pinnacle.next
      ? {
          kind: 'pinnacle' as const,
          monthsUntilTransition: profile.transitions.pinnacle.monthsUntilTransition ?? 0,
          nextValue: profile.transitions.pinnacle.next.result,
          withinTransitionWindow: profile.transitions.pinnacle.withinTransitionWindow,
        }
      : null,
    profile.transitions.lifeCycle.next
      ? {
          kind: 'life-cycle' as const,
          monthsUntilTransition: profile.transitions.lifeCycle.monthsUntilTransition ?? 0,
          nextValue: profile.transitions.lifeCycle.next.value,
          withinTransitionWindow: profile.transitions.lifeCycle.withinTransitionWindow,
        }
      : null,
  ]
    .filter((item) => item !== null)
    .sort(
      (left, right) =>
        left.monthsUntilTransition - right.monthsUntilTransition ||
        left.kind.localeCompare(right.kind),
    );
  return {
    calculationSystem: profile.calculationMetadata.calculationSystem,
    currentChallenge: {
      ordinal: profile.currentChallenge.ordinal,
      value: profile.currentChallenge.result,
    },
    currentLifeCycle: {
      ordinal: profile.currentLifeCycle.ordinal,
      value: profile.currentLifeCycle.value,
    },
    currentPinnacle: {
      ordinal: profile.currentPinnacle.ordinal,
      value: profile.currentPinnacle.result,
    },
    karmicDebts: profile.karmicDebts.map((item) => ({
      debtNumber: item.debtNumber,
      provenance: item.provenance.operationId,
      reducedValue: item.reducedValue,
    })),
    upcomingTransition: candidates[0] ?? null,
  };
}
