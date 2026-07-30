import { Container, Stack, Surface, Typography } from '@shared/ui';

import { ExpandableReportCard } from '../components/ExpandableReportCard';
import type { ReportNarrativeSection } from '../types';
import styles from './ReportSections.module.css';

type NarrativeSectionProps = {
  isExpanded: (id: string) => boolean;
  onToggle: (id: string) => void;
  section: ReportNarrativeSection;
};

export function NarrativeSection({ isExpanded, onToggle, section }: NarrativeSectionProps) {
  const titleId = `${section.id}-section-title`;

  return (
    <section aria-labelledby={titleId} className={styles.section}>
      <Container size="wide">
        <Surface className={styles.narrativeSurface}>
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                {section.eyebrow}
              </Typography>
              <Typography as="h2" id={titleId} variant="heading-lg">
                {section.title}
              </Typography>
              <Typography className={styles.muted}>{section.description}</Typography>
            </Stack>

            <div className={styles.twoColumnGrid}>
              {section.items.map((item) => (
                <ExpandableReportCard
                  expanded={isExpanded(item.id)}
                  item={item}
                  key={item.id}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </Stack>
        </Surface>
      </Container>
    </section>
  );
}
