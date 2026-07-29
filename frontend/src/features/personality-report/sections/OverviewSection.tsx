import { Container, Stack, Typography } from '@shared/ui';

import { ExpandableReportCard } from '../components/ExpandableReportCard';
import type { ReportCardItem } from '../types';
import styles from './ReportSections.module.css';

type OverviewSectionProps = {
  expanded: boolean;
  item: ReportCardItem;
  onToggle: (id: string) => void;
};

export function OverviewSection({ expanded, item, onToggle }: OverviewSectionProps) {
  return (
    <section aria-labelledby="overview-section-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" className={styles.eyebrow} variant="caption">
              Общий портрет
            </Typography>
            <Typography as="h2" id="overview-section-title" variant="heading-lg">
              Главная линия результата
            </Typography>
          </Stack>
          <ExpandableReportCard
            badge="Общая картина"
            expanded={expanded}
            item={item}
            onToggle={onToggle}
            variant="featured"
          />
        </Stack>
      </Container>
    </section>
  );
}
