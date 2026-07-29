import type { FullPreviewSection, PreviewObservation, PreviewRecommendation } from '../types';

export const previewObservations: readonly PreviewObservation[] = [
  {
    description:
      'Вам может быть проще двигаться вперёд, когда понятен ближайший шаг, но остаётся свобода изменить маршрут.',
    id: 'pace',
    source: 'Пример по ответам',
    title: 'Свой ритм важнее внешней спешки',
  },
  {
    description:
      'Перед важным решением вам может быть полезно сначала собрать опорные факты, а затем проверить личное ощущение.',
    id: 'decisions',
    source: 'Пример смысловой связи',
    title: 'Решения требуют и ясности, и внутреннего отклика',
  },
  {
    description:
      'Вы можете ценить близость сильнее, когда в отношениях есть место для спокойного диалога и личного пространства.',
    id: 'connection',
    source: 'Пример по ответам',
    title: 'Контакт работает лучше без давления',
  },
] as const;

export const previewRecommendations: readonly PreviewRecommendation[] = [
  {
    description:
      'Перед следующим важным выбором запишите один обязательный критерий и один критерий, которым готовы поступиться.',
    id: 'decision-check',
    title: 'Упростите ближайшее решение',
  },
  {
    description:
      'Если разговор становится напряжённым, назовите сначала то, что вы хотите сохранить в контакте, а затем — что изменить.',
    id: 'conversation',
    title: 'Начните сложный разговор с общей опоры',
  },
] as const;

export const fullPreviewSections: readonly FullPreviewSection[] = [
  {
    description:
      'Потребность в собственном темпе может сочетаться с готовностью к близости: пространство помогает вам возвращаться в разговор собраннее.',
    id: 'connections',
    title: 'Как наблюдения связаны между собой',
  },
  {
    description:
      'Проверьте один из советов в реальной ситуации и отметьте, что оказалось полезным. Обратная связь важнее попытки сразу изменить всё.',
    id: 'next-step',
    title: 'Один следующий шаг',
  },
] as const;
