import { composeNarrative } from '../model';
import type {
  NarrativeComposer,
  NarrativeComposition,
  NarrativeCompositionRequest,
  NarrativeQualityReport,
} from '../types';
import { validateNarrativeComposition } from '../validation';

function qualityFor(composition: Omit<NarrativeComposition, 'quality'>): NarrativeQualityReport {
  const draft = {
    ...composition,
    quality: {
      abruptTransitionCount: 0,
      duplicateAdviceCount: 0,
      duplicateClosingCount: 0,
      emptyChapterCount: 0,
      removedRepetitionCount: composition.eliminatedBlockIds.length,
      valid: true,
    },
  } satisfies NarrativeComposition;
  const validation = validateNarrativeComposition(draft);
  return {
    abruptTransitionCount: validation.errors.filter((item) => item.code === 'abrupt-transition')
      .length,
    duplicateAdviceCount: validation.errors.filter((item) => item.code === 'duplicate-advice')
      .length,
    duplicateClosingCount: validation.errors.filter((item) => item.code === 'duplicate-closing')
      .length,
    emptyChapterCount: validation.errors.filter((item) => item.code === 'empty-chapter').length,
    removedRepetitionCount: composition.eliminatedBlockIds.length,
    valid: validation.valid,
  };
}

export class LocalNarrativeComposer implements NarrativeComposer {
  compose(request: NarrativeCompositionRequest): NarrativeComposition {
    const composition = composeNarrative(request);
    return { ...composition, quality: qualityFor(composition) };
  }

  validate(composition: NarrativeComposition) {
    return validateNarrativeComposition(composition);
  }
}

export const localNarrativeComposer = new LocalNarrativeComposer();
