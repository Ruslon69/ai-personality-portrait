import type { GenerationStageStatus } from '../types';

export function getGenerationStageStatus(
  stageIndex: number,
  currentStageIndex: number,
): GenerationStageStatus {
  if (stageIndex < currentStageIndex) {
    return 'complete';
  }

  if (stageIndex === currentStageIndex) {
    return 'current';
  }

  return 'pending';
}

export function getNextGenerationStageIndex(currentStageIndex: number, stageCount: number) {
  return Math.min(currentStageIndex + 1, Math.max(0, stageCount - 1));
}
