import type {
  DraftPortrait,
  Evidence,
  Insight,
  PersonalityProfile,
  PersonalityProfileSource,
  ProfileLocale,
  ProfileCompletionItem,
} from '@entities/personality-profile';
import { getSourceReference } from '@entities/personality-profile';

import { getInterestLabel, getTraitTemplate } from '../data';
import { collectEvidence } from './collect-evidence';
import {
  createContextualContrasts,
  createHeroPhrase,
  createPortraitVisualIdentity,
  createPortraitFacets,
  createRevealCopy,
} from './pattern-composition';
import {
  createAstrologyInterpretation,
  createNumerologyInterpretation,
  createZodiacInterpretation,
} from './interpretations';
import { runRuleEngine } from './rule-engine';

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function serializeDraft(draft: DraftPortrait) {
  const answers = Object.entries(draft.answers)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([questionId, response]) => [
      questionId,
      { optionIds: [...response.optionIds].sort(), skipped: response.skipped },
    ]);

  return JSON.stringify({
    answers,
    birthDate: draft.birthDate,
    interests: [...draft.interests].sort(),
    interpretationLayers: draft.interpretationLayers,
    voice:
      draft.voice.status === 'included'
        ? {
            durationMs: draft.voice.durationMs,
            mimeType: draft.voice.mimeType,
            status: draft.voice.status,
          }
        : draft.voice,
  });
}

function createInterpretations(draft: DraftPortrait, locale: ProfileLocale): readonly Insight[] {
  if (draft.birthDate.status !== 'included') {
    return [];
  }

  const insights: Insight[] = [];

  if (draft.interpretationLayers.numerology) {
    insights.push(createNumerologyInterpretation(draft.birthDate.value, locale));
  }
  if (draft.interpretationLayers.zodiac) {
    insights.push(createZodiacInterpretation(draft.birthDate.value, locale));
  }
  if (draft.interpretationLayers.astrology) {
    insights.push(createAstrologyInterpretation(draft.birthDate.value, locale));
  }

  return insights;
}

function createCompletion(
  draft: DraftPortrait,
  locale: ProfileLocale,
): readonly ProfileCompletionItem[] {
  const answeredCount = Object.values(draft.answers).filter(
    (answer) => !answer.skipped && answer.optionIds.length > 0,
  ).length;

  const copy = {
    en: {
      answers: 'Answers',
      answersCount: (count: number) => `${count} confirmed answers.`,
      answersEmpty: 'No answers added yet.',
      voice: 'Voice',
      voiceIncluded: 'Technical metadata from this recording was included without storing audio.',
      voiceSkipped: 'The optional voice layer was skipped.',
      birth: 'Birth date',
      birthIncluded: 'Used only for the selected interpretation layers.',
      birthSkipped: 'Birth date was not used.',
      interests: 'Interests',
      interestsCount: (count: number) => `${count} selected interests.`,
      interestsEmpty: 'No interests were added.',
    },
    ru: {
      answers: 'Ответы',
      answersCount: (count: number) => `Подтверждённых ответов: ${count}.`,
      answersEmpty: 'Ответы пока не добавлены.',
      voice: 'Голос',
      voiceIncluded: 'Технические метаданные текущей записи учтены без сохранения аудио.',
      voiceSkipped: 'Необязательный голосовой слой пропущен.',
      birth: 'Дата рождения',
      birthIncluded: 'Использована только для выбранных интерпретационных слоёв.',
      birthSkipped: 'Дата рождения не использовалась.',
      interests: 'Интересы',
      interestsCount: (count: number) => `Добавлено интересов: ${count}.`,
      interestsEmpty: 'Интересы не были добавлены.',
    },
    uk: {
      answers: 'Відповіді',
      answersCount: (count: number) => `Підтверджених відповідей: ${count}.`,
      answersEmpty: 'Відповіді ще не додано.',
      voice: 'Голос',
      voiceIncluded: 'Технічні метадані поточного запису враховано без збереження аудіо.',
      voiceSkipped: 'Необов’язковий голосовий шар пропущено.',
      birth: 'Дата народження',
      birthIncluded: 'Використано лише для обраних інтерпретаційних шарів.',
      birthSkipped: 'Дату народження не використано.',
      interests: 'Інтереси',
      interestsCount: (count: number) => `Додано інтересів: ${count}.`,
      interestsEmpty: 'Інтереси не додано.',
    },
  }[locale];
  return [
    {
      description: answeredCount > 0 ? copy.answersCount(answeredCount) : copy.answersEmpty,
      id: 'answers',
      label: copy.answers,
      status: answeredCount > 0 ? 'complete' : 'missing',
    },
    {
      description: draft.voice.status === 'included' ? copy.voiceIncluded : copy.voiceSkipped,
      id: 'voice',
      label: copy.voice,
      status: draft.voice.status === 'included' ? 'complete' : 'skipped',
    },
    {
      description: draft.birthDate.status === 'included' ? copy.birthIncluded : copy.birthSkipped,
      id: 'birth-date',
      label: copy.birth,
      status: draft.birthDate.status === 'included' ? 'complete' : 'skipped',
    },
    {
      description:
        draft.interests.length > 0
          ? copy.interestsCount(draft.interests.length)
          : copy.interestsEmpty,
      id: 'interests',
      label: copy.interests,
      status: draft.interests.length > 0 ? 'complete' : 'missing',
    },
  ];
}

