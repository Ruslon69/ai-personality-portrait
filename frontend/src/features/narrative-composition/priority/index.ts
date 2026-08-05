import { NARRATIVE_PRIORITY_WEIGHTS } from '../constants';
import type { NarrativeCandidate } from '../types';

export function narrativeCandidatePriority(candidate: NarrativeCandidate): number {
  return (
    candidate.basePriority +
    candidate.priorityFactors.reduce(
      (total, factor) => total + NARRATIVE_PRIORITY_WEIGHTS[factor],
      0,
    )
  );
}

export function prioritizeNarrativeCandidates(
  candidates: readonly NarrativeCandidate[],
): readonly NarrativeCandidate[] {
  return [...candidates].sort(
    (left, right) =>
      narrativeCandidatePriority(right) - narrativeCandidatePriority(left) ||
      left.semanticId.localeCompare(right.semanticId) ||
      left.id.localeCompare(right.id),
  );
}
