import { Container, Stack, Surface, Typography } from '@shared/ui';
import type { PersonalityNarrativeSection } from '@entities/personality-profile';

import { ExplainCard } from '../components/ExplainCard';
import styles from './ReportSections.module.css';

type NarrativeSectionProps = {
  isExpanded: (id: string) => boolean;
  onToggle: (id: string) => void;
  section: PersonalityNarrativeSection;
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
              {section.items.map((item, index) => (
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
        </Surface>
      </Container>
    </section>
  );
}
