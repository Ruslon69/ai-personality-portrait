import { Badge, Button, Card, Stack, Typography } from '@shared/ui';
import type { ProfileLocale } from '@entities/personality-profile';

import styles from './ExpandableReportCard.module.css';

type ExpandableReportContent = {
  description: string;
  details: string;
  id: string;
  title: string;
};

type ExpandableReportCardProps = {
  badge?: string;
  className?: string;
  expanded: boolean;
  item: ExpandableReportContent;
  locale?: ProfileLocale;
  onToggle: (id: string) => void;
  variant?: 'default' | 'featured';
};

export function ExpandableReportCard({
  badge,
  className,
  expanded,
  item,
  locale = 'ru',
  onToggle,
  variant = 'default',
}: ExpandableReportCardProps) {
  const labels =
    locale === 'en'
      ? { collapse: 'Collapse', more: 'Details' }
      : locale === 'uk'
        ? { collapse: 'Згорнути', more: 'Докладніше' }
        : { collapse: 'Свернуть', more: 'Подробнее' };
  const titleId = `${item.id}-title`;
  const detailsId = `${item.id}-details`;
  const classes = [styles.card, className].filter(Boolean).join(' ');

  return (
    <Card aria-labelledby={titleId} className={classes} data-variant={variant}>
      <Stack gap="md">
        {badge ? (
          <Badge className={styles.badge} tone="info">
            {badge}
          </Badge>
        ) : null}
        <Stack gap="sm">
          <Typography
            as="h3"
            id={titleId}
            variant={variant === 'featured' ? 'heading-md' : 'heading-sm'}
          >
            {item.title}
          </Typography>
          <Typography className={styles.summary}>{item.description}</Typography>
        </Stack>

        <div
          aria-hidden={!expanded}
          className={styles.details}
          data-expanded={expanded || undefined}
          id={detailsId}
        >
          <div className={styles.detailsInner}>
            <Typography className={styles.detailsCopy}>{item.details}</Typography>
          </div>
        </div>

        <Button
          aria-controls={detailsId}
          aria-expanded={expanded}
          className={styles.toggle}
          onClick={() => onToggle(item.id)}
          prominence="quiet"
        >
          {expanded ? labels.collapse : labels.more}
        </Button>
      </Stack>
    </Card>
  );
}
