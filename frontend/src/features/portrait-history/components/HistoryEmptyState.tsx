import { Button, Stack, Surface, Typography } from '@shared/ui';

import styles from './PortraitHistory.module.css';

type HistoryEmptyStateProps = {
  onCreatePortrait: () => void;
};

export function HistoryEmptyState({ onCreatePortrait }: HistoryEmptyStateProps) {
  return (
    <Surface
      aria-labelledby="history-empty-title"
      className={styles.emptyState}
      elevation="low"
      role="status"
    >
      <Stack align="center" gap="md">
        <Typography as="h2" id="history-empty-title" tabIndex={-1} variant="heading-md">
          История пока пуста
        </Typography>
        <Typography className={styles.muted}>
          Создайте новый портрет, чтобы результат появился здесь.
        </Typography>
        <Button className={styles.primaryButton} onClick={onCreatePortrait}>
          Создать портрет
        </Button>
      </Stack>
    </Surface>
  );
}
