import type { Locale } from '@shared/i18n';

import styles from './BirthDateLens.module.css';

type Props = { birthDate: string; locale: Locale; skipped: boolean };
const signs = [
  'Capricorn',
  'Aquarius',
  'Pisces',
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
] as const;
const localizedSigns = {
  en: signs,
  ru: [
    'Козерог',
    'Водолей',
    'Рыбы',
    'Овен',
    'Телец',
    'Близнецы',
    'Рак',
    'Лев',
    'Дева',
    'Весы',
    'Скорпион',
    'Стрелец',
  ],
  uk: [
    'Козоріг',
    'Водолій',
    'Риби',
    'Овен',
    'Телець',
    'Близнюки',
    'Рак',
    'Лев',
    'Діва',
    'Терези',
    'Скорпіон',
    'Стрілець',
  ],
} as const;
const boundaries = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22] as const;
const elements = [
  'earth',
  'air',
  'water',
  'fire',
  'earth',
  'air',
  'water',
  'fire',
  'earth',
  'air',
  'water',
  'fire',
] as const;
const modalities = [
  'cardinal',
  'fixed',
  'mutable',
  'cardinal',
  'fixed',
  'mutable',
  'cardinal',
  'fixed',
  'mutable',
  'cardinal',
  'fixed',
  'mutable',
] as const;
const labels = {
  en: {
    empty: 'Optional interpretation lens',
    skipped: 'The portrait continues without this lens',
    sign: 'Sign',
    number: 'Number',
    element: 'Element',
    modality: 'Modality',
    elements: { earth: 'earth', air: 'air', water: 'water', fire: 'fire' },
    modalities: { cardinal: 'cardinal', fixed: 'fixed', mutable: 'mutable' },
  },
  ru: {
    empty: 'Необязательная интерпретационная линза',
    skipped: 'Портрет продолжится без этого слоя',
    sign: 'Знак',
    number: 'Число',
    element: 'Элемент',
    modality: 'Модальность',
    elements: { earth: 'земля', air: 'воздух', water: 'вода', fire: 'огонь' },
    modalities: { cardinal: 'кардинальная', fixed: 'фиксированная', mutable: 'мутабельная' },
  },
  uk: {
    empty: 'Необов’язкова інтерпретаційна лінза',
    skipped: 'Портрет продовжиться без цього шару',
    sign: 'Знак',
    number: 'Число',
    element: 'Елемент',
    modality: 'Модальність',
    elements: { earth: 'земля', air: 'повітря', water: 'вода', fire: 'вогонь' },
    modalities: { cardinal: 'кардинальна', fixed: 'фіксована', mutable: 'мутабельна' },
  },
} as const;

function getLens(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const signIndex =
    ((month ?? 1) - 1 + ((day ?? 1) >= (boundaries[(month ?? 1) - 1] ?? 31) ? 1 : 0)) % 12;
  let number = String(`${year ?? ''}${month ?? ''}${day ?? ''}`)
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
  while (number > 9 && number !== 11 && number !== 22)
    number = String(number)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  return {
    signIndex,
    element: elements[signIndex] ?? 'earth',
    modality: modalities[signIndex] ?? 'cardinal',
    number,
    month,
    day,
    year,
  };
}

export function BirthDateLens({ birthDate, locale, skipped }: Props) {
  const copy = labels[locale];
  const lens = birthDate ? getLens(birthDate) : null;
  return (
    <div
      aria-live="polite"
      className={styles.root}
      data-active={(Boolean(lens) && !skipped) || undefined}
      data-skipped={skipped || undefined}
    >
      <div aria-hidden="true" className={styles.visual}>
        <span className={styles.ring} />
        <span className={styles.sector} />
        <strong>{lens?.number ?? '·'}</strong>
        {lens ? (
          <small>
            {lens.day} · {lens.month} · {lens.year}
          </small>
        ) : null}
      </div>
      {!lens || skipped ? (
        <p>{skipped ? copy.skipped : copy.empty}</p>
      ) : (
        <dl className={styles.details}>
          <div>
            <dt>{copy.sign}</dt>
            <dd>{localizedSigns[locale][lens.signIndex]}</dd>
          </div>
          <div>
            <dt>{copy.element}</dt>
            <dd>{copy.elements[lens.element]}</dd>
          </div>
          <div>
            <dt>{copy.modality}</dt>
            <dd>{copy.modalities[lens.modality]}</dd>
          </div>
          <div>
            <dt>{copy.number}</dt>
            <dd>{lens.number}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
