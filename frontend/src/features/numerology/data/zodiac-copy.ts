import type { Locale } from '@shared/i18n';
import type { ZodiacElement } from '../types';

import { zodiacNames } from '@shared/i18n/zodiac-names';
export { zodiacNames };

export const zodiacElementInterpretations: Record<Locale, Record<ZodiacElement, string>> = {
  ru: {
    fire: 'Огненная символика связывается с импульсом, выражением и началом действия.',
    earth: 'Земная символика связывается с устойчивостью, формой и практическим опытом.',
    air: 'Воздушная символика связывается с идеями, обменом и сменой точки зрения.',
    water: 'Водная символика связывается с чувствительностью, памятью и внутренним откликом.',
  },
  es: {
    fire: 'El simbolismo del fuego se relaciona con el impulso, la expresión y el inicio de la acción.',
    earth:
      'El simbolismo de la tierra se relaciona con la estabilidad, la forma y la experiencia práctica.',
    air: 'El simbolismo del aire se relaciona con las ideas, el intercambio y los cambios de perspectiva.',
    water:
      'El simbolismo del agua se relaciona con la sensibilidad, la memoria y la respuesta interior.',
  },
  en: {
    fire: 'Fire symbolism is associated with impulse, expression and beginning action.',
    earth: 'Earth symbolism is associated with stability, form and practical experience.',
    air: 'Air symbolism is associated with ideas, exchange and shifting perspective.',
    water: 'Water symbolism is associated with sensitivity, memory and inner response.',
  },
  uk: {
    fire: 'Символіка вогню пов’язується з імпульсом, вираженням і початком дії.',
    earth: 'Символіка землі пов’язується зі стійкістю, формою та практичним досвідом.',
    air: 'Символіка повітря пов’язується з ідеями, обміном і зміною погляду.',
    water: 'Символіка води пов’язується з чутливістю, пам’яттю та внутрішнім відгуком.',
  },
};

export const zodiacNotes = {
  ru: {
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
  },
  es: {
    capricorn: 'la constancia, la responsabilidad y el avance hacia un objetivo elegido',
    aquarius:
      'el pensamiento independiente, las ideas nuevas y el interés por conexiones inesperadas',
    pisces: 'la receptividad, la imaginación y la sensibilidad a los matices emocionales',
    aries: 'la disposición a actuar de forma directa y empezar algo nuevo',
    taurus: 'la estabilidad, la atención a los sentidos y la necesidad de un apoyo fiable',
    gemini: 'la curiosidad, el intercambio de ideas y la facilidad para cambiar de foco',
    cancer: 'la memoria emocional, el cuidado y la necesidad de un entorno seguro',
    leo: 'la expresión creativa, la generosidad y el deseo de hacerse visible',
    virgo: 'la atención al detalle, el sentido práctico y el deseo de mejorar lo que ya funciona',
    libra: 'la búsqueda de equilibrio, diálogo y acuerdos justos',
    scorpio: 'los sentimientos profundos y la capacidad de atravesar cambios',
    sagittarius:
      'el interés por experiencias nuevas, la búsqueda de sentido y una perspectiva más amplia',
  },
  en: {
    capricorn: 'consistency, responsibility and working towards a chosen goal',
    aquarius: 'independent thinking, new ideas and an interest in unexpected connections',
    pisces: 'receptiveness, imagination and sensitivity to subtle feelings',
    aries: 'readiness to act directly and begin something new',
    taurus: 'steadiness, attention to the senses and a need for reliable support',
    gemini: 'curiosity, exchanging ideas and shifting attention with ease',
    cancer: 'emotional memory, care and a need for a safe environment',
    leo: 'creative expression, generosity and a wish to be seen',
    virgo: 'attention to detail, practicality and a wish to improve how things work',
    libra: 'a wish for balance, dialogue and fair agreements',
    scorpio: 'deep feelings and the capacity to move through change',
    sagittarius: 'an interest in new experiences, a search for meaning and a wider perspective',
  },
  uk: {
    capricorn: 'послідовність, відповідальність і рух до обраної мети',
    aquarius: 'незалежний погляд, нові ідеї та інтерес до незвичних зв’язків',
    pisces: 'сприйнятливість, уяву й увагу до тонких переживань',
    aries: 'готовність діяти прямо й починати нове',
    taurus: 'стійкість, увагу до відчуттів і потребу в надійній опорі',
    gemini: 'допитливість, обмін ідеями й легке перемикання уваги',
    cancer: 'емоційну пам’ять, турботу й потребу в безпечній обстановці',
    leo: 'творче самовираження, щедрість і бажання бути поміченим',
    virgo: 'увагу до деталей, практичність і бажання поліпшувати процеси',
    libra: 'прагнення до рівноваги, діалогу й справедливих домовленостей',
    scorpio: 'глибокі переживання та здатність проходити крізь зміни',
    sagittarius: 'інтерес до нового, пошук сенсу й розширення світогляду',
  },
} satisfies Record<Locale, Record<keyof typeof zodiacNames.ru, string>>;

export const zodiacQualityLabels = {
  es: {
    fire: 'fuego',
    earth: 'tierra',
    air: 'aire',
    water: 'agua',
    cardinal: 'tiende a iniciar algo nuevo',
    fixed: 'tiende a mantener el rumbo',
    mutable: 'se adapta con más facilidad al cambio',
  },
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
} as const satisfies Record<Locale, Record<string, string>>;

export const zodiacElementLabels = {
  ru: { fire: 'огонь', earth: 'земля', air: 'воздух', water: 'вода' },
  es: { fire: 'fuego', earth: 'tierra', air: 'aire', water: 'agua' },
  en: { fire: 'fire', earth: 'earth', air: 'air', water: 'water' },
  uk: { fire: 'вогонь', earth: 'земля', air: 'повітря', water: 'вода' },
} satisfies Record<Locale, unknown>;
export const zodiacModalityLabels = {
  ru: { cardinal: 'кардинальная', fixed: 'фиксированная', mutable: 'мутабельная' },
  es: { cardinal: 'cardinal', fixed: 'fija', mutable: 'mutable' },
  en: { cardinal: 'cardinal', fixed: 'fixed', mutable: 'mutable' },
  uk: { cardinal: 'кардинальна', fixed: 'фіксована', mutable: 'мутабельна' },
} satisfies Record<Locale, unknown>;
