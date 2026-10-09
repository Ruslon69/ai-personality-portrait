import type { Locale } from '@shared/i18n';
import type { NumerologyCalculationId } from '../types';

export const numerologyLabels: Record<Locale, Record<NumerologyCalculationId, string>> = {
  ru: {
    'life-path': 'Число жизненного пути',
    birthday: 'Число дня рождения',
    attitude: 'Число первого впечатления',
    'personal-year': 'Персональный год',
    'personal-month': 'Персональный месяц',
    'personal-day': 'Персональный день',
  },
  es: {
    'life-path': 'Número del camino de vida',
    birthday: 'Número de nacimiento',
    attitude: 'Número de primera impresión',
    'personal-year': 'Año personal',
    'personal-month': 'Mes personal',
    'personal-day': 'Día personal',
  },
  en: {
    'life-path': 'Life-path number',
    birthday: 'Birthday number',
    attitude: 'First-impression number',
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
