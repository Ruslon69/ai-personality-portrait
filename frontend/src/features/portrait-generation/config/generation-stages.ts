import type { DraftPortrait, ProfileLocale } from '@entities/personality-profile';

import type { GenerationStage } from '../types';

const copy = {
  es: {
    answers: (count: number) => [
      `Conectando tus respuestas (${count})`,
      `Respuestas conectadas (${count})`,
    ],
    answersD: 'Buscamos cómo se refuerzan entre sí tus elecciones.',
    interests: (count: number) => [`Añadiendo tus intereses (${count})`, 'Intereses conectados'],
    interestsD: 'Elegimos ejemplos relacionados con tus intereses.',
    voice: ['Añadiendo la muestra de voz actual', 'Muestra de voz añadida'],
    voiceD: 'Conservamos solo el contexto técnico de esta grabación opcional.',
    date: ['Añadiendo lecturas por tu fecha', 'Lecturas por fecha listas'],
    dateD: 'Separamos las lecturas simbólicas de las observaciones basadas en tus respuestas.',
    patterns: ['Buscando formas de actuar que se repiten', 'Elecciones recurrentes conectadas'],
    patternsD: 'Las diferencias siguen visibles: el contexto también importa.',
    recommendations: ['Preparando pequeños experimentos', 'Pequeños experimentos preparados'],
    recommendationsD: 'Vinculamos cada paso con una observación respaldada por tus respuestas.',
    mark: ['Componiendo el símbolo de tu retrato', 'Símbolo del retrato listo'],
    markD: 'Damos a esta combinación su propia identidad visual.',
  },
  en: {
    answers: (count: number) => [
      `Connecting your answers (${count})`,
      `Answers connected (${count})`,
    ],
    answersD: 'Looking for ways your choices reinforce one another.',
    interests: (count: number) => [`Adding your interests (${count})`, `Interests connected`],
    interestsD: 'Choosing examples that relate to your interests.',
    voice: ['Adding the current voice sample', 'Voice sample added'],
    voiceD: 'Keeping only technical context from this optional recording.',
    date: ['Adding birth-date insights', 'Birth-date insights ready'],
    dateD: 'Keeping symbolic readings separate from observations based on your answers.',
    patterns: ['Finding repeated ways of acting', 'Repeated choices connected'],
    patternsD: 'Differences stay visible — context matters too.',
    recommendations: ['Preparing small experiments', 'Small experiments prepared'],
    recommendationsD: 'Linking each next step to a supported observation.',
    mark: ['Assembling your portrait mark', 'Portrait mark assembled'],
    markD: 'Giving this combination its own visual signature.',
  },
  ru: {
    answers: (count: number) => [
      `Сопоставляем ответы (${count})`,
      `Ответы сопоставлены (${count})`,
    ],
    answersD: 'Ищем, где ваши способы действия усиливают друг друга.',
    interests: (count: number) => [`Добавляем интересы (${count})`, `Интересы связаны`],
    interestsD: 'Добавляем личное направление практическим примерам.',
    voice: ['Добавляем текущую запись', 'Запись добавлена'],
    voiceD: 'Оставляем только технический контекст необязательной записи.',
    date: ['Добавляем разбор по дате', 'Разбор по дате готов'],
    dateD: 'Отделяем символические разборы от наблюдений по вашим ответам.',
    patterns: ['Ищем повторяющиеся способы действия', 'Повторяющиеся ответы сопоставлены'],
    patternsD: 'Оставляем различия — контекст тоже важен.',
    recommendations: ['Готовим небольшие эксперименты', 'Эксперименты подготовлены'],
    recommendationsD: 'Связываем небольшие шаги с наблюдениями по вашим ответам.',
    mark: ['Собираем ваш знак портрета', 'Знак портрета собран'],
    markD: 'Даём этой комбинации собственную визуальную форму.',
  },
  uk: {
    answers: (count: number) => [
      `Зіставляємо відповіді (${count})`,
      `Відповіді зіставлено (${count})`,
    ],
    answersD: 'Шукаємо, де ваші способи дії підсилюють один одного.',
    interests: (count: number) => [`Додаємо інтереси (${count})`, `Інтереси поєднано`],
    interestsD: 'Додаємо особистий напрям практичним прикладам.',
    voice: ['Додаємо поточний запис', 'Запис додано'],
    voiceD: 'Залишаємо лише технічний контекст необов’язкового запису.',
    date: ['Додаємо розбір за датою', 'Розбір за датою готовий'],
    dateD: 'Відділяємо символічні розбори від спостережень за вашими відповідями.',
    patterns: ['Шукаємо повторювані способи дії', 'Повторювані відповіді зіставлено'],
    patternsD: 'Залишаємо відмінності — контекст теж важливий.',
    recommendations: ['Готуємо невеликі експерименти', 'Експерименти підготовлено'],
    recommendationsD: 'Пов’язуємо невеликі кроки зі спостереженнями за вашими відповідями.',
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
