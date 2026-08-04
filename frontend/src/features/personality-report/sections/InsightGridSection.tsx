import { Container, Stack, Typography } from '@shared/ui';
import type { Insight } from '@entities/personality-profile';

import { ExplainCard } from '../components/ExplainCard';
import styles from './ReportSections.module.css';

type InsightGridSectionProps = {
  description: string;
  eyebrow: string;
  id: string;
  isExpanded: (id: string) => boolean;
  items: readonly Insight[];
  onToggle: (id: string) => void;
  title: string;
};

export function InsightGridSection({
  description,
  eyebrow,
  id,
  isExpanded,
  items,
  onToggle,
  title,
}: InsightGridSectionProps) {
  const titleId = `${id}-section-title`;

  return (
    <section aria-labelledby={titleId} className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {eyebrow}
            </Typography>
            <Typography as="h2" id={titleId} variant="heading-lg">
              {title}
            </Typography>
            <Typography className={styles.muted}>{description}</Typography>
          </Stack>

          <div className={styles.cardGrid}>
            {items.map((item, index) => (
              <ExplainCard
                expanded={isExpanded(item.id)}
                insight={item}
                key={item.id}
                onToggle={onToggle}
                order={index}
              />
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}
