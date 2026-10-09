import { zodiacNames, zodiacElementInterpretations } from '../data/zodiac-copy';
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

export function createZodiacProfile(birthDate: string, locale: Locale): ZodiacProfile {
  const [, monthValue, dayValue] = birthDate.split('-').map(Number);
  const month = Math.min(12, Math.max(1, monthValue ?? 1));
  const day = dayValue ?? 1;
  const current = signs[month - 1] ?? signs[0];
  const sign = day <= current[1] ? current : (signs[month % 12] ?? signs[0]);
  return {
    signId: sign[0],
    sign: zodiacNames[locale][sign[0]],
    element: sign[2] as ZodiacElement,
    modality: sign[3] as ZodiacModality,
    interpretation: zodiacElementInterpretations[locale][sign[2]],
  };
}
