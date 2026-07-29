import { useEffect, useRef, useState } from 'react';

import {
  GENERATION_COMPLETION_DELAY_MS,
  GENERATION_STAGE_DURATION_MS,
  generationStages,
} from '../config';
import { getNextGenerationStageIndex } from '../utils';

type UsePortraitGenerationOptions = {
  onComplete: () => void;
};

export function usePortraitGeneration({ onComplete }: UsePortraitGenerationOptions) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const isLastStage = currentStageIndex === generationStages.length - 1;
    const timeout = window.setTimeout(
      () => {
        if (isLastStage) {
          onCompleteRef.current();
          return;
        }

        setCurrentStageIndex((current) =>
          getNextGenerationStageIndex(current, generationStages.length),
        );
      },
      isLastStage ? GENERATION_COMPLETION_DELAY_MS : GENERATION_STAGE_DURATION_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [currentStageIndex]);

  return {
    currentStage: generationStages[currentStageIndex],
    currentStageIndex,
    progressValue: currentStageIndex + 1,
    stages: generationStages,
  };
}
