import type { Locale } from '@shared/i18n';

import { numberMeanings } from '../data';
import type { NumerologyCalculation, NumerologyCalculationId, NumerologyProfile } from '../types';
import { createZodiacProfile } from './zodiac';

export const NUMEROLOGY_SYSTEM = 'pythagorean-date-v1' as const;
export const MASTER_NUMBERS = [11, 22, 33] as const;

const labels: Record<Locale, Record<NumerologyCalculationId, string>> = {
  ru: {
    'life-path': 'Число жизненного пути',
    birthday: 'Число дня рождения',
    attitude: 'Число первого впечатления',
    'personal-year': 'Персональный год',
    'personal-month': 'Персональный месяц',
    'personal-day': 'Персональный день',
  },
  en: {
    'life-path': 'Life-path number',
    birthday: 'Birthday number',
    attitude: 'Attitude number',
    'personal-year': 'Personal year',
    'personal-month': 'Personal month',
    'personal-day': 'Personal day',
  },
  uk: {
    'life-path': 'Число життєвого шляху',
    birthday: 'Число дня народження',
    attitude: 'Число першого враження',
    'personal-year': 'Персональний рік',
    'personal-month': 'Персональний місяць',
    'personal-day': 'Персональний день',
  },
};

function sumDigits(value: number) {
  return String(Math.abs(value))
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}

export function reduceNumerology(values: readonly number[], preserveMasters = true) {
  const sourceDigits = values.flatMap((value) => String(Math.abs(value)).split('').map(Number));
  const steps: string[] = [];
  const directValue = values.length === 1 ? Math.abs(values[0] ?? 0) : null;
  if (
    preserveMasters &&
    directValue !== null &&
    MASTER_NUMBERS.includes(directValue as 11 | 22 | 33)
  ) {
    steps.push(`${directValue} = ${directValue}`);
    return { sourceDigits, steps, value: directValue };
  }
  let value = sourceDigits.reduce((sum, digit) => sum + digit, 0);
  steps.push(`${sourceDigits.join(' + ')} = ${value}`);
  while (value > 9 && !(preserveMasters && MASTER_NUMBERS.includes(value as 11 | 22 | 33))) {
    const next = sumDigits(value);
    steps.push(`${String(value).split('').join(' + ')} = ${next}`);
    value = next;
  }
  return { sourceDigits, steps, value };
}

function calculation(id: NumerologyCalculationId, values: readonly number[], locale: Locale) {
  const reduced = reduceNumerology(values);
  const meaning = numberMeanings[locale][reduced.value] ?? numberMeanings[locale][9];
  return {
    ...reduced,
    ...meaning,
    id,
    label: labels[locale][id],
  } satisfies NumerologyCalculation;
}

export function createNumerologyProfile(
  birthDate: string,
  locale: Locale,
  referenceDate = new Date(),
): NumerologyProfile {
  const [yearValue, monthValue, dayValue] = birthDate.split('-').map(Number);
  const year = yearValue ?? 0;
  const month = monthValue ?? 1;
  const day = dayValue ?? 1;
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();
  const lifePath = calculation('life-path', [year, month, day], locale);
  const birthday = calculation('birthday', [day], locale);
  const attitude = calculation('attitude', [month, day], locale);
  const personalYear = calculation('personal-year', [month, day, currentYear], locale);
  const personalMonth = calculation('personal-month', [personalYear.value, currentMonth], locale);
  const personalDay = calculation('personal-day', [personalMonth.value, currentDay], locale);
  return {
    attitude,
    birthDate,
    birthday,
    createdFor: referenceDate.toISOString().slice(0, 10),
    lifePath,
    locale,
    personalDay,
    personalMonth,
    personalYear,
    system: NUMEROLOGY_SYSTEM,
    zodiac: createZodiacProfile(birthDate, locale),
  };
}

export function isValidNumerologyDate(value: string, now = new Date(), minimumAge = 18) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== (month ?? 1) - 1 ||
    date.getDate() !== day ||
    date > now
  )
    return false;
  let age = now.getFullYear() - date.getFullYear();
  if (
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  )
    age -= 1;
  return age >= minimumAge;
}
