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
  capricorn: 'образ последовательности, ответственности и движения к выбранной цели',
  aquarius: 'образ независимого взгляда, идей и интереса к новым связям',
  pisces: 'образ восприимчивости, воображения и внимания к оттенкам опыта',
  aries: 'образ импульса к действию, прямоты и начала нового',
  taurus: 'образ устойчивости, чувственного опыта и ценности надёжной опоры',
  gemini: 'образ любопытства, обмена идеями и подвижности внимания',
  cancer: 'образ эмоциональной памяти, заботы и значимости безопасного пространства',
  leo: 'образ творческого выражения, щедрости и заметного присутствия',
  virgo: 'образ внимания к деталям, практичности и стремления улучшать процессы',
  libra: 'образ баланса, диалога и поиска справедливой формы взаимодействия',
  scorpio: 'образ глубины, интенсивности и способности проходить изменения',
  sagittarius: 'образ исследования, смысла и расширения привычной перспективы',
};

const qualityLabels = {
  en: {
    fire: 'fire',
    earth: 'earth',
    air: 'air',
    water: 'water',
    cardinal: 'cardinal',
    fixed: 'fixed',
    mutable: 'mutable',
  },
  ru: {
    fire: 'огонь',
    earth: 'земля',
    air: 'воздух',
    water: 'вода',
    cardinal: 'кардинальная',
    fixed: 'фиксированная',
    mutable: 'мутабельная',
  },
  uk: {
    fire: 'вогонь',
    earth: 'земля',
    air: 'повітря',
    water: 'вода',
    cardinal: 'кардинальна',
    fixed: 'фіксована',
    mutable: 'мутабельна',
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
      ? `Life-path number — ${number}`
      : locale === 'uk'
        ? `Число шляху — ${number}`
        : `Число пути — ${number}`,
    locale === 'en'
      ? `In numerology, ${number} is used as a symbolic theme for reflection.`
      : locale === 'uk'
        ? `У нумерології число ${number} використовують як символічну тему для рефлексії.`
        : `В нумерологической модели число ${number} используется как символическая тема для саморефлексии.`,
    locale === 'en'
      ? 'This interpretation does not confirm psychological observations or predict events. The calculation uses every digit of the entered date and repeatedly sums them to a single digit, while retaining 11, 22 and 33.'
      : locale === 'uk'
        ? 'Ця інтерпретація не підтверджує психологічні спостереження й не прогнозує події. У розрахунку цифри дати послідовно складаються; 11, 22 і 33 зберігаються.'
        : 'Эта интерпретация не подтверждает психологические наблюдения и не предсказывает события. Для расчёта цифры даты последовательно складываются; 11, 22 и 33 сохраняются.',
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
      ? `${label}: an optional perspective`
      : locale === 'uk'
        ? `${label}: додаткова перспектива`
        : `${label}: дополнительная перспектива`,
    locale === 'en'
      ? 'A familiar cultural symbol offered as an optional reflection layer.'
      : locale === 'uk'
        ? 'Знайомий культурний символ як необов’язковий шар для рефлексії.'
        : `В зодиакальной традиции ${label} — это ${zodiacNotes[sign.signId]}.`,
    locale === 'en'
      ? 'This is a cultural and entertainment interpretation, not an established fact about personality.'
      : locale === 'uk'
        ? 'Це культурна й розважальна інтерпретація, а не встановлений факт про особистість.'
        : 'Это культурная и развлекательная интерпретация, а не установленный факт о личности.',
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
      ? 'Date-based astrology layer'
      : locale === 'uk'
        ? 'Астрологічний шар за датою'
        : 'Астрологический слой по дате',
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
      ? `${signLabel}: ${qualityLabels.en[element]} element, ${qualityLabels.en[modality]} modality.`
      : locale === 'uk'
        ? `${signLabel}: стихія — ${qualityLabels.uk[element]}, модальність — ${qualityLabels.uk[modality]}.`
        : `${signLabel}: стихия — ${qualityLabels.ru[element]}, модальность — ${qualityLabels.ru[modality]}.`,
    locale === 'en'
      ? 'This is a popular symbolic interpretation based only on the date. It is not a natal chart and does not affect confidence in psychological observations.'
      : locale === 'uk'
        ? 'Це популярна символічна інтерпретація лише за датою. Це не натальна карта, і вона не впливає на впевненість психологічних спостережень.'
        : 'Это популярная символическая интерпретация только по дате. Это не натальная карта, и она не влияет на уверенность психологических наблюдений.',
    evidence,
    locale,
  );
}
