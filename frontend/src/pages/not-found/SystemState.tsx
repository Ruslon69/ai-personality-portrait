import { Container, Stack, Typography } from '@shared/ui';

import styles from './SystemState.module.css';

type SystemStateProps = {
  action?: React.ReactNode;
  code: string;
  description: string;
  title: string;
};

export function SystemState({ action, code, description, title }: SystemStateProps) {
  return (
    <section aria-labelledby="system-state-title" className={styles.root}>
      <Container size="wide">
        <Stack align="start" className={styles.content} gap="lg">
          <Typography as="p" className={styles.code}>
            {code}
          </Typography>
          <Stack gap="sm">
            <Typography as="h1" id="system-state-title" variant="display">
              {title}
            </Typography>
            <Typography className={styles.description} variant="lead">
              {description}
            </Typography>
          </Stack>
          {action}
        </Stack>
      </Container>
    </section>
  );
}
