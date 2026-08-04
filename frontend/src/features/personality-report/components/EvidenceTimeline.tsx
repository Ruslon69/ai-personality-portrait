import type { ProfileLocale, SourceReference } from '@entities/personality-profile';

import { SourceSymbol } from './SourceChip';
import styles from './Explainability.module.css';

type EvidenceTimelineProps = {
  hasRecommendation: boolean;
  locale?: ProfileLocale;
  sources: readonly SourceReference[];
};

export function EvidenceTimeline({
  hasRecommendation,
  locale = 'ru',
  sources,
}: EvidenceTimelineProps) {
  const copy = {
    en: { insight: 'Observation', recommendation: 'Recommendation', rule: 'Pattern rule' },
    ru: { insight: 'Наблюдение', recommendation: 'Рекомендация', rule: 'Правило паттерна' },
    uk: { insight: 'Спостереження', recommendation: 'Рекомендація', rule: 'Правило патерну' },
  }[locale];
  return (
    <div aria-hidden="true" className={styles.timeline}>
      {sources.map((source) => (
        <div className={styles.timelineNode} key={source.id}>
          <span className={styles.timelineSymbol}>
            <SourceSymbol source={source} />
          </span>
          <span>{source.shortLabel}</span>
        </div>
      ))}
      <div className={styles.timelineNode} data-node="engine">
        <span className={styles.timelineSymbol}>R</span>
        <span>{copy.rule}</span>
      </div>
      <div className={styles.timelineNode} data-node="insight">
        <span className={styles.timelineSymbol}>I</span>
        <span>{copy.insight}</span>
      </div>
      {hasRecommendation ? (
        <div className={styles.timelineNode} data-node="recommendation">
          <span className={styles.timelineSymbol}>→</span>
          <span>{copy.recommendation}</span>
        </div>
      ) : null}
    </div>
  );
}
