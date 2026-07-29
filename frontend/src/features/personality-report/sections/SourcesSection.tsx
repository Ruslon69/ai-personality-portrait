import { Badge, Container, Stack, Surface, Typography } from '@shared/ui';

import { ExpandableReportCard } from '../components/ExpandableReportCard';
import type { ReportSource, ReportSourceStatus } from '../types';
import styles from './ReportSections.module.css';

type SourcesSectionProps = {
  isExpanded: (id: string) => boolean;
  items: readonly ReportSource[];
  onToggle: (id: string) => void;
};

const sourceStatusLabels: Record<ReportSourceStatus, string> = {
  included: 'Учтено',
  interpretation: 'Интерпретация',
  omitted: 'Не использовано',
};

export function SourcesSection({ isExpanded, items, onToggle }: SourcesSectionProps) {
  return (
    <section aria-labelledby="sources-section-title" className={styles.sourcesSection}>
      <Container size="wide">
        <Surface className={styles.sourcesSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Источники выводов
              </Typography>
              <Typography as="h2" id="sources-section-title" variant="heading-lg">
                Понятно, откуда берётся каждый слой
              </Typography>
              <Typography className={styles.muted}>
                Наблюдения, интерпретации и рекомендации не смешиваются в один безусловный вывод.
              </Typography>
            </Stack>

            <div className={styles.sourceGrid}>
              {items.map((item) => (
                <div className={styles.sourceItem} key={item.id}>
                  <Badge
                    className={styles.sourceStatus}
                    tone={item.status === 'omitted' ? 'neutral' : 'info'}
                  >
                    {sourceStatusLabels[item.status]}
                  </Badge>
                  <ExpandableReportCard
                    expanded={isExpanded(item.id)}
                    item={item}
                    onToggle={onToggle}
                  />
                </div>
              ))}
            </div>
          </Stack>
        </Surface>
      </Container>
    </section>
  );
}
