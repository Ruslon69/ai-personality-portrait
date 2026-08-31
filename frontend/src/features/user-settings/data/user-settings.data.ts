import type { AppearanceOption } from '../types';

export const appearanceOptions: readonly AppearanceOption[] = [
  {
    description: 'Всегда использовать светлое оформление.',
    label: 'Светлая',
    value: 'light',
  },
  {
    description: 'Всегда использовать тёмное оформление.',
    label: 'Тёмная',
    value: 'dark',
  },
  {
    description: 'Следовать настройке устройства.',
    label: 'Системная',
    value: 'system',
  },
] as const;
