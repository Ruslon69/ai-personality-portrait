import { Container, Stack, Typography } from '@shared/ui';
import type { PersonalityRecommendation } from '@entities/personality-profile';

import { ExplainCard } from '../components/ExplainCard';
import styles from './ReportSections.module.css';

type RecommendationsSectionProps = {
  isExpanded: (id: string) => boolean;
  items: readonly PersonalityRecommendation[];
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
            <Typography as="p" variant="eyebrow">
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
            {items.map((item, index) => (
              <ExplainCard
                badge={item.actionLabel}
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
