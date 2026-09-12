import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';
import type { ProfileLocale } from '@entities/personality-profile';

import { formatReportDate } from '../utils';
import styles from './ReportSections.module.css';

type ReportHeroProps = {
  createdAt: string;
  greeting: string;
  introduction: string;
  locale?: ProfileLocale;
  onShare: () => void;
};

export function ReportHero({
  createdAt,
  greeting,
  introduction,
  locale = 'ru',
  onShare,
}: ReportHeroProps) {
  const copy = {
    en: [
      'Personal reflection',
      'Share full reflection',
      'Share',
      'Created',
      'Based on the sources you selected',
    ],
    ru: [
      'Личный разбор',
      'Поделиться полным разбором',
      'Поделиться',
      'Создан',
      'Основан на выбранных источниках',
    ],
    uk: [
      'Особистий розбір',
      'Поділитися повним розбором',
      'Поділитися',
      'Створено',
      'Ґрунтується на обраних джерелах',
    ],
  }[locale];
  return (
    <section aria-labelledby="full-report-title" className={styles.hero}>
      <Container size="wide">
        <Surface className={styles.heroSurface} elevation="low">
          <div className={styles.heroGrid}>
            <Stack align="start" gap="lg">
              <Badge tone="info">{copy[0]}</Badge>
              <Stack gap="sm">
                <Typography
                  as="h1"
                  className={styles.heroTitle}
                  id="full-report-title"
                  tabIndex={-1}
                  variant="display"
                >
                  {greeting}
                </Typography>
                <Typography className={styles.heroLead} variant="lead">
                  {introduction}
                </Typography>
              </Stack>
              <Button aria-label={copy[1]} onClick={onShare}>
                {copy[2]}
              </Button>
            </Stack>

            <Surface className={styles.dateCard} elevation="medium">
              <Stack gap="xs">
                <Typography as="p" variant="caption">
                  {copy[3]}
                </Typography>
                <Typography as="p" variant="heading-md">
                  <time dateTime={createdAt}>{formatReportDate(createdAt)}</time>
                </Typography>
                <Typography className={styles.muted} variant="caption">
                  {copy[4]}
                </Typography>
              </Stack>
            </Surface>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
