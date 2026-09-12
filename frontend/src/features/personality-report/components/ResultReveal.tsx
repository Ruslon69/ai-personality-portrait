import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './ResultReveal.module.css';

type Props = { opened: boolean; onOpen: () => void; profile: PersonalityProfile };

export function ResultReveal({ opened, onOpen, profile }: Props) {
  const copy = {
    en: {
      eyebrow: 'Your portrait is ready',
      symbol: 'Your personal abstract portrait mark',
      open: 'Open my portrait',
    },
    ru: {
      eyebrow: 'Ваш портрет готов',
      symbol: 'Ваш персональный абстрактный знак портрета',
      open: 'Открыть мой портрет',
    },
    uk: {
      eyebrow: 'Ваш портрет готовий',
      symbol: 'Ваш персональний абстрактний знак портрета',
      open: 'Відкрити мій портрет',
    },
  }[profile.locale];
  const open = () => {
    onOpen();
  };
  return (
    <section
      aria-labelledby="full-report-title"
      className={styles.root}
      data-opened={opened || undefined}
      data-ready
    >
      <Container size="wide">
        <Surface className={styles.surface} elevation="low">
          <div className={styles.grid}>
            <div className={styles.visual}>
              <PortraitMark
                className={styles.mark}
                identity={profile.visualIdentity}
                label={copy.symbol}
                size="lg"
              />
            </div>
            <Stack align="start" className={styles.content} gap="lg">
              <Badge tone="success">{copy.eyebrow}</Badge>
              <Stack gap="md">
                <Typography
                  as="h1"
                  className={styles.title}
                  id="full-report-title"
                  tabIndex={-1}
                  variant="display"
                >
                  {profile.revealHeadline}
                </Typography>
                <Typography className={styles.lead} variant="lead">
                  {profile.revealLead}
                </Typography>
              </Stack>
              <Button onClick={open} prominence="primary" size="large">
                {copy.open}
                <span aria-hidden="true"> →</span>
              </Button>
            </Stack>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
