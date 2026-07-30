import { Button, Stack, Surface, Typography } from '@shared/ui';

import styles from './ErrorFallback.module.css';

export function ErrorFallback() {
  return (
    <main className={styles.root}>
      <Surface
        aria-labelledby="application-error-title"
        className={styles.panel}
        elevation="low"
        role="alert"
      >
        <Stack align="start" gap="lg">
          <Stack gap="sm">
            <Typography as="h1" id="application-error-title" variant="heading-lg">
              Не удалось открыть приложение
            </Typography>
            <Typography>
              Обновите страницу. Локальные данные текущего прохождения могут быть сброшены.
            </Typography>
          </Stack>
          <Button onClick={() => window.location.reload()} prominence="primary" size="large">
            Обновить страницу
          </Button>
        </Stack>
      </Surface>
    </main>
  );
}
