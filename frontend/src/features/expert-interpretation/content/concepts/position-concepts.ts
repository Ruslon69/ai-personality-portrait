export type PositionModifier =
  | 'directional'
  | 'hidden'
  | 'outcome-oriented'
  | 'reflective'
  | 'relational'
  | 'restrictive'
  | 'supportive'
  | 'temporal';

const positionTerms: readonly [PositionModifier, readonly string[]][] = [
  ['restrictive', ['obstacle', 'risk', 'tension']],
  ['hidden', ['hidden', 'missed']],
  ['supportive', ['support', 'resource', 'strength']],
  ['directional', ['advice', 'action', 'direction', 'focus', 'opportunity', 'step']],
  ['outcome-oriented', ['integration', 'outcome']],
  ['relational', ['dynamic', 'link', 'relations', 'relationship', 'you']],
  ['temporal', ['day', 'month', 'quarter', 'start', 'week', 'year']],
];

export function resolvePositionModifier(positionId: string): PositionModifier {
  const normalized = positionId.toLowerCase();
  return (
    positionTerms.find(([, terms]) => terms.some((term) => normalized.includes(term)))?.[0] ??
    'reflective'
  );
}
