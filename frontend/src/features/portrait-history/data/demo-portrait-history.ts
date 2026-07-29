import type { PortraitHistoryItem } from '../types';

export const demoPortraitHistory: readonly PortraitHistoryItem[] = [
  {
    access: 'full',
    createdAt: '2026-07-29T10:00:00.000Z',
    id: 'portrait-current',
    keyPhrase: 'Ясная опора без жёсткого сценария',
    modules: ['Ответы', 'Дата рождения', 'Интерпретации'],
    title: 'Текущий портрет',
  },
  {
    access: 'free',
    createdAt: '2026-06-14T16:30:00.000Z',
    id: 'portrait-summer',
    keyPhrase: 'Спокойный темп помогает видеть главное',
    modules: ['Ответы', 'Голос'],
    title: 'Летний взгляд',
  },
  {
    access: 'full',
    createdAt: '2026-03-02T09:15:00.000Z',
    id: 'portrait-first',
    keyPhrase: 'Гибкость становится сильнее рядом с ясными границами',
    modules: ['Ответы', 'Дата рождения'],
    title: 'Первое исследование',
  },
] as const;
