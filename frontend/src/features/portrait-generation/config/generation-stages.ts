import type { GenerationStage } from '../types';

export const generationStages: readonly GenerationStage[] = [
  {
    activeTitle: 'Обрабатываем ответы',
    completedTitle: 'Ответы обработаны',
    description: 'Собираем выбранные варианты в единый контекст.',
    id: 'answers',
  },
  {
    activeTitle: 'Подготавливаем голосовой шаг',
    completedTitle: 'Голосовой шаг подготовлен',
    description: 'Учитываем результат голосового шага — запись или пропуск.',
    id: 'voice',
  },
  {
    activeTitle: 'Собираем портрет',
    completedTitle: 'Портрет собран',
    description: 'Соединяем доступные смысловые слои без домыслов.',
    id: 'portrait',
  },
  {
    activeTitle: 'Формируем рекомендации',
    completedTitle: 'Рекомендации сформированы',
    description: 'Добавляем небольшие и выполнимые следующие шаги.',
    id: 'recommendations',
  },
] as const;

export const GENERATION_STAGE_DURATION_MS = 900;
export const GENERATION_COMPLETION_DELAY_MS = 600;
