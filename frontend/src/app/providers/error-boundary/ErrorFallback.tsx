import { useEffect } from 'react';

import { Button, Stack, Surface, Typography } from '@shared/ui';
import type { Locale } from '@shared/i18n/types';

import { errorFallbackCopy, getErrorFallbackLocale } from './error-fallback-localization';
import styles from './ErrorFallback.module.css';

export function ErrorFallback({ locale = getErrorFallbackLocale() }: { locale?: Locale }) {
  const copy = errorFallbackCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
              {copy.title}
            </Typography>
            <Typography>{copy.description}</Typography>
          </Stack>
          <Button onClick={() => window.location.reload()} prominence="primary" size="large">
            {copy.action}
          </Button>
        </Stack>
      </Surface>
    </main>
  );
}
