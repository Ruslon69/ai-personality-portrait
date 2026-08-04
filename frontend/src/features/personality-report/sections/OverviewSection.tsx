import { Container, Stack, Typography } from '@shared/ui';
import type { Insight } from '@entities/personality-profile';

import { ExplainCard } from '../components/ExplainCard';
import styles from './ReportSections.module.css';

type OverviewSectionProps = {
  expanded: boolean;
  item: Insight;
  onToggle: (id: string) => void;
};

export function OverviewSection({ expanded, item, onToggle }: OverviewSectionProps) {
  return (
    <section aria-labelledby="overview-section-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              Общий портрет
            </Typography>
            <Typography as="h2" id="overview-section-title" variant="heading-lg">
              Главная линия результата
            </Typography>
          </Stack>
          <ExplainCard
            badge="Общая картина"
            expanded={expanded}
            insight={item}
            onToggle={onToggle}
            variant="featured"
          />
        </Stack>
      </Container>
    </section>
  );
}
