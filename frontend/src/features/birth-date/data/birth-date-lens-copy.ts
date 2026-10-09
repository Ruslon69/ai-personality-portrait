import type { Locale } from '@shared/i18n';

export const birthDateLensCopy = {
  es: {
    empty: 'Una perspectiva opcional por tu fecha',
    skipped: 'La reflexión continúa sin lecturas por fecha de nacimiento',
    sign: 'Signo',
    number: 'Número',
    element: 'Elemento',
    modality: 'Cómo actúa el signo',
    elements: { earth: 'tierra', air: 'aire', water: 'agua', fire: 'fuego' },
    modalities: { cardinal: 'inicia', fixed: 'mantiene el rumbo', mutable: 'se adapta' },
  },
  en: {
    empty: 'Optional birth-date insight',
    skipped: 'The reflection continues without birth-date insights',
    sign: 'Sign',
    number: 'Number',
    element: 'Element',
    modality: 'How the sign acts',
    elements: { earth: 'earth', air: 'air', water: 'water', fire: 'fire' },
    modalities: { cardinal: 'starts things', fixed: 'stays the course', mutable: 'adapts' },
  },
  ru: {
    empty: 'Необязательный разбор по дате рождения',
    skipped: 'Личный разбор продолжится без даты рождения',
    sign: 'Знак',
    number: 'Число',
    element: 'Элемент',
    modality: 'Как действует знак',
    elements: { earth: 'земля', air: 'воздух', water: 'вода', fire: 'огонь' },
    modalities: { cardinal: 'начинает новое', fixed: 'сохраняет курс', mutable: 'легко меняется' },
  },
  uk: {
    empty: 'Необов’язковий розбір за датою народження',
    skipped: 'Особистий розбір продовжиться без дати народження',
    sign: 'Знак',
    number: 'Число',
    element: 'Елемент',
    modality: 'Як діє знак',
    elements: { earth: 'земля', air: 'повітря', water: 'вода', fire: 'вогонь' },
    modalities: { cardinal: 'починає нове', fixed: 'тримає курс', mutable: 'легко змінюється' },
  },
} as const satisfies Record<Locale, unknown>;
