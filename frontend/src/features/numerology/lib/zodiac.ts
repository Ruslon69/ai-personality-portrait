import type { Locale } from '@shared/i18n';

import type { ZodiacElement, ZodiacModality, ZodiacProfile } from '../types';

const signs = [
  ['capricorn', 19, 'earth', 'cardinal'],
  ['aquarius', 18, 'air', 'fixed'],
  ['pisces', 20, 'water', 'mutable'],
  ['aries', 19, 'fire', 'cardinal'],
  ['taurus', 20, 'earth', 'fixed'],
  ['gemini', 20, 'air', 'mutable'],
  ['cancer', 22, 'water', 'cardinal'],
  ['leo', 22, 'fire', 'fixed'],
  ['virgo', 22, 'earth', 'mutable'],
  ['libra', 22, 'air', 'cardinal'],
  ['scorpio', 21, 'water', 'fixed'],
  ['sagittarius', 21, 'fire', 'mutable'],
] as const;

const labels = {
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

const interpretations: Record<Locale, Record<ZodiacElement, string>> = {
  ru: {
    fire: 'Огненная символика связывается с импульсом, выражением и началом действия.',
    earth: 'Земная символика связывается с устойчивостью, формой и практическим опытом.',
    air: 'Воздушная символика связывается с идеями, обменом и движением перспективы.',
    water: 'Водная символика связывается с чувствительностью, памятью и внутренним откликом.',
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
    air: 'Символіка повітря пов’язується з ідеями, обміном і рухом перспективи.',
    water: 'Символіка води пов’язується з чутливістю, пам’яттю та внутрішнім відгуком.',
  },
};

export function createZodiacProfile(birthDate: string, locale: Locale): ZodiacProfile {
  const [, monthValue, dayValue] = birthDate.split('-').map(Number);
  const month = Math.min(12, Math.max(1, monthValue ?? 1));
  const day = dayValue ?? 1;
  const current = signs[month - 1] ?? signs[0];
  const sign = day <= current[1] ? current : (signs[month % 12] ?? signs[0]);
  return {
    signId: sign[0],
    sign: labels[locale][sign[0]],
    element: sign[2] as ZodiacElement,
    modality: sign[3] as ZodiacModality,
    interpretation: interpretations[locale][sign[2]],
  };
}
