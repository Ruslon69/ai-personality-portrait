import type { NarrativeBlockRole, NarrativeCandidate } from '../types';
import { uniqueValues } from '../utils';

const semanticFamilies: Readonly<Record<string, string>> = {
  intuition: 'inner-guidance',
  reflection: 'inner-guidance',
  truth: 'clarity',
  clarity: 'clarity',
  action: 'movement',
  energy: 'movement',
  momentum: 'movement',
  pause: 'pause',
  rest: 'pause',
  patience: 'pause',
  material: 'resource',
  money: 'resource',
  resource: 'resource',
  connection: 'connection',
  reciprocity: 'connection',
  relationship: 'connection',
  boundaries: 'structure',
  discipline: 'structure',
  stability: 'structure',
  creativity: 'expansion',
  growth: 'expansion',
  opportunity: 'expansion',
  change: 'transition',
  completion: 'transition',
  release: 'transition',
  transition: 'transition',
  conflict: 'tension',
  risk: 'tension',
  uncertainty: 'tension',
  choice: 'direction',
  decision: 'direction',
  planning: 'direction',
  recovery: 'support',
  support: 'support',
};

const roleFamilies: Readonly<Record<NarrativeBlockRole, string>> = {
  closure: 'closure',
  conflict: 'conflict',
  current: 'context',
  lead: 'context',
  practical: 'practical',
  reflection: 'reflection',
  softener: 'integration',
  support: 'context',
  'turning-point': 'turning',
};

export function canonicalNarrativeTag(tag: string): string {
  const normalized = tag.toLowerCase().replace(/^(theme|card|context|semantic)[.:]/u, '');
  return semanticFamilies[normalized] ?? normalized;
}

export function narrativeSemanticSignature(candidate: NarrativeCandidate): string {
  const role = candidate.roles.map((item) => roleFamilies[item]).sort()[0] ?? 'context';
  const tags = uniqueValues(candidate.tags.map(canonicalNarrativeTag)).slice(0, 2);
  return `${role}:${tags.join('+') || candidate.semanticId}`;
}

export function eliminateNarrativeRepetition(orderedCandidates: readonly NarrativeCandidate[]): {
  candidates: readonly NarrativeCandidate[];
  eliminatedIds: readonly string[];
} {
  const retained = new Map<string, NarrativeCandidate>();
  const eliminatedIds: string[] = [];
  orderedCandidates.forEach((candidate) => {
    const exactKey = `exact:${candidate.semanticId}`;
    const semanticKey = `semantic:${narrativeSemanticSignature(candidate)}`;
    const existingKey = retained.has(exactKey)
      ? exactKey
      : retained.has(semanticKey)
        ? semanticKey
        : null;
    if (!existingKey) {
      retained.set(exactKey, candidate);
      retained.set(semanticKey, candidate);
      return;
    }
    const existing = retained.get(existingKey);
    if (!existing) return;
    const merged: NarrativeCandidate = {
      ...existing,
      cardIds: uniqueValues([...existing.cardIds, ...candidate.cardIds]),
      evidenceIds: uniqueValues([...existing.evidenceIds, ...candidate.evidenceIds]),
      mergedFromIds: uniqueValues([
        ...existing.mergedFromIds,
        ...candidate.mergedFromIds,
        candidate.id,
      ]),
      numberValues: uniqueValues([...existing.numberValues, ...candidate.numberValues]),
      priorityFactors: uniqueValues([...existing.priorityFactors, ...candidate.priorityFactors]),
      roles: existing.roles,
      tags: existing.tags,
    };
    [...retained.entries()].forEach(([key, value]) => {
      if (value.id === existing.id) retained.set(key, merged);
    });
    eliminatedIds.push(candidate.id);
  });
  return {
    candidates: [...new Map([...retained.values()].map((item) => [item.id, item])).values()],
    eliminatedIds: uniqueValues(eliminatedIds),
  };
}
