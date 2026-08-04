import type {
  Evidence,
  Insight,
  PersonalitySourceId,
  ProfileLocale,
} from '@entities/personality-profile';
import {
  createConfidenceExplanation,
  createEvidenceGroups,
  createSourceReferences,
} from './explainability';

type ZodiacSign = {
  endDay: number;
  endMonth: number;
  key: keyof typeof zodiacLabels.en;
  note: string;
};

const zodiacLabels = {
  en: {
    capricorn: 'Capricorn',
    aquarius: 'Aquarius',
    pisces: 'Pisces',
    aries: 'Aries',
    taurus: 'Taurus',
    gemini: 'Gemini',
    cancer: 'Cancer',
    leo: 'Leo',
    virgo: 'Virgo',
    libra: 'Libra',
    scorpio: 'Scorpio',
    sagittarius: 'Sagittarius',
  },
  ru: {
    capricorn: 'Козерог',
    aquarius: 'Водолей',
    pisces: 'Рыбы',
    aries: 'Овен',
    taurus: 'Телец',
    gemini: 'Близнецы',
    cancer: 'Рак',
    leo: 'Лев',
    virgo: 'Дева',
    libra: 'Весы',
    scorpio: 'Скорпион',
    sagittarius: 'Стрелец',
  },
  uk: {
    capricorn: 'Козоріг',
    aquarius: 'Водолій',
    pisces: 'Риби',
    aries: 'Овен',
    taurus: 'Телець',
    gemini: 'Близнюки',
    cancer: 'Рак',
    leo: 'Лев',
    virgo: 'Діва',
    libra: 'Терези',
    scorpio: 'Скорпіон',
    sagittarius: 'Стрілець',
  },
} as const;

const astrologyQualities = {
  capricorn: ['earth', 'cardinal'],
  aquarius: ['air', 'fixed'],
  pisces: ['water', 'mutable'],
  aries: ['fire', 'cardinal'],
  taurus: ['earth', 'fixed'],
  gemini: ['air', 'mutable'],
  cancer: ['water', 'cardinal'],
  leo: ['fire', 'fixed'],
  virgo: ['earth', 'mutable'],
  libra: ['air', 'cardinal'],
  scorpio: ['water', 'fixed'],
  sagittarius: ['fire', 'mutable'],
} as const;

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

const zodiacSigns: readonly ZodiacSign[] = [
  {
    endDay: 19,
    endMonth: 1,
    key: 'capricorn',
    note: 'образ последовательности, ответственности и движения к выбранной цели',
  },
  {
    endDay: 18,
    endMonth: 2,
    key: 'aquarius',
    note: 'образ независимого взгляда, идей и интереса к новым связям',
  },
  {
    endDay: 20,
    endMonth: 3,
    key: 'pisces',
    note: 'образ восприимчивости, воображения и внимания к оттенкам опыта',
  },
  {
    endDay: 19,
    endMonth: 4,
    key: 'aries',
    note: 'образ импульса к действию, прямоты и начала нового',
  },
  {
    endDay: 20,
    endMonth: 5,
    key: 'taurus',
    note: 'образ устойчивости, чувственного опыта и ценности надёжной опоры',
  },
  {
    endDay: 20,
    endMonth: 6,
    key: 'gemini',
    note: 'образ любопытства, обмена идеями и подвижности внимания',
  },
  {
    endDay: 22,
    endMonth: 7,
    key: 'cancer',
    note: 'образ эмоциональной памяти, заботы и значимости безопасного пространства',
  },
  {
    endDay: 22,
    endMonth: 8,
    key: 'leo',
    note: 'образ творческого выражения, щедрости и заметного присутствия',
  },
  {
    endDay: 22,
    endMonth: 9,
    key: 'virgo',
    note: 'образ внимания к деталям, практичности и стремления улучшать процессы',
  },
  {
    endDay: 22,
    endMonth: 10,
    key: 'libra',
    note: 'образ баланса, диалога и поиска справедливой формы взаимодействия',
  },
  {
    endDay: 21,
    endMonth: 11,
    key: 'scorpio',
    note: 'образ глубины, интенсивности и способности проходить изменения',
  },
  {
    endDay: 21,
    endMonth: 12,
    key: 'sagittarius',
    note: 'образ исследования, смысла и расширения привычной перспективы',
  },
  {
    endDay: 31,
    endMonth: 12,
    key: 'capricorn',
    note: 'образ последовательности, ответственности и движения к выбранной цели',
  },
];

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
  let value = birthDate
    .replaceAll('-', '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);

  while (value > 9 && value !== 11 && value !== 22) {
    value = String(value)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return value;
}

function getZodiacSign(birthDate: string) {
  const [, monthValue, dayValue] = birthDate.split('-').map(Number);
  const month = monthValue ?? 1;
  const day = dayValue ?? 1;

  return (
    zodiacSigns.find(
      (sign) => month < sign.endMonth || (month === sign.endMonth && day <= sign.endDay),
    ) ?? zodiacSigns[0]
  );
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
      ? 'This interpretation does not confirm psychological observations or predict events. The calculation uses every digit of the entered date and repeatedly sums them to a single digit, while retaining 11 and 22.'
      : locale === 'uk'
        ? 'Ця інтерпретація не підтверджує психологічні спостереження й не прогнозує події. У розрахунку цифри дати послідовно складаються; 11 і 22 зберігаються.'
        : 'Эта интерпретация не подтверждает психологические наблюдения и не предсказывает события. Для расчёта цифры даты последовательно складываются; 11 и 22 сохраняются.',
    evidence,
    locale,
  );
}

export function createZodiacInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const sign = getZodiacSign(birthDate);
  const label = zodiacLabels[locale][sign.key];
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
        : `В зодиакальной традиции ${label} — это ${sign.note}.`,
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
  const sign = getZodiacSign(birthDate);
  const [element, modality] = astrologyQualities[sign.key];
  const signLabel = zodiacLabels[locale][sign.key];
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
