import type { CollectedEvidence, TraitId, TraitScore } from '../model';
import { traitOrder } from '../data';

export function evaluateTraits(evidence: readonly CollectedEvidence[]): readonly TraitScore[] {
  return traitOrder
    .map((id, order) => {
      const matchingEvidence = evidence.filter((item) => item.traits.includes(id));
      return {
        evidence: matchingEvidence,
        id,
        order,
        score: matchingEvidence.reduce((sum, item) => sum + item.weight, 0),
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .map(({ evidence: traitEvidence, id, score }) => ({ evidence: traitEvidence, id, score }));
}

export function selectRankedTraits(
  ranked: readonly TraitScore[],
  preferred: readonly TraitId[],
  count: number,
) {
  const preferredSet = new Set(preferred);
  const selected = ranked.filter((item) => preferredSet.has(item.id)).slice(0, count);

  if (selected.length === count) return selected;

  return [
    ...selected,
    ...ranked.filter((item) => !selected.some((selectedItem) => selectedItem.id === item.id)),
  ].slice(0, count);
}
