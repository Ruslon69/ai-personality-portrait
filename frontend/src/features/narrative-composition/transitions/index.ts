import type {
  NarrativeChapter,
  NarrativeConflict,
  NarrativeTransition,
  NarrativeTransitionKind,
} from '../types';
import { narrativeStableId } from '../utils';

const transitionFlow: readonly NarrativeTransitionKind[] = [
  'continuation',
  'deepening',
  'shift',
  'consequence',
  'question',
  'completion',
];

export function createNarrativeTransitions(
  chapters: readonly NarrativeChapter[],
  conflict: NarrativeConflict | null,
): readonly NarrativeTransition[] {
  return chapters.slice(0, -1).map((chapter, index) => {
    const next = chapters[index + 1];
    const kind = index === 2 && conflict ? 'contrast' : transitionFlow[index];
    return {
      fromChapterId: chapter.id,
      id: narrativeStableId('narrative-transition', `${chapter.id}:${next.id}:${kind}`),
      kind,
      ...(index === 2 && conflict && conflict.relationIds[0]
        ? { relationId: conflict.relationIds[0] }
        : {}),
      toChapterId: next.id,
    };
  });
}
