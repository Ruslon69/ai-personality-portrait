import { useEffect } from 'react';

import { Button, Stack, Typography } from '@shared/ui';
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
      <section aria-labelledby="application-error-title" className={styles.panel} role="alert">
        <Stack align="start" className={styles.content} gap="lg">
          <Typography as="p" variant="eyebrow">
            Soul Arkana
          </Typography>
          <span aria-hidden="true" className={styles.star} />
          <Stack gap="sm">
            <Typography as="h1" id="application-error-title" variant="display">
              {copy.title}
            </Typography>
            <Typography>{copy.description}</Typography>
          </Stack>
          <Button onClick={() => window.location.reload()} prominence="primary" size="large">
            {copy.action}
          </Button>
        </Stack>
      </section>
    </main>
  );
}
