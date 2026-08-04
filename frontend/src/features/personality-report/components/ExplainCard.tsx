import type { CSSProperties } from 'react';

import type { Insight, ProfileLocale } from '@entities/personality-profile';
import { Badge, Button, Card, Stack, Typography } from '@shared/ui';

import { ConfidenceIndicator } from './ConfidenceIndicator';
import { EvidenceTimeline } from './EvidenceTimeline';
import { ExplanationSection } from './ExplanationSection';
import { SourceChip } from './SourceChip';
import styles from './Explainability.module.css';

type ExplainCardProps = {
  badge?: string;
  className?: string;
  expanded: boolean;
  insight: Insight;
  locale?: ProfileLocale;
  onToggle: (id: string) => void;
  order?: number;
  variant?: 'default' | 'featured';
};

export function ExplainCard({
  badge,
  className,
  expanded,
  insight,
  locale = 'ru',
  onToggle,
  order = 0,
  variant = 'default',
}: ExplainCardProps) {
  const titleId = `${insight.id}-title`;
  const detailsId = `${insight.id}-explanation`;
  const explanationTitleId = `${insight.id}-why-title`;
  const evidenceTitleId = `${insight.id}-evidence-title`;
  const recommendationTitleId = `${insight.id}-recommendation-title`;
  const classes = [styles.explainCard, className].filter(Boolean).join(' ');
  const style = { '--insight-delay': `${Math.min(order, 5) * 55}ms` } as CSSProperties;
  const copy = {
    en: {
      collapse: 'Hide explanation',
      deep: 'More about how it was formed',
      evidence: 'Supporting signals',
      evidenceMany: (count: number) => `${count} related signals`,
      evidenceOne: 'One related signal',
      live: 'Explanation opened',
      recommendation: 'A practical next step',
      sourceLabel: 'Observation sources',
      toggle: 'Why this observation?',
      why: 'Why did this observation appear?',
    },
    ru: {
      collapse: 'Скрыть объяснение',
      deep: 'Подробнее о формировании',
      evidence: 'Поддерживающие сигналы',
      evidenceMany: (count: number) => `${count} связанных сигнала`,
      evidenceOne: 'Один связанный сигнал',
      live: 'Объяснение раскрыто',
      recommendation: 'Практический следующий шаг',
      sourceLabel: 'Источники наблюдения',
      toggle: 'Почему такой вывод?',
      why: 'Почему появилось это наблюдение?',
    },
    uk: {
      collapse: 'Сховати пояснення',
      deep: 'Докладніше про формування',
      evidence: 'Підтримувальні сигнали',
      evidenceMany: (count: number) => `${count} пов’язані сигнали`,
      evidenceOne: 'Один пов’язаний сигнал',
      live: 'Пояснення відкрито',
      recommendation: 'Практичний наступний крок',
      sourceLabel: 'Джерела спостереження',
      toggle: 'Чому такий висновок?',
      why: 'Чому з’явилося це спостереження?',
    },
  }[locale];

  return (
    <Card
      aria-labelledby={titleId}
      className={classes}
      data-expanded={expanded || undefined}
      data-format={insight.format}
      data-variant={variant}
      style={style}
    >
      <Stack gap="md">
        <div aria-hidden="true" className={styles.insightMotif}>
          <i />
          <i />
          <i />
          <span />
        </div>
        {badge ? (
          <Badge className={styles.cardBadge} tone="info">
            {badge}
          </Badge>
        ) : null}

        <Stack gap="sm">
          <Typography
            as="h3"
            id={titleId}
            variant={variant === 'featured' ? 'heading-md' : 'heading-sm'}
          >
            {insight.title}
          </Typography>
          <Typography className={styles.insightDescription}>{insight.description}</Typography>
        </Stack>

        <div className={styles.insightMeta}>
          <ConfidenceIndicator confidence={insight.confidence} locale={locale} />
          <div aria-label={copy.sourceLabel} className={styles.sourceList} role="group">
            {insight.sources.map((source) => (
              <SourceChip key={source.id} locale={locale} source={source} />
            ))}
          </div>
        </div>

        <Button
          aria-controls={detailsId}
          aria-expanded={expanded}
          className={styles.explainToggle}
          onClick={() => onToggle(insight.id)}
          prominence="quiet"
        >
          {expanded ? copy.collapse : copy.toggle}
          <span aria-hidden="true" className={styles.toggleIcon}>
            ↓
          </span>
        </Button>

        <span aria-atomic="true" aria-live="polite" className={styles.visuallyHidden} role="status">
          {expanded ? `${copy.live}: «${insight.title}»` : ''}
        </span>

        <div
          aria-hidden={!expanded}
          className={styles.explanation}
          data-expanded={expanded || undefined}
          id={detailsId}
          inert={!expanded ? true : undefined}
        >
          <div className={styles.explanationInner}>
            <div className={styles.explanationContent}>
              <ExplanationSection id={explanationTitleId} title={copy.why}>
                <Typography className={styles.explanationCopy}>{insight.explanation}</Typography>
              </ExplanationSection>

              <ExplanationSection id={evidenceTitleId} title={copy.evidence}>
                <div className={styles.evidenceGroups}>
                  {insight.evidenceGroups.map((group) => (
                    <article className={styles.evidenceGroup} key={group.id}>
                      <div className={styles.evidenceGroupTitle}>
                        <SourceChip locale={locale} source={group.source} />
                        <Typography as="h5" variant="caption">
                          {group.evidence.length === 1
                            ? copy.evidenceOne
                            : copy.evidenceMany(group.evidence.length)}
                        </Typography>
                      </div>
                      <ul className={styles.evidenceList}>
                        {group.evidence.map((evidence) => (
                          <li key={evidence.id}>
                            <strong>{evidence.title}</strong>
                            <span>{evidence.description}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </ExplanationSection>

              <details className={styles.deepDetails}>
                <summary>{copy.deep}</summary>
                <div className={styles.timelineBlock}>
                  <EvidenceTimeline
                    hasRecommendation={Boolean(insight.recommendation)}
                    locale={locale}
                    sources={insight.sources}
                  />
                </div>
              </details>

              {insight.recommendation ? (
                <ExplanationSection id={recommendationTitleId} title={copy.recommendation}>
                  <div className={styles.recommendation}>
                    <Typography as="h5" variant="heading-sm">
                      {insight.recommendation.title}
                    </Typography>
                    <Typography>{insight.recommendation.description}</Typography>
                  </div>
                </ExplanationSection>
              ) : null}
            </div>
          </div>
        </div>
      </Stack>
    </Card>
  );
}
