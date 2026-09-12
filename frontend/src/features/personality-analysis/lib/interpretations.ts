import type {
  Evidence,
  Insight,
  PersonalitySourceId,
  ProfileLocale,
} from '@entities/personality-profile';
import { createZodiacProfile, reduceNumerology } from '@features/numerology';
import {
  createConfidenceExplanation,
  createEvidenceGroups,
  createSourceReferences,
} from './explainability';

const zodiacNotes: Readonly<Record<string, string>> = {
  capricorn: 'последовательность, ответственность и движение к выбранной цели',
  aquarius: 'независимый взгляд, новые идеи и интерес к необычным связям',
  pisces: 'восприимчивость, воображение и внимание к тонким переживаниям',
  aries: 'готовность действовать прямо и начинать новое',
  taurus: 'устойчивость, внимание к ощущениям и потребность в надёжной опоре',
  gemini: 'любопытство, обмен идеями и лёгкое переключение внимания',
  cancer: 'эмоциональная память, забота и потребность в безопасной обстановке',
  leo: 'творческое самовыражение, щедрость и желание быть замеченным',
  virgo: 'внимание к деталям, практичность и желание улучшать процессы',
  libra: 'стремление к балансу, диалогу и справедливым договорённостям',
  scorpio: 'глубокие переживания и способность проходить через перемены',
  sagittarius: 'интерес к новому, поиск смысла и расширение кругозора',
};

const qualityLabels = {
  en: {
    fire: 'fire',
    earth: 'earth',
    air: 'air',
    water: 'water',
    cardinal: 'more likely to start something new',
    fixed: 'more likely to stay the course',
    mutable: 'more comfortable adapting to change',
  },
  ru: {
    fire: 'огонь',
    earth: 'земля',
    air: 'воздух',
    water: 'вода',
    cardinal: 'легче начинает новое',
    fixed: 'чаще сохраняет выбранный курс',
    mutable: 'легче приспосабливается к переменам',
  },
  uk: {
    fire: 'вогонь',
    earth: 'земля',
    air: 'повітря',
    water: 'вода',
    cardinal: 'легше починає нове',
    fixed: 'частіше зберігає обраний курс',
    mutable: 'легше пристосовується до змін',
  },
} as const;

function createInterpretationEvidence(
  source: Extract<PersonalitySourceId, 'numerology' | 'zodiac' | 'astrology'>,
  title: string,
  description: string,
): Evidence {
  return {
    description,
    id: `${source}:birth-date`,
    source,
    title,
  };
}

function createInterpretation(
  source: Extract<PersonalitySourceId, 'numerology' | 'zodiac' | 'astrology'>,
  title: string,
  description: string,
  details: string,
  evidence: Evidence,
  locale: ProfileLocale,
): Insight {
  return {
    confidence: createConfidenceExplanation([evidence], locale),
    description,
    evidence: [evidence],
    evidenceGroups: createEvidenceGroups([evidence], locale),
    explanation: details,
    format: 'interpretation',
    id: `interpretation:${source}`,
    sources: createSourceReferences([evidence], ['birth-date'], locale),
    title,
    traitIds: [],
  };
}

function getLifePathNumber(birthDate: string) {
  const [year = 0, month = 0, day = 0] = birthDate.split('-').map(Number);
  return reduceNumerology([year, month, day]).value;
}

export function createNumerologyInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const number = getLifePathNumber(birthDate);
  const evidence = createInterpretationEvidence(
    'numerology',
    locale === 'en'
      ? `Numerology calculation: ${number}`
      : locale === 'uk'
        ? `Нумерологічний розрахунок: ${number}`
        : `Нумерологический расчёт: ${number}`,
    locale === 'en'
      ? 'Calculated only from the digits of the provided birth date.'
      : locale === 'uk'
        ? 'Розраховано лише з цифр указаної дати народження.'
        : 'Расчёт выполнен только из цифр указанной даты рождения.',
  );

  return createInterpretation(
    'numerology',
    locale === 'en'
      ? `Your main number — ${number}`
      : locale === 'uk'
        ? `Ваше основне число — ${number}`
        : `Ваше основное число — ${number}`,
    locale === 'en'
      ? `Numerology uses ${number} as a prompt for looking at familiar habits and choices.`
      : locale === 'uk'
        ? `У нумерології число ${number} використовують як привід придивитися до звичних дій і виборів.`
        : `В нумерологии число ${number} используют как повод присмотреться к привычным действиям и решениям.`,
    locale === 'en'
      ? 'This does not define your personality or predict events. The calculation adds the digits of the entered date and keeps 11, 22 and 33 as separate results.'
      : locale === 'uk'
        ? 'Цей розбір не визначає вашу особистість і не прогнозує події. У розрахунку цифри дати послідовно додаються, а 11, 22 і 33 залишаються окремими результатами.'
        : 'Этот разбор не определяет вашу личность и не предсказывает события. В расчёте цифры даты последовательно складываются, а 11, 22 и 33 остаются отдельными результатами.',
    evidence,
    locale,
  );
}

