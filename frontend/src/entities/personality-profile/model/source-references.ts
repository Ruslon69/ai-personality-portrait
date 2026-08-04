import type { PersonalitySourceId, ProfileLocale, SourceReference } from './personality-profile';

export const personalitySourceReferences: Readonly<Record<PersonalitySourceId, SourceReference>> = {
  answers: {
    category: 'signal',
    id: 'answers',
    label: 'Ответы',
    shortLabel: 'Ответы',
  },
  interests: {
    category: 'signal',
    id: 'interests',
    label: 'Интересы',
    shortLabel: 'Интересы',
  },
  voice: {
    category: 'context',
    id: 'voice',
    label: 'Текущая запись голоса',
    shortLabel: 'Голос',
  },
  'birth-date': {
    category: 'context',
    id: 'birth-date',
    label: 'Дата рождения',
    shortLabel: 'Дата',
  },
  numerology: {
    category: 'interpretation',
    id: 'numerology',
    label: 'Нумерологическая интерпретация',
    shortLabel: 'Нумерология',
  },
  zodiac: {
    category: 'interpretation',
    id: 'zodiac',
    label: 'Зодиакальная интерпретация',
    shortLabel: 'Зодиак',
  },
  astrology: {
    category: 'interpretation',
    id: 'astrology',
    label: 'Астрологическая интерпретация',
    shortLabel: 'Астрология',
  },
};

const localizedLabels: Readonly<
  Record<Exclude<ProfileLocale, 'ru'>, Record<PersonalitySourceId, readonly [string, string]>>
> = {
  en: {
    answers: ['Answers', 'Answers'],
    interests: ['Interests', 'Interests'],
    voice: ['Current voice sample', 'Voice'],
    'birth-date': ['Birth date', 'Date'],
    numerology: ['Numerology interpretation', 'Numerology'],
    zodiac: ['Zodiac interpretation', 'Zodiac'],
    astrology: ['Astrology interpretation', 'Astrology'],
  },
  uk: {
    answers: ['Відповіді', 'Відповіді'],
    interests: ['Інтереси', 'Інтереси'],
    voice: ['Поточний запис голосу', 'Голос'],
    'birth-date': ['Дата народження', 'Дата'],
    numerology: ['Нумерологічна інтерпретація', 'Нумерологія'],
    zodiac: ['Зодіакальна інтерпретація', 'Зодіак'],
    astrology: ['Астрологічна інтерпретація', 'Астрологія'],
  },
};

export function getSourceReference(
  sourceId: PersonalitySourceId,
  locale: ProfileLocale = 'ru',
): SourceReference {
  const source = personalitySourceReferences[sourceId];
  if (locale === 'ru') return source;
  const [label, shortLabel] = localizedLabels[locale][sourceId];
  return { ...source, label, shortLabel };
}

export function getSourceReferences(
  sourceIds: readonly PersonalitySourceId[],
  locale: ProfileLocale = 'ru',
): readonly SourceReference[] {
  return [...new Set(sourceIds)].map((sourceId) => getSourceReference(sourceId, locale));
}
