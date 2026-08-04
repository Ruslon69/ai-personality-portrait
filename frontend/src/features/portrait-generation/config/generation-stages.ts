import type { DraftPortrait, ProfileLocale } from '@entities/personality-profile';

import type { GenerationStage } from '../types';

const copy = {
  en: {
    answers: (count: number) => [
      `Gathering ${count} confirmed choices`,
      `${count} answers are now connected`,
    ],
    answersD: 'Looking for ways your choices reinforce one another.',
    interests: (count: number) => [`Connecting ${count} interests`, `Interests connected`],
    interestsD: 'Giving practical examples a direction that is personal to you.',
    voice: ['Adding the current voice layer', 'Voice layer added'],
    voiceD: 'Keeping only technical context from this optional recording.',
    date: ['Opening the date-based lens', 'Date-based lens ready'],
    dateD: 'Keeping symbolic interpretations separate from observations.',
    patterns: ['Finding repeated ways of acting', 'Recurring patterns connected'],
    patternsD: 'Differences stay visible — context matters too.',
    recommendations: ['Preparing small experiments', 'Small experiments prepared'],
    recommendationsD: 'Linking each next step to a supported observation.',
    mark: ['Assembling your portrait mark', 'Portrait mark assembled'],
    markD: 'Giving this combination its own visual signature.',
  },
  ru: {
    answers: (count: number) => [
      `Собираем ${count} подтверждённых выборов`,
      `${count} ответов соединены`,
    ],
    answersD: 'Ищем, где ваши способы действия усиливают друг друга.',
    interests: (count: number) => [`Связываем ${count} интересов`, `Интересы связаны`],
    interestsD: 'Добавляем личное направление практическим примерам.',
    voice: ['Добавляем слой текущей записи', 'Голосовой слой добавлен'],
    voiceD: 'Оставляем только технический контекст необязательной записи.',
    date: ['Открываем линзу по дате', 'Линза по дате готова'],
    dateD: 'Отделяем символические интерпретации от наблюдений.',
    patterns: ['Собираем повторяющиеся способы действия', 'Повторяющиеся паттерны связаны'],
    patternsD: 'Оставляем различия — контекст тоже важен.',
    recommendations: ['Готовим небольшие эксперименты', 'Эксперименты подготовлены'],
    recommendationsD: 'Связываем каждый следующий шаг с поддержанным наблюдением.',
    mark: ['Собираем ваш знак портрета', 'Знак портрета собран'],
    markD: 'Даём этой комбинации собственную визуальную форму.',
  },
  uk: {
    answers: (count: number) => [
      `Збираємо ${count} підтверджених виборів`,
      `${count} відповідей поєднано`,
    ],
    answersD: 'Шукаємо, де ваші способи дії підсилюють один одного.',
    interests: (count: number) => [`Поєднуємо ${count} інтересів`, `Інтереси поєднано`],
    interestsD: 'Додаємо особистий напрям практичним прикладам.',
    voice: ['Додаємо шар поточного запису', 'Голосовий шар додано'],
    voiceD: 'Залишаємо лише технічний контекст необов’язкового запису.',
    date: ['Відкриваємо лінзу за датою', 'Лінза за датою готова'],
    dateD: 'Відділяємо символічні інтерпретації від спостережень.',
    patterns: ['Збираємо повторювані способи дії', 'Повторювані патерни поєднано'],
    patternsD: 'Залишаємо відмінності — контекст теж важливий.',
    recommendations: ['Готуємо невеликі експерименти', 'Експерименти підготовлено'],
    recommendationsD: 'Пов’язуємо кожен наступний крок із підтриманим спостереженням.',
    mark: ['Збираємо ваш знак портрета', 'Знак портрета зібрано'],
    markD: 'Надаємо цій комбінації власної візуальної форми.',
  },
} as const;

export function createGenerationStages(
  draft: DraftPortrait,
  locale: ProfileLocale,
): readonly GenerationStage[] {
  const text = copy[locale];
  const answerCount = Object.values(draft.answers).filter(
    (answer) => !answer.skipped && answer.optionIds.length,
  ).length;
  const stages: GenerationStage[] = [
    {
      id: 'answers',
      activeTitle: text.answers(answerCount)[0],
      completedTitle: text.answers(answerCount)[1],
      description: text.answersD,
    },
  ];
  if (draft.interests.length)
    stages.push({
      id: 'interests',
      activeTitle: text.interests(draft.interests.length)[0],
      completedTitle: text.interests(draft.interests.length)[1],
      description: text.interestsD,
    });
  if (draft.voice.status === 'included')
    stages.push({
      id: 'voice',
      activeTitle: text.voice[0],
      completedTitle: text.voice[1],
      description: text.voiceD,
    });
  if (draft.birthDate.status === 'included')
    stages.push({
      id: 'date',
      activeTitle: text.date[0],
      completedTitle: text.date[1],
      description: text.dateD,
    });
  stages.push(
    {
      id: 'patterns',
      activeTitle: text.patterns[0],
      completedTitle: text.patterns[1],
      description: text.patternsD,
    },
    {
      id: 'recommendations',
      activeTitle: text.recommendations[0],
      completedTitle: text.recommendations[1],
      description: text.recommendationsD,
    },
    {
      id: 'mark',
      activeTitle: text.mark[0],
      completedTitle: text.mark[1],
      description: text.markD,
    },
  );
  return stages;
}

export const GENERATION_STAGE_DURATION_MS = 560;
export const GENERATION_COMPLETION_DELAY_MS = 420;
