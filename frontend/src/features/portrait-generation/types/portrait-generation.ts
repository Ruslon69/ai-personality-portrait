export type GenerationStage = {
  activeTitle: string;
  completedTitle: string;
  description: string;
  id: string;
};

export type GenerationStageStatus = 'complete' | 'current' | 'pending';
