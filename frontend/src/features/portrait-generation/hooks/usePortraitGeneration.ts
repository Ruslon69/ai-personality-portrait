import { useEffect, useRef, useState } from 'react';

import { GENERATION_COMPLETION_DELAY_MS, GENERATION_STAGE_DURATION_MS } from '../config';
import { getNextGenerationStageIndex } from '../utils';

type UsePortraitGenerationOptions = {
  onComplete: () => void;
  stages: readonly import('../types').GenerationStage[];
};

export function usePortraitGeneration({ onComplete, stages }: UsePortraitGenerationOptions) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const isLastStage = currentStageIndex === stages.length - 1;
    const timeout = window.setTimeout(
      () => {
        if (isLastStage) {
          onCompleteRef.current();
          return;
        }

        setCurrentStageIndex((current) => getNextGenerationStageIndex(current, stages.length));
      },
      isLastStage ? GENERATION_COMPLETION_DELAY_MS : GENERATION_STAGE_DURATION_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [currentStageIndex, stages.length]);

  return {
    currentStage: stages[currentStageIndex],
    currentStageIndex,
    progressValue: currentStageIndex + 1,
    stages,
  };
}
