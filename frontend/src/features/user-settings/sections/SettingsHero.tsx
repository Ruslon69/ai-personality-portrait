import { Badge, Container, Stack, Typography } from '@shared/ui';

import styles from './UserSettingsSections.module.css';

export function SettingsHero() {
  return (
    <section aria-labelledby="settings-title" className={styles.hero}>
      <Container size="wide">
        <Stack className={styles.heroContent} gap="md">
          <Badge className={styles.badge} tone="info">
            Локальные настройки
          </Badge>
          <Typography as="h1" className={styles.heroTitle} id="settings-title" tabIndex={-1}>
            Настройки
          </Typography>
          <Typography className={styles.heroLead}>
            Управляйте оформлением, отдельными согласиями и демонстрационными данными. Кроме темы,
            изменения сбросятся после обновления страницы.
          </Typography>
        </Stack>
      </Container>
    </section>
  );
}
