import { Container, Stack, Typography } from '@shared/ui';
import type { Insight, ProfileLocale } from '@entities/personality-profile';

import { ExplainCard } from '../components/ExplainCard';
import styles from './ReportSections.module.css';

type OverviewSectionProps = {
  expanded: boolean;
  item: Insight;
  locale?: ProfileLocale;
  onToggle: (id: string) => void;
};

export function OverviewSection({ expanded, item, locale = 'ru', onToggle }: OverviewSectionProps) {
  const copy = {
    es: ['Resumen', 'Tu resultado principal', 'Una mirada más amplia'],
    en: ['Overview', 'Your main result', 'The wider picture'],
    ru: ['Общий разбор', 'Главный вывод', 'Общая картина'],
    uk: ['Загальний розбір', 'Головний висновок', 'Загальна картина'],
  }[locale];
  return (
    <section aria-labelledby="overview-section-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy[0]}
            </Typography>
            <Typography as="h2" id="overview-section-title" variant="heading-lg">
              {copy[1]}
            </Typography>
          </Stack>
          <ExplainCard
            badge={copy[2]}
            expanded={expanded}
            insight={item}
            locale={locale}
            onToggle={onToggle}
            variant="featured"
          />
        </Stack>
      </Container>
    </section>
  );
}
