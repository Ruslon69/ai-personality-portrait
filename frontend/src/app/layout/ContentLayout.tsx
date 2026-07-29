import { useId } from 'react';

import { Container, Stack, Typography } from '@shared/ui';

import styles from './ContentLayout.module.css';
import type { ContentLayoutProps } from './ContentLayout.types';

export function ContentLayout({ children, description, title }: ContentLayoutProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={styles.root}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.introduction} gap="sm">
            <Typography as="h1" id={titleId} variant="heading-lg">
              {title}
            </Typography>
            <Typography>{description}</Typography>
          </Stack>
          {children}
        </Stack>
      </Container>
    </section>
  );
}
