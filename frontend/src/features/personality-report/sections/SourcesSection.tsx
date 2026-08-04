import { Badge, Container, Stack, Surface, Typography } from '@shared/ui';
import type {
  PersonalityProfileSource,
  ProfileLocale,
  ProfileSourceStatus,
} from '@entities/personality-profile';

import { ExpandableReportCard } from '../components/ExpandableReportCard';
import styles from './ReportSections.module.css';

type SourcesSectionProps = {
  isExpanded: (id: string) => boolean;
  items: readonly PersonalityProfileSource[];
  locale?: ProfileLocale;
  onToggle: (id: string) => void;
};

const copy: Record<
  ProfileLocale,
  {
    description: string;
    eyebrow: string;
    status: Record<ProfileSourceStatus, string>;
    title: string;
  }
> = {
  en: {
    description: 'Observations, interpretations and recommendations remain separate.',
    eyebrow: 'Sources',
    status: { included: 'Included', interpretation: 'Interpretation', omitted: 'Not used' },
    title: 'See where every layer comes from',
  },
  ru: {
    description:
      'Наблюдения, интерпретации и рекомендации не смешиваются в один безусловный вывод.',
    eyebrow: 'Источники выводов',
    status: { included: 'Учтено', interpretation: 'Интерпретация', omitted: 'Не использовано' },
    title: 'Понятно, откуда берётся каждый слой',
  },
  uk: {
    description:
      'Спостереження, інтерпретації та рекомендації не змішуються в один безумовний висновок.',
    eyebrow: 'Джерела висновків',
    status: { included: 'Враховано', interpretation: 'Інтерпретація', omitted: 'Не використано' },
    title: 'Зрозуміло, звідки походить кожен шар',
  },
};

export function SourcesSection({
  isExpanded,
  items,
  locale = 'ru',
  onToggle,
}: SourcesSectionProps) {
  const labels = copy[locale];
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
