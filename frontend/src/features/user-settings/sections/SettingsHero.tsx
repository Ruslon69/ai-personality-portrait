import { Badge, Container, Stack, Typography } from '@shared/ui';

import type { UserSettingsCopy } from '../data';
import styles from './UserSettingsSections.module.css';

export function SettingsHero({ copy }: { copy: UserSettingsCopy['hero'] }) {
  return (
    <section aria-labelledby="settings-title" className={styles.hero}>
      <Container size="wide">
        <Stack className={styles.heroContent} gap="lg">
          <Badge className={styles.badge} tone="info">
            {copy.badge}
          </Badge>
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
        </Stack>
      </Container>
    </section>
  );
}
