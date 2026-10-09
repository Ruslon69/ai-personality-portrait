import { ButtonLink, Container, Stack, Typography } from '@shared/ui';
import { ROUTES } from '@shared/config';

import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

export function SettingsHero({
  copy,
  onBack,
}: {
  copy: UserSettingsCopy['hero'];
  onBack?: () => void;
}) {
  return (
    <section aria-labelledby="settings-title" className={styles.hero}>
      <Container size="wide">
        <Stack className={styles.heroContent} gap="lg">
          <Typography as="p" className={styles.goldEyebrow} variant="eyebrow">
            {copy.badge}
          </Typography>
          <Stack gap="sm">
            <Typography
              as="h1"
              className={styles.heroTitle}
              id="settings-title"
              tabIndex={-1}
              variant="display"
            >
              {copy.title}
            </Typography>
            <Typography variant="lead">{copy.description}</Typography>
          </Stack>
          <ButtonLink
            className={styles.backLink}
            href={ROUTES.profile}
            onClick={(event) => {
              if (
                !onBack ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              onBack();
            }}
            prominence="quiet"
          >
            <span aria-hidden="true">←</span> {copy.back}
          </ButtonLink>
        </Stack>
      </Container>
    </section>
  );
}
