import { revealCopy } from './../data/reveal-copy';
import type { ProfileLocale } from '@entities/personality-profile';
import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './ResultReveal.module.css';

type Props = {
  opened: boolean;
  onOpen: () => void;
  profile: PersonalityProfile;
  locale?: ProfileLocale;
};

export function ResultReveal({ opened, onOpen, profile, locale = profile.locale }: Props) {
  const copy = revealCopy[locale];
  const open = () => {
    onOpen();
    focusElementByIdOnNextFrame('summary-title');
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
                  lang={profile.locale}
                  id="full-report-title"
                  tabIndex={-1}
                  variant="display"
                >
                  {profile.revealHeadline}
                </Typography>
                <Typography className={styles.lead} lang={profile.locale} variant="lead">
                  {profile.revealLead}
                </Typography>
              </Stack>
              {!opened ? (
                <Button onClick={open} prominence="primary" size="large">
                  {copy.open}
                  <span aria-hidden="true"> →</span>
                </Button>
              ) : null}
            </Stack>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
