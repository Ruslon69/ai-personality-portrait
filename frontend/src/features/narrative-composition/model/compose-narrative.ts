import { NARRATIVE_EMOTIONAL_CURVE, NARRATIVE_VERSIONS, NARRATIVE_VOICE } from '../constants';
import { resolveNarrativeConflict } from '../contrast';
import { composeNarrativeChapters } from '../pacing';
import { prioritizeNarrativeCandidates } from '../priority';
import { eliminateNarrativeRepetition } from '../repetition';
import { createNarrativeTransitions } from '../transitions';
import type { NarrativeComposition, NarrativeCompositionRequest, NarrativeFlow } from '../types';
import { narrativeStableId, stableNarrativeStringify, uniqueValues } from '../utils';

function createFlow(composition: {
  blocks: NarrativeComposition['blocks'];
  chapters: NarrativeComposition['chapters'];
  conflict: NarrativeComposition['conflict'];
}): NarrativeFlow {
  const opening = composition.chapters[0];
  const closing = composition.chapters[composition.chapters.length - 1];
  const usedIds = uniqueValues(composition.chapters.flatMap((chapter) => chapter.blockIds));
  const amplifiedBlockIds = composition.blocks
    .filter((block) =>
      block.priorityFactors.some((factor) =>
        ['leading-card', 'repeated-symbol', 'strong-connection', 'tension'].includes(factor),
      ),
    )
    .map((block) => block.id);
  const softenedBlockIds = composition.blocks
    .filter((block) => block.roles.includes('softener'))
    .map((block) => block.id);
  return {
    amplifiedBlockIds: uniqueValues(amplifiedBlockIds),
    closingBlockId: closing.blockIds[0],
    leadingBlockId: opening.blockIds[0],
    primaryConflictId: composition.conflict?.id ?? null,
    secondaryBlockIds: usedIds.filter(
      (id) => id !== opening.blockIds[0] && id !== closing.blockIds[0],
    ),
    softenedBlockIds: uniqueValues(softenedBlockIds),
  };
}

export function composeNarrative(
  request: NarrativeCompositionRequest,
): Omit<NarrativeComposition, 'quality'> {
  if (request.candidates.length < 7)
    throw new Error('Narrative composition requires at least seven semantic candidates.');
  const ordered = prioritizeNarrativeCandidates(request.candidates);
  const repetition = eliminateNarrativeRepetition(ordered);
  if (repetition.candidates.length < 7)
    throw new Error('Narrative repetition pass left too few distinct semantic candidates.');
  const graphFingerprint = stableNarrativeStringify({
    candidates: repetition.candidates,
    leadingSemanticId: request.leadingSemanticId,
    memory: request.memory ?? null,
    reasoning: request.reasoning ?? null,
    relations: request.relations,
  });
  const chapters = composeNarrativeChapters(
    repetition.candidates,
    request.mode,
    request.fingerprint,
  );
  const conflict = resolveNarrativeConflict(repetition.candidates, request.relations);
  const transitions = createNarrativeTransitions(chapters, conflict);
  const base = {
    blocks: repetition.candidates,
    chapters,
    conflict,
    eliminatedBlockIds: repetition.eliminatedIds,
    emotionalCurve: NARRATIVE_EMOTIONAL_CURVE,
    id: narrativeStableId(
      'narrative',
      `${request.fingerprint}:${request.mode}:${narrativeStableId('graph', graphFingerprint)}`,
    ),
    metadata: {
      ...NARRATIVE_VERSIONS,
      graphFingerprint: narrativeStableId('narrative-graph', graphFingerprint),
      sourceFingerprint: request.fingerprint,
    },
    mode: request.mode,
    transitions,
    voice: NARRATIVE_VOICE,
  } as const;
  return { ...base, flow: createFlow(base) };
}
