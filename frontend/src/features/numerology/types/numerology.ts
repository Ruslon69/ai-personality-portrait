import type { Locale } from '@shared/i18n';

export type NumerologyCalculationId =
  'life-path' | 'birthday' | 'attitude' | 'personal-year' | 'personal-month' | 'personal-day';

export type NumerologyCalculation = {
  application: string;
  id: NumerologyCalculationId;
  interpretation: string;
  label: string;
  sourceDigits: readonly number[];
  steps: readonly string[];
  strengths: readonly string[];
  tensions: readonly string[];
  value: number;
};

export type ZodiacElement = 'air' | 'earth' | 'fire' | 'water';
export type ZodiacModality = 'cardinal' | 'fixed' | 'mutable';

export type ZodiacProfile = {
  element: ZodiacElement;
  interpretation: string;
  modality: ZodiacModality;
  sign: string;
  signId: string;
};

export type NumerologyProfile = {
  attitude: NumerologyCalculation;
  birthDate: string;
  birthday: NumerologyCalculation;
  createdFor: string;
  lifePath: NumerologyCalculation;
  locale: Locale;
  personalDay: NumerologyCalculation;
  personalMonth: NumerologyCalculation;
  personalYear: NumerologyCalculation;
  system: 'pythagorean-date-v1';
  zodiac: ZodiacProfile;
};

export type NumerologyViewMode = 'brief' | 'calculation' | 'details';
