import { NARRATIVE_CHAPTER_ORDER, NARRATIVE_EMOTIONAL_CURVE } from '../constants';
import type {
  NarrativeBlockRole,
  NarrativeCandidate,
  NarrativeChapter,
  NarrativeChapterKind,
  NarrativeMode,
} from '../types';
import { narrativeStableId, uniqueValues } from '../utils';

const chapterRoles: Readonly<Record<NarrativeChapterKind, readonly NarrativeBlockRole[]>> = {
  opening: ['lead', 'current'],
  'current-situation': ['current', 'support'],
  'hidden-dynamic': ['conflict', 'support'],
  'main-turning-point': ['turning-point', 'softener', 'support'],
  'practical-direction': ['practical'],
  reflection: ['reflection'],
  'closing-thought': ['closure', 'softener', 'support'],
};

const primaryPurpose: Readonly<Record<NarrativeChapterKind, NarrativeBlockRole>> = {
  opening: 'lead',
  'current-situation': 'current',
  'hidden-dynamic': 'conflict',
  'main-turning-point': 'turning-point',
  'practical-direction': 'practical',
  reflection: 'reflection',
  'closing-thought': 'closure',
};

const intensities = [1, 2, 3, 5, 4, 2, 1] as const;

function chapterLimit(mode: NarrativeMode, kind: NarrativeChapterKind) {
  if (['practical-direction', 'reflection', 'closing-thought'].includes(kind)) return 1;
  if (mode === 'short') return 1;
  if (mode === 'standard') return 2;
  return 3;
}

export function composeNarrativeChapters(
  orderedCandidates: readonly NarrativeCandidate[],
  mode: NarrativeMode,
  fingerprint: string,
): readonly NarrativeChapter[] {
  const used = new Set<string>();
  return NARRATIVE_CHAPTER_ORDER.map((kind, index) => {
    const acceptedRoles = chapterRoles[kind];
    const available = orderedCandidates.filter((candidate) => !used.has(candidate.id));
    const matching = available.filter((candidate) =>
      candidate.roles.some((role) => acceptedRoles.includes(role)),
    );
    const pool = matching.length ? matching : available;
    const remainingChapterCount = NARRATIVE_CHAPTER_ORDER.length - index - 1;
    const safeLimit = Math.max(
      1,
      Math.min(chapterLimit(mode, kind), available.length - remainingChapterCount),
    );
    const selected = pool.slice(0, safeLimit);
    if (!selected.length) throw new Error(`Narrative chapter ${kind} has no semantic source.`);
    selected.forEach((candidate) => used.add(candidate.id));
    return {
      blockIds: selected.map((candidate) => candidate.id),
      emotionalPhase: NARRATIVE_EMOTIONAL_CURVE[index],
      emphasisTags: uniqueValues(selected.flatMap((candidate) => candidate.tags)).slice(0, 5),
      id: narrativeStableId('narrative-chapter', `${fingerprint}:${kind}`),
      intensity: intensities[index],
      kind,
      ordinal: index + 1,
      purpose: primaryPurpose[kind],
    };
  });
}
