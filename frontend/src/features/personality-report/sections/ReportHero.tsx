import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import { formatReportDate } from '../utils';
import styles from './ReportSections.module.css';

type ReportHeroProps = {
  createdAt: string;
  greeting: string;
  introduction: string;
  onShare: () => void;
};

export function ReportHero({ createdAt, greeting, introduction, onShare }: ReportHeroProps) {
  return (
    <section aria-labelledby="full-report-title" className={styles.hero}>
      <Container size="wide">
        <Surface className={styles.heroSurface} elevation="low">
          <div className={styles.heroGrid}>
            <Stack align="start" gap="lg">
              <Badge tone="info">Демонстрационный портрет</Badge>
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
              <Button aria-label="Поделиться полным портретом" onClick={onShare}>
                Поделиться
              </Button>
            </Stack>

            <Surface className={styles.dateCard} elevation="medium">
              <Stack gap="xs">
                <Typography as="p" variant="caption">
                  Дата создания
                </Typography>
                <Typography as="p" variant="heading-md">
                  <time dateTime={createdAt}>{formatReportDate(createdAt)}</time>
                </Typography>
                <Typography className={styles.muted} variant="caption">
                  Локальные демонстрационные данные
                </Typography>
              </Stack>
            </Surface>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
