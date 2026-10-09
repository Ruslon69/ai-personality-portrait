import { Button, Container, Stack, Surface, Typography } from '@shared/ui';
import type { ProfileLocale } from '@entities/personality-profile';

import styles from './UserProfileSections.module.css';

type ProfilePrivacySectionProps = {
  locale: ProfileLocale;
  onOpenSettings: () => void;
  reminder: string;
};

export function ProfilePrivacySection({
  locale,
  onOpenSettings,
  reminder,
}: ProfilePrivacySectionProps) {
  const copy = {
    es: ['Privacidad', 'Tú decides sobre tus datos', 'Abrir ajustes'],
    en: ['Privacy', 'Your data stays under your control', 'Open settings'],
    ru: ['Приватность', 'Данные остаются под вашим контролем', 'Открыть настройки'],
    uk: ['Приватність', 'Дані залишаються під вашим контролем', 'Відкрити налаштування'],
  }[locale];
  return (
    <section aria-labelledby="profile-privacy-title" className={styles.privacySection}>
      <Container size="wide">
        <Surface className={styles.privacySurface} elevation="low">
          <div className={styles.privacyGrid}>
            <Stack gap="sm">
              <Typography as="p" variant="eyebrow">
                {copy[0]}
              </Typography>
              <Typography as="h2" id="profile-privacy-title" variant="heading-lg">
                {copy[1]}
              </Typography>
            </Stack>
            <Stack align="start" gap="md">
              <Typography className={styles.muted}>{reminder}</Typography>
              <Button onClick={onOpenSettings}>{copy[2]}</Button>
            </Stack>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