export function createZodiacInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const sign = createZodiacProfile(birthDate, locale);
  const label = sign.sign;
  const evidence = createInterpretationEvidence(
    'zodiac',
    locale === 'en'
      ? `Zodiac sign: ${label}`
      : locale === 'uk'
        ? `Знак зодіаку: ${label}`
        : `Зодиакальный знак: ${label}`,
    locale === 'en'
      ? 'The sign is derived from the date only, without birth time or location.'
      : locale === 'uk'
        ? 'Знак визначено лише за датою, без часу й місця народження.'
        : 'Знак определён по указанной дате рождения без времени и места рождения.',
  );

  return createInterpretation(
    'zodiac',
    locale === 'en'
      ? `${label}: an optional reading`
      : locale === 'uk'
        ? `${label}: додатковий розбір`
        : `${label}: дополнительный разбор`,
    locale === 'en'
      ? 'This tradition links the sign with familiar ways of acting and reacting.'
      : locale === 'uk'
        ? 'У цій традиції знак пов’язують зі звичними способами діяти й реагувати.'
        : `В этой традиции знак ${label} связывают с такими качествами: ${zodiacNotes[sign.signId]}.`,
    locale === 'en'
      ? 'This is a cultural and entertainment interpretation, not an established fact about personality.'
      : locale === 'uk'
        ? 'Це культурний погляд для розваги, а не встановлений факт про особистість.'
        : 'Это культурный взгляд для развлечения, а не установленный факт о личности.',
    evidence,
    locale,
  );
}

export function createAstrologyInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const sign = createZodiacProfile(birthDate, locale);
  const { element, modality } = sign;
  const signLabel = sign.sign;
  const evidence = createInterpretationEvidence(
    'astrology',
    locale === 'en'
      ? 'Astrology reading by date'
      : locale === 'uk'
        ? 'Астрологічний розбір за датою'
        : 'Астрологический разбор по дате',
    locale === 'en'
      ? `Only the date ${birthDate} was used; birth time and place were not collected.`
      : locale === 'uk'
        ? `Використано лише дату ${birthDate}; час і місце народження не збиралися.`
        : `Использована только календарная дата ${birthDate}; время и место рождения не собирались.`,
  );

  return createInterpretation(
    'astrology',
    locale === 'en'
      ? 'Astrology portrait by date'
      : locale === 'uk'
        ? 'Астрологічний портрет за датою'
        : 'Астрологический портрет по дате',
    locale === 'en'
      ? `${signLabel} is linked with the ${qualityLabels.en[element]} element and ${qualityLabels.en[modality]}.`
      : locale === 'uk'
        ? `${signLabel} пов’язують зі стихією «${qualityLabels.uk[element]}». У цій традиції цей знак ${qualityLabels.uk[modality]}.`
        : `${signLabel} связывают со стихией «${qualityLabels.ru[element]}». В этой традиции знак ${qualityLabels.ru[modality]}.`,
    locale === 'en'
      ? 'This is a popular symbolic interpretation based only on the date. It is not a natal chart and does not affect confidence in psychological observations.'
      : locale === 'uk'
        ? 'Це популярний символічний розбір лише за датою. Він не є натальною картою й не підтверджує спостереження за вашими відповідями.'
        : 'Это популярный символический разбор только по дате. Он не является натальной картой и не подтверждает наблюдения по вашим ответам.',
    evidence,
    locale,
  );
}
