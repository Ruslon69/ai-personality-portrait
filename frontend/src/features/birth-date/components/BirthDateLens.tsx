import { reduceNumerology } from '@features/numerology/lib/numerology-engine';
import type { Locale } from '@shared/i18n';
import { zodiacNames } from '@features/numerology/data/zodiac-copy';
import { birthDateLensCopy } from '../data/birth-date-lens-copy';

import styles from './BirthDateLens.module.css';

type Props = { birthDate: string; locale: Locale; skipped: boolean };
const signIds = [
  'capricorn',
  'aquarius',
  'pisces',
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
] as const;
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

function getLens(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const signIndex =
    ((month ?? 1) - 1 + ((day ?? 1) >= (boundaries[(month ?? 1) - 1] ?? 31) ? 1 : 0)) % 12;
  const number = reduceNumerology([year ?? 0, month ?? 0, day ?? 0]).value;
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
  const copy = birthDateLensCopy[locale];
  const lens = birthDate && !skipped ? getLens(birthDate) : null;
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
            <dd>{zodiacNames[locale][signIds[lens.signIndex] ?? 'capricorn']}</dd>
          </div>
          <div>
            <dt>{copy.element}</dt>
            <dd>{copy.elements[lens.element]}</dd>
          </div>
          <div>
            <dt>{copy.modality}</dt>
            <dd>{copy.modalities[lens.modality]}</dd>
          </div>
          <div className={styles.numberFact}>
            <dt>{copy.number}</dt>
            <dd>{lens.number}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
