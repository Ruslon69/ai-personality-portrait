import type { ConfidenceExplanation, ProfileLocale } from '@entities/personality-profile';

import styles from './Explainability.module.css';

type ConfidenceIndicatorProps = {
  confidence: ConfidenceExplanation;
  locale?: ProfileLocale;
};

export function ConfidenceIndicator({ confidence, locale = 'ru' }: ConfidenceIndicatorProps) {
  const label = locale === 'en' ? 'Confidence' : locale === 'uk' ? 'Впевненість' : 'Уверенность';
  return (
    <div className={styles.confidence} data-confidence={confidence.level}>
      <span className={styles.visuallyHidden}>
        {label}: {confidence.label}. {confidence.description}.
      </span>
      <span aria-hidden="true" className={styles.confidenceMark}>
        <span />
        <span />
        <span />
      </span>
      <span aria-hidden="true" className={styles.confidenceCopy}>
        <strong>{confidence.label}</strong>
        <span>{confidence.description}</span>
      </span>
    </div>
  );
}
