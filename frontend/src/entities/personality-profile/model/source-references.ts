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
    label: 'Разбор по числам',
    shortLabel: 'Нумерология',
  },
  zodiac: {
    category: 'interpretation',
    id: 'zodiac',
    label: 'Разбор по знаку зодиака',
    shortLabel: 'Зодиак',
  },
  astrology: {
    category: 'interpretation',
    id: 'astrology',
    label: 'Астрологический разбор',
    shortLabel: 'Астрология',
  },
};

const localizedLabels: Readonly<
  Record<Exclude<ProfileLocale, 'ru'>, Record<PersonalitySourceId, readonly [string, string]>>
> = {
  es: {
    answers: ['Respuestas', 'Respuestas'],
    interests: ['Intereses', 'Intereses'],
    voice: ['Muestra de voz actual', 'Voz'],
    'birth-date': ['Fecha de nacimiento', 'Fecha'],
    numerology: ['Lectura de los números', 'Numerología'],
    zodiac: ['Lectura del signo del zodiaco', 'Zodiaco'],
    astrology: ['Lectura astrológica', 'Astrología'],
  },
  en: {
    answers: ['Answers', 'Answers'],
    interests: ['Interests', 'Interests'],
    voice: ['Current voice sample', 'Voice'],
    'birth-date': ['Birth date', 'Date'],
    numerology: ['Reading by numbers', 'Numerology'],
    zodiac: ['Zodiac sign reading', 'Zodiac'],
    astrology: ['Astrology reading', 'Astrology'],
  },
  uk: {
    answers: ['Відповіді', 'Відповіді'],
    interests: ['Інтереси', 'Інтереси'],
    voice: ['Поточний запис голосу', 'Голос'],
    'birth-date': ['Дата народження', 'Дата'],
    numerology: ['Розбір за числами', 'Нумерологія'],
    zodiac: ['Розбір за знаком зодіаку', 'Зодіак'],
    astrology: ['Астрологічний розбір', 'Астрологія'],
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
