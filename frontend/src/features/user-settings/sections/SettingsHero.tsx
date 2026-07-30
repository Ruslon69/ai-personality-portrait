import { Badge, Container, Stack, Typography } from '@shared/ui';

import styles from './UserSettingsSections.module.css';

export function SettingsHero() {
  return (
    <section aria-labelledby="settings-title" className={styles.hero}>
      <Container size="wide">
        <Stack className={styles.heroContent} gap="lg">
          <Badge className={styles.badge} tone="info">
            Локальные настройки
          </Badge>
          <Stack gap="sm">
            <Typography
              as="h1"
              className={styles.heroTitle}
              id="settings-title"
              tabIndex={-1}
              variant="display"
            >
              Настройки
            </Typography>
            <Typography variant="lead">
              Управляйте оформлением, отдельными согласиями и демонстрационными данными. Кроме темы,
              изменения сбросятся после обновления страницы.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </section>
  );
}
