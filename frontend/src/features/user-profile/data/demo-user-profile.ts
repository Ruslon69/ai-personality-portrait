import type { UserProfileData } from '../types';

export const demoUserProfile: UserProfileData = {
  completion: [
    {
      description: 'Короткий психологический опрос завершён.',
      id: 'answers',
      label: 'Ответы',
      status: 'complete',
    },
    {
      description: 'Этот необязательный слой можно добавить в новом портрете.',
      id: 'voice',
      label: 'Голос',
      status: 'skipped',
    },
    {
      description: 'Использована для отдельных интерпретационных блоков.',
      id: 'birth-date',
      label: 'Дата рождения',
      status: 'complete',
    },
    {
      description: 'Интересы пока не добавлены в локальную демонстрацию.',
      id: 'interests',
      label: 'Интересы',
      status: 'missing',
    },
  ],
  greeting: 'Ваше пространство',
  introduction:
    'Здесь собраны последний портрет, использованные источники и короткие пути к основным действиям.',
  latestPortrait: {
    createdAt: '2026-07-29T10:00:00.000Z',
    id: 'portrait-current',
    keyPhrase: 'Ясная опора без жёсткого сценария',
    sources: [
      { id: 'answers', label: 'Ответы' },
      { id: 'birth-date', label: 'Дата рождения' },
      { id: 'interpretations', label: 'Интерпретации' },
    ],
  },
  privacyReminder:
    'Вы управляете сохранёнными портретами и данными. Настройки удаления и приватности всегда доступны отдельно.',
};
