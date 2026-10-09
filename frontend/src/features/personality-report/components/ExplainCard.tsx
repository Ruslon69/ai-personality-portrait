import { explanationCopy } from './../data/explanation-copy';
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
  contentLocale?: ProfileLocale;
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
  contentLocale = locale,
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
  const copy = explanationCopy[locale];

  return (
    <Card
      aria-labelledby={titleId}
      className={classes}
      data-expanded={expanded || undefined}
      data-format={insight.format}
      data-variant={variant}
      style={style}
    >
      <Stack data-insight-layout gap="md">
        {badge ? (
          <Badge className={styles.cardBadge} tone="info">
            {badge}
          </Badge>
        ) : null}

        <Stack data-insight-intro gap="sm" lang={contentLocale}>
          <Typography
            as="h3"
            id={titleId}
            variant={variant === 'featured' ? 'heading-md' : 'heading-sm'}
          >
            {insight.title}
          </Typography>
          <Typography className={styles.insightDescription}>{insight.description}</Typography>
        </Stack>

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
          {expanded ? (
            <>
              {copy.live}: <span lang={contentLocale}>{insight.title}</span>
            </>
          ) : (
            ''
          )}
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
              <div className={styles.insightMeta} data-insight-meta="true">
                <div lang={contentLocale}>
                  <ConfidenceIndicator confidence={insight.confidence} locale={contentLocale} />
                </div>
                <div aria-label={copy.sourceLabel} className={styles.sourceList} role="group">
                  {insight.sources.map((source) => (
                    <SourceChip key={source.id} locale={locale} source={source} />
                  ))}
                </div>
              </div>
              <ExplanationSection id={explanationTitleId} title={copy.why}>
                <Typography className={styles.explanationCopy} lang={contentLocale}>
                  {insight.explanation}
                </Typography>
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
                      <ul className={styles.evidenceList} lang={contentLocale}>
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
                  <div className={styles.recommendation} lang={contentLocale}>
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
