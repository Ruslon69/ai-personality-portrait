import { canonicalNarrativeTag } from '../repetition';
import type { NarrativeCandidate, NarrativeConflict, NarrativeRelationInput } from '../types';
import { narrativeStableId } from '../utils';

const opposingFamilies = [
  ['movement', 'pause'],
  ['structure', 'freedom'],
  ['clarity', 'tension'],
  ['stability', 'transition'],
] as const;

function candidateFamilies(candidate: NarrativeCandidate) {
  return new Set(candidate.tags.map(canonicalNarrativeTag));
}

function relationConflict(
  candidates: readonly NarrativeCandidate[],
  relations: readonly NarrativeRelationInput[],
) {
  const relation = [...relations]
    .filter((item) => ['blockage', 'contrast', 'tension'].includes(item.kind))
    .sort(
      (left, right) =>
        (left.strength === right.strength ? 0 : left.strength === 'primary' ? -1 : 1) ||
        left.id.localeCompare(right.id),
    )[0];
  if (!relation) return null;
  const poles = candidates
    .filter(
      (candidate) =>
        candidate.id === relation.id ||
        candidate.cardIds.some((cardId) => relation.cardIds.includes(cardId)),
    )
    .slice(0, 2);
  return poles.length >= 2 ? { poles, relation } : null;
}

function semanticConflict(candidates: readonly NarrativeCandidate[]) {
  for (const [leftFamily, rightFamily] of opposingFamilies) {
    const left = candidates.find((candidate) => candidateFamilies(candidate).has(leftFamily));
    const right = candidates.find(
      (candidate) => candidate.id !== left?.id && candidateFamilies(candidate).has(rightFamily),
    );
    if (left && right) return { left, right };
  }
  return null;
}

export function resolveNarrativeConflict(
  candidates: readonly NarrativeCandidate[],
  relations: readonly NarrativeRelationInput[],
): NarrativeConflict | null {
  const resolution =
    candidates.find((candidate) => candidate.roles.includes('practical')) ??
    candidates.find((candidate) => candidate.roles.includes('turning-point'));
  if (!resolution) return null;
  const explicit = relationConflict(candidates, relations);
  if (explicit) {
    return {
      id: narrativeStableId('narrative-conflict', explicit.relation.id),
      kind: explicit.relation.kind as 'blockage' | 'contrast' | 'tension',
      poleBlockIds: explicit.poles.map((candidate) => candidate.id),
      relationIds: [explicit.relation.id],
      resolutionBlockId: resolution.id,
      strength: explicit.relation.strength === 'primary' ? 'primary' : 'secondary',
    };
  }
  const semantic = semanticConflict(candidates);
  if (!semantic) return null;
  const fingerprint = `${semantic.left.id}:${semantic.right.id}`;
  return {
    id: narrativeStableId('narrative-conflict', fingerprint),
    kind: 'contrast',
    poleBlockIds: [semantic.left.id, semantic.right.id],
    relationIds: [],
    resolutionBlockId: resolution.id,
    strength: 'secondary',
  };
}
