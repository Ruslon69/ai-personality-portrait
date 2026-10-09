import { sourcesCopy } from '../data/sources-copy';
import { Badge, Container, Stack, Surface, Typography } from '@shared/ui';
import type { PersonalityProfileSource, ProfileLocale } from '@entities/personality-profile';

import { ExpandableReportCard } from '../components/ExpandableReportCard';
import styles from './ReportSections.module.css';

type SourcesSectionProps = {
  isExpanded: (id: string) => boolean;
  items: readonly PersonalityProfileSource[];
  locale?: ProfileLocale;
  contentLocale?: ProfileLocale;
  onToggle: (id: string) => void;
};

export function SourcesSection({
  isExpanded,
  items,
  locale = 'ru',
  contentLocale = locale,
  onToggle,
}: SourcesSectionProps) {
  const labels = sourcesCopy[locale];
  return (
    <section aria-labelledby="sources-section-title" className={styles.sourcesSection}>
      <Container size="wide">
        <Surface className={styles.sourcesSurface} elevation="low">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                {labels.eyebrow}
              </Typography>
              <Typography as="h2" id="sources-section-title" variant="heading-lg">
                {labels.title}
              </Typography>
              <Typography className={styles.muted}>{labels.description}</Typography>
            </Stack>

            <div className={styles.sourceGrid}>
              {items.map((item) => (
                <div className={styles.sourceItem} key={item.id}>
                  <Badge
                    className={styles.sourceStatus}
                    tone={item.status === 'omitted' ? 'neutral' : 'info'}
                  >
                    {labels.status[item.status]}
                  </Badge>
                  <ExpandableReportCard
                    contentLocale={contentLocale}
                    expanded={isExpanded(`source:${item.id}`)}
                    item={{
                      description: item.description,
                      details: item.details,
                      id: `source:${item.id}`,
                      title: item.label,
                    }}
                    locale={locale}
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