function createSourceDetails(
  draft: DraftPortrait,
  locale: ProfileLocale,
): readonly PersonalityProfileSource[] {
  const answeredCount = Object.values(draft.answers).filter(
    (answer) => !answer.skipped && answer.optionIds.length > 0,
  ).length;
  const copy = {
    en: {
      answers: (count: number) => `${count} confirmed answers were included.`,
      answersDetails:
        'Answer choices reveal repeated preferences in described situations, but do not prove fixed traits.',
      voiceIncluded: 'A technically usable current recording was present.',
      voiceSkipped: 'The voice step was skipped.',
      voiceDetails:
        'Audio is not stored in the profile. Recording metadata is not used for identification, diagnosis or personality inference.',
      birthIncluded: 'The date was used only in selected interpretations.',
      birthSkipped: 'Birth date was not used.',
      birthDetails:
        'Birth date does not increase confidence in answer-based observations and is not used for predictions.',
      interests: (count: number) =>
        count ? `${count} selected interests were included.` : 'No interests were added.',
      interestsDetails:
        'Only interests chosen by the user are included; the system does not infer them.',
      interpretation: 'Added as a separate optional interpretation.',
      interpretationDetails:
        'This layer is for entertainment and self-reflection. It is not a scientific conclusion and does not confirm psychological observations.',
    },
    ru: {
      answers: (count: number) => `Учтено подтверждённых ответов: ${count}.`,
      answersDetails:
        'Готовые варианты позволяют находить повторяющиеся предпочтения в описанных ситуациях, но не доказывают неизменные черты.',
      voiceIncluded: 'Учтён факт технически пригодной текущей записи.',
      voiceSkipped: 'Голосовой шаг пропущен.',
      voiceDetails:
        'Аудио не хранится в профиле. Технические метаданные записи не используются для идентификации, диагностики или определения личности.',
      birthIncluded: 'Дата использована только в выбранных интерпретациях.',
      birthSkipped: 'Дата рождения не использовалась.',
      birthDetails:
        'Дата рождения не повышает уверенность наблюдений по ответам и не используется для предсказаний.',
      interests: (count: number) =>
        count ? `Учтено выбранных интересов: ${count}.` : 'Интересы не были добавлены.',
      interestsDetails:
        'Учитываются только интересы, которые пользователь выбрал самостоятельно. Система не пытается вывести их из других данных.',
      interpretation: 'Добавлен как отдельная добровольная интерпретация.',
      interpretationDetails:
        'Этот слой предназначен для развлечения и саморефлексии. Он не является научным выводом и не подтверждает психологические наблюдения.',
    },
    uk: {
      answers: (count: number) => `Враховано підтверджених відповідей: ${count}.`,
      answersDetails:
        'Варіанти відповідей допомагають знаходити повторювані вподобання в описаних ситуаціях, але не доводять незмінні риси.',
      voiceIncluded: 'Враховано наявність технічно придатного поточного запису.',
      voiceSkipped: 'Голосовий крок пропущено.',
      voiceDetails:
        'Аудіо не зберігається у профілі. Метадані запису не використовуються для ідентифікації, діагностики чи визначення особистості.',
      birthIncluded: 'Дату використано лише в обраних інтерпретаціях.',
      birthSkipped: 'Дату народження не використано.',
      birthDetails:
        'Дата народження не підвищує впевненість спостережень із відповідей і не використовується для передбачень.',
      interests: (count: number) =>
        count ? `Враховано обраних інтересів: ${count}.` : 'Інтереси не додано.',
      interestsDetails:
        'Враховуються лише інтереси, які користувач обрав самостійно; система не намагається їх вивести.',
      interpretation: 'Додано як окрему добровільну інтерпретацію.',
      interpretationDetails:
        'Цей шар призначений для розваги й саморефлексії. Він не є науковим висновком і не підтверджує психологічні спостереження.',
    },
  }[locale];
  const sources: PersonalityProfileSource[] = [
    {
      ...getSourceReference('answers', locale),
      description: copy.answers(answeredCount),
      details: copy.answersDetails,
      status: answeredCount > 0 ? 'included' : 'omitted',
    },
    {
      ...getSourceReference('voice', locale),
      description: draft.voice.status === 'included' ? copy.voiceIncluded : copy.voiceSkipped,
      details: copy.voiceDetails,
      status: draft.voice.status === 'included' ? 'included' : 'omitted',
    },
    {
      ...getSourceReference('birth-date', locale),
      description: draft.birthDate.status === 'included' ? copy.birthIncluded : copy.birthSkipped,
      details: copy.birthDetails,
      status: draft.birthDate.status === 'included' ? 'included' : 'omitted',
    },
    {
      ...getSourceReference('interests', locale),
      description: copy.interests(draft.interests.length),
      details: copy.interestsDetails,
      status: draft.interests.length > 0 ? 'included' : 'omitted',
    },
  ];

  const interpretationSources = [
    {
      enabled: draft.interpretationLayers.numerology && draft.birthDate.status === 'included',
      id: 'numerology' as const,
    },
    {
      enabled: draft.interpretationLayers.zodiac && draft.birthDate.status === 'included',
      id: 'zodiac' as const,
    },
    {
      enabled: draft.interpretationLayers.astrology && draft.birthDate.status === 'included',
      id: 'astrology' as const,
    },
  ];

  interpretationSources.forEach((source) => {
    if (!source.enabled) {
      return;
    }

    sources.push({
      ...getSourceReference(source.id, locale),
      description: copy.interpretation,
      details: copy.interpretationDetails,
      status: 'interpretation',
    });
  });

  return sources;
}

