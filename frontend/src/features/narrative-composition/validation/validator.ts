import {
  NARRATIVE_CHAPTER_ORDER,
  NARRATIVE_EMOTIONAL_CURVE,
  NARRATIVE_VERSIONS,
} from '../constants';
import { narrativeSemanticSignature } from '../repetition';
import type {
  NarrativeComposition,
  NarrativeValidationError,
  NarrativeValidationReport,
} from '../types';
import { stableNarrativeStringify } from '../utils';

function error(
  errors: NarrativeValidationError[],
  code: NarrativeValidationError['code'],
  path: string,
  message: string,
) {
  errors.push({ code, message, path });
}

function duplicates(values: readonly string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function validateNarrativeComposition(
  composition: NarrativeComposition,
): NarrativeValidationReport {
  const errors: NarrativeValidationError[] = [];
  if (
    composition.metadata.composerVersion !== NARRATIVE_VERSIONS.composerVersion ||
    composition.metadata.transitionVersion !== NARRATIVE_VERSIONS.transitionVersion
  )
    error(errors, 'invalid-version', 'metadata', 'Narrative versions are unsupported.');
  if (
    composition.voice.id !== 'authorial-voice-v1' ||
    composition.voice.address !== 'second-person-singular' ||
    composition.voice.cadence !== 'measured' ||
    composition.voice.certainty !== 'uncertainty-aware' ||
    composition.voice.register !== 'calm-modern'
  )
    error(errors, 'invalid-enum', 'voice', 'Narrative voice contract is inconsistent.');
  if (composition.chapters.length !== NARRATIVE_CHAPTER_ORDER.length)
    error(errors, 'incomplete-story', 'chapters', 'Narrative must contain all seven chapters.');
  const blockIds = new Set(composition.blocks.map((block) => block.id));
  const semanticSignatures = composition.blocks.map(narrativeSemanticSignature);
  if (duplicates(semanticSignatures).length)
    error(errors, 'semantic-repetition', 'blocks', 'Narrative contains duplicate semantic ideas.');
  const usedBlockIds = composition.chapters.flatMap((chapter) => chapter.blockIds);
  composition.chapters.forEach((chapter, index) => {
    const path = `chapters.${index}`;
    if (chapter.kind !== NARRATIVE_CHAPTER_ORDER[index] || chapter.ordinal !== index + 1)
      error(errors, 'incomplete-story', path, 'Chapter order is invalid.');
    if (!chapter.blockIds.length)
      error(errors, 'empty-chapter', `${path}.blockIds`, 'Narrative chapter cannot be empty.');
    if (chapter.emotionalPhase !== NARRATIVE_EMOTIONAL_CURVE[index])
      error(errors, 'invalid-curve', `${path}.emotionalPhase`, 'Emotional phase is invalid.');
    chapter.blockIds.forEach((id) => {
      if (!blockIds.has(id))
        error(errors, 'broken-reference', `${path}.blockIds`, `Unknown narrative block ${id}.`);
    });
  });
  if (duplicates(usedBlockIds).length)
    error(
      errors,
      'semantic-repetition',
      'chapters',
      'A semantic block is repeated across chapters.',
    );
  const duplicateIds = duplicates([
    ...composition.blocks.map((block) => block.id),
    ...composition.chapters.map((chapter) => chapter.id),
    ...composition.transitions.map((transition) => transition.id),
  ]);
  if (duplicateIds.length)
    error(errors, 'duplicate-id', '$', `Duplicate narrative id: ${duplicateIds[0]}.`);
  if (composition.transitions.length !== composition.chapters.length - 1)
    error(errors, 'abrupt-transition', 'transitions', 'Every adjacent chapter needs a transition.');
  composition.transitions.forEach((transition, index) => {
    if (
      transition.fromChapterId !== composition.chapters[index]?.id ||
      transition.toChapterId !== composition.chapters[index + 1]?.id
    )
      error(errors, 'abrupt-transition', `transitions.${index}`, 'Transition skips a chapter.');
    const expectedKind =
      index === 2 && composition.conflict
        ? 'contrast'
        : (
            ['continuation', 'deepening', 'shift', 'consequence', 'question', 'completion'] as const
          )[index];
    if (transition.kind !== expectedKind)
      error(
        errors,
        'abrupt-transition',
        `transitions.${index}.kind`,
        'Transition does not match the semantic story flow.',
      );
  });
  let tensionalStreak = 0;
  composition.chapters.forEach((chapter, index) => {
    const isTensional = chapter.blockIds.every(
      (id) => composition.blocks.find((block) => block.id === id)?.polarity === 'tensional',
    );
    tensionalStreak = isTensional ? tensionalStreak + 1 : 0;
    if (tensionalStreak > 2)
      error(
        errors,
        'invalid-pacing',
        `chapters.${index}`,
        'Too many consecutive tension beats make the pacing abrupt.',
      );
  });
  const practicalBlocks = composition.chapters
    .find((chapter) => chapter.kind === 'practical-direction')
    ?.blockIds.filter((id) =>
      composition.blocks.find((block) => block.id === id)?.roles.includes('practical'),
    );
  if ((practicalBlocks?.length ?? 0) !== 1)
    error(
      errors,
      'duplicate-advice',
      'chapters.practical-direction',
      'Narrative requires one practical direction.',
    );
  const closing = composition.chapters.find((chapter) => chapter.kind === 'closing-thought');
  if (closing?.blockIds.length !== 1)
    error(
      errors,
      'duplicate-closing',
      'chapters.closing-thought',
      'Narrative requires one closing thought.',
    );
  const reflection = composition.chapters.find((chapter) => chapter.kind === 'reflection');
  if (reflection?.blockIds.length !== 1)
    error(
      errors,
      'invalid-pacing',
      'chapters.reflection',
      'Narrative requires one reflection beat.',
    );
  if (!composition.quality.valid)
    error(errors, 'invalid-pacing', 'quality.valid', 'Narrative quality report is not valid.');
  if (
    !blockIds.has(composition.flow.leadingBlockId) ||
    !blockIds.has(composition.flow.closingBlockId) ||
    (composition.conflict && !blockIds.has(composition.conflict.resolutionBlockId))
  )
    error(errors, 'broken-reference', 'flow', 'Narrative flow references an unknown block.');
  try {
    const serialized = stableNarrativeStringify(composition);
    if (stableNarrativeStringify(JSON.parse(serialized)) !== serialized)
      error(errors, 'non-serializable', '$', 'Narrative JSON round-trip is unstable.');
  } catch (caught) {
    error(
      errors,
      'non-serializable',
      '$',
      caught instanceof Error ? caught.message : 'Narrative is not serializable.',
    );
  }
  return { errors, valid: errors.length === 0 };
}
