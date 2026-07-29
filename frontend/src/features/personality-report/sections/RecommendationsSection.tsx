import { Container, Stack, Typography } from '@shared/ui';

import { ExpandableReportCard } from '../components/ExpandableReportCard';
import type { ReportRecommendation } from '../types';
import styles from './ReportSections.module.css';

type RecommendationsSectionProps = {
  isExpanded: (id: string) => boolean;
  items: readonly ReportRecommendation[];
  onToggle: (id: string) => void;
};

export function RecommendationsSection({
  isExpanded,
  items,
  onToggle,
}: RecommendationsSectionProps) {
  return (
    <section aria-labelledby="recommendations-section-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" className={styles.eyebrow} variant="caption">
              Практические рекомендации
            </Typography>
            <Typography as="h2" id="recommendations-section-title" variant="heading-lg">
              Небольшие действия для реальных ситуаций
            </Typography>
            <Typography className={styles.muted}>
              Открывайте только те идеи, которые актуальны сейчас. Необязательно применять всё.
            </Typography>
          </Stack>

          <div className={styles.recommendationGrid}>
            {items.map((item) => (
              <ExpandableReportCard
                badge={item.actionLabel}
                expanded={isExpanded(item.id)}
                item={item}
                key={item.id}
                onToggle={onToggle}
              />
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}
