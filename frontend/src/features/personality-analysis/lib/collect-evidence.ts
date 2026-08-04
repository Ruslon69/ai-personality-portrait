import type {
  DraftPortrait,
  Evidence,
  PersonalitySourceId,
  ProfileLocale,
} from '@entities/personality-profile';

import { answerRules } from '../data';
import type { CollectedEvidence } from '../model';

const contextLabels: Readonly<Record<string, Record<ProfileLocale, string>>> = {
  disagreement: { en: 'a disagreement', ru: 'недопонимании', uk: 'непорозумінні' },
  'feedback-style': { en: 'feedback', ru: 'обратной связи', uk: 'зворотному зв’язку' },
  'free-evening': { en: 'unplanned free time', ru: 'свободном времени', uk: 'вільному часі' },
  'group-roles': { en: 'working with others', ru: 'совместной работе', uk: 'спільній роботі' },
  'important-decision': {
    en: 'an important decision',
    ru: 'важном решении',
    uk: 'важливому рішенні',
  },
  'long-project-motivation': {
    en: 'a long project',
    ru: 'долгом проекте',
    uk: 'тривалому проєкті',
  },
  'new-environment': { en: 'a new environment', ru: 'новой обстановке', uk: 'новому середовищі' },
  'new-topic': { en: 'a new subject', ru: 'новой теме', uk: 'новій темі' },
  'personal-boundaries': {
    en: 'personal boundaries',
    ru: 'личных границах',
    uk: 'особистих межах',
  },
  'plans-change': { en: 'a change of plans', ru: 'изменении планов', uk: 'зміні планів' },
  'recovery-after-busy-day': { en: 'recovery', ru: 'восстановлении', uk: 'відновленні' },
  'support-style': { en: 'support', ru: 'поддержке', uk: 'підтримці' },
  'time-pressure': { en: 'time pressure', ru: 'давлении времени', uk: 'тиску часу' },
  'unclear-request': { en: 'an unclear task', ru: 'неясной задаче', uk: 'неясному завданні' },
  'unfinished-project': {
    en: 'finishing a project',
    ru: 'завершении дела',
    uk: 'завершенні справи',
  },
  'work-rhythm': { en: 'work rhythm', ru: 'рабочем ритме', uk: 'робочому ритмі' },
};

export type EvidenceCollection = {
  context: readonly Evidence[];
  traitEvidence: readonly CollectedEvidence[];
};

function createContextEvidence(
  id: string,
  source: PersonalitySourceId,
  title: string,
  description: string,
): Evidence {
  return { description, id, source, title };
}

export function collectEvidence(
  draft: DraftPortrait,
  locale: ProfileLocale = 'ru',
): EvidenceCollection {
  const traitEvidence: CollectedEvidence[] = [];
  const context: Evidence[] = [];

  Object.entries(draft.answers)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([questionId, response]) => {
      if (response.skipped) return;
      [...response.optionIds].sort().forEach((optionId) => {
        const rule = answerRules[`${questionId}:${optionId}`];
        if (!rule) return;
        const contextLabel = contextLabels[questionId]?.[locale];
        traitEvidence.push({
          description:
            locale === 'ru'
              ? rule.description
              : locale === 'en'
                ? `Your choice about ${contextLabel ?? 'this everyday situation'} supports this theme.`
                : `Ваш вибір у контексті «${contextLabel ?? 'повсякденна ситуація'}» підтримує цю тему.`,
          id: `answer:${questionId}:${optionId}`,
          source: 'answers',
          title:
            locale === 'ru'
              ? rule.title
              : locale === 'en'
                ? `Choice about ${contextLabel ?? 'an everyday situation'}`
                : `Вибір про ${contextLabel ?? 'повсякденну ситуацію'}`,
          traits: rule.traits,
          weight: rule.weight ?? 1,
        });
      });
    });

  draft.interests.forEach((interestId) => {
    context.push({
      description:
        locale === 'en'
          ? 'This interest was selected voluntarily and is used only to personalize examples.'
          : locale === 'uk'
            ? 'Цей інтерес обрано добровільно й використано лише для персоналізації прикладів.'
            : `Этот интерес выбран добровольно: «${interestId.replace('other:', '')}».`,
      id: `interest:${interestId}`,
      source: 'interests',
      title:
        locale === 'en'
          ? 'Selected interest'
          : locale === 'uk'
            ? 'Обраний інтерес'
            : 'Выбранный интерес',
    });
  });

  if (draft.voice.status === 'included') {
    const seconds = Math.round(draft.voice.durationMs / 1000);
    context.push(
      createContextEvidence(
        'voice:technical-context',
        'voice',
        locale === 'en'
          ? 'Current voice sample'
          : locale === 'uk'
            ? 'Поточний голосовий запис'
            : 'Текущая голосовая запись',
        locale === 'en'
          ? `A local ${seconds}-second recording passed technical validation. No personality inference is made from it.`
          : locale === 'uk'
            ? `Локальний запис тривалістю ${seconds} секунд пройшов технічну перевірку. Висновки про особистість із нього не робляться.`
            : `Локальная запись длительностью ${seconds} секунд прошла техническую проверку. По ней не делаются выводы о личности.`,
      ),
    );
  }

  if (draft.birthDate.status === 'included') {
    context.push(
      createContextEvidence(
        'birth-date:provided',
        'birth-date',
        locale === 'en'
          ? 'Birth date added'
          : locale === 'uk'
            ? 'Дату народження додано'
            : 'Дата рождения добавлена',
        locale === 'en'
          ? 'The date is used only for optional interpretation layers.'
          : locale === 'uk'
            ? 'Дата використовується лише для добровільних інтерпретаційних шарів.'
            : 'Дата используется только для добровольно выбранных интерпретационных слоёв.',
      ),
    );
  }

  return { context, traitEvidence };
}
