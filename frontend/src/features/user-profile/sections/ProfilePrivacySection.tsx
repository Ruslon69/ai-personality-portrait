import { Button, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './UserProfileSections.module.css';

type ProfilePrivacySectionProps = {
  onOpenSettings: () => void;
  reminder: string;
};

export function ProfilePrivacySection({ onOpenSettings, reminder }: ProfilePrivacySectionProps) {
  return (
    <section aria-labelledby="profile-privacy-title" className={styles.privacySection}>
      <Container size="wide">
        <Surface className={styles.privacySurface} elevation="low">
          <div className={styles.privacyGrid}>
            <Stack gap="sm">
              <Typography as="p" variant="eyebrow">
                Приватность
              </Typography>
              <Typography as="h2" id="profile-privacy-title" variant="heading-lg">
                Данные остаются под вашим контролем
              </Typography>
            </Stack>
            <Stack align="start" gap="md">
              <Typography className={styles.muted}>{reminder}</Typography>
              <Button onClick={onOpenSettings}>Открыть настройки</Button>
            </Stack>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