export function createPersonalityProfile(
  draft: DraftPortrait,
  createdAt: string,
  locale: ProfileLocale = 'ru',
): PersonalityProfile {
  const { context, traitEvidence } = collectEvidence(draft, locale);
  const ruleResult = runRuleEngine(traitEvidence, { interests: draft.interests, locale });
  const interpretations = createInterpretations(draft, locale);
  const answerAndInterestEvidence = traitEvidence.map(
    ({ description, id, source, title }): Evidence => ({
      description,
      id,
      source,
      title,
    }),
  );
  const profileId = `portrait-${stableHash(serializeDraft(draft))}`;
  const insightsByTrait = new Map(
    [
      ...ruleResult.strengths,
      ...ruleResult.growthAreas,
      ...ruleResult.communication,
      ...ruleResult.energy,
      ruleResult.overview,
    ].flatMap((insight) => insight.traitIds.map((traitId) => [traitId, insight] as const)),
  );
  const compositionInput = {
    hasInterpretations: interpretations.length > 0,
    insightsByTrait,
    interests: draft.interests,
    locale,
    ranked: ruleResult.rankedTraits,
    sourceCount: [
      Object.keys(draft.answers).length > 0,
      draft.interests.length > 0,
      draft.voice.status === 'included',
      draft.birthDate.status === 'included',
      interpretations.length > 0,
    ].filter(Boolean).length,
  };
  const contrasts = createContextualContrasts(compositionInput);
  const revealCopy = createRevealCopy(compositionInput, contrasts.length > 0);
  const copy = {
    en: {
      communicationDescription: 'How pace, clarity and connection may shape your conversations.',
      communicationTitle: 'How dialogue may work best for you',
      energyDescription: 'Conditions for recovery that you can test in everyday life.',
      energyTitle: 'What may restore clarity and energy',
      greeting: 'Your personal portrait',
      introduction:
        'A connected portrait built from your answers and optional layers. Treat it as a set of hypotheses, not a diagnosis or a fixed identity.',
      title: 'Personal portrait',
    },
    ru: {
      communicationDescription: 'Как темп, ясность и контакт могут влиять на ваши разговоры.',
      communicationTitle: 'Как вам может быть удобнее вести диалог',
      energyDescription: 'Условия восстановления, которые можно проверить в собственной жизни.',
      energyTitle: 'Что может возвращать ясность и силы',
      greeting: 'Ваш персональный портрет',
      introduction:
        'Связная картина собрана из ваших ответов и добровольных слоёв. Это гипотезы для саморефлексии, а не диагноз или окончательное определение личности.',
      title: 'Персональный портрет',
    },
    uk: {
      communicationDescription: 'Як темп, ясність і контакт можуть впливати на ваші розмови.',
      communicationTitle: 'Як вам може бути зручніше вести діалог',
      energyDescription: 'Умови відновлення, які можна перевірити у власному житті.',
      energyTitle: 'Що може повертати ясність і сили',
      greeting: 'Ваш персональний портрет',
      introduction:
        'Зв’язна картина зібрана з ваших відповідей і добровільних шарів. Це гіпотези для рефлексії, а не діагноз чи остаточне визначення особистості.',
      title: 'Персональний портрет',
    },
  }[locale];

  return {
    access: 'full',
    communication: {
      description: copy.communicationDescription,
      eyebrow:
        locale === 'en'
          ? 'Communication style'
          : locale === 'uk'
            ? 'Стиль спілкування'
            : 'Стиль общения',
      id: 'communication',
      items: ruleResult.communication,
      title: copy.communicationTitle,
    },
    completion: createCompletion(draft, locale),
    createdAt,
    contrasts,
    energy: {
      description: copy.energyDescription,
      eyebrow:
        locale === 'en'
          ? 'Energy and recovery'
          : locale === 'uk'
            ? 'Енергія та відновлення'
            : 'Энергия и восстановление',
      id: 'energy',
      items: ruleResult.energy,
      title: copy.energyTitle,
    },
    evidence: [
      ...answerAndInterestEvidence,
      ...context,
      ...interpretations.flatMap((insight) => insight.evidence),
    ],
    greeting: copy.greeting,
    growthAreas: ruleResult.growthAreas,
    heroPhrase: createHeroPhrase(compositionInput),
    id: profileId,
    interpretations,
    introduction: copy.introduction,
    keyTraits: ruleResult.rankedTraits
      .slice(0, 3)
      .map((trait) => getTraitTemplate(trait.id, locale).label),
    locale,
    overview: ruleResult.overview,
    portraitFacets: createPortraitFacets(compositionInput),
    primaryInterest: draft.interests[0] ? getInterestLabel(draft.interests[0], locale) : undefined,
    recommendations: ruleResult.recommendations,
    revealHeadline: revealCopy.headline,
    revealLead: revealCopy.lead,
    sourceDetails: createSourceDetails(draft, locale),
    strengths: ruleResult.strengths,
    title: copy.title,
    visualIdentity: createPortraitVisualIdentity(profileId, compositionInput),
  };
}

export function canCreatePersonalityProfile(draft: DraftPortrait) {
  return collectEvidence(draft).traitEvidence.length > 0;
}
