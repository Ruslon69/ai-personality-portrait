import { Badge, Button, Card, Stack, Typography } from '@shared/ui';

import type { PortraitHistoryItem } from '../types';
import { formatHistoryDate, getHistoryAccessLabel } from '../utils';
import styles from './PortraitHistory.module.css';

type HistoryItemCardProps = {
  item: PortraitHistoryItem;
  onDelete: (portraitId: string) => void;
  onOpen: (portraitId: string) => void;
};

export function HistoryItemCard({ item, onDelete, onOpen }: HistoryItemCardProps) {
  const titleId = `${item.id}-history-title`;

  return (
    <Card aria-labelledby={titleId} className={styles.historyCard}>
      <Stack gap="lg">
        <Stack gap="md">
          <Stack align="center" direction="row" justify="between" wrap>
            <Typography className={styles.muted} variant="caption">
              <time dateTime={item.createdAt}>{formatHistoryDate(item.createdAt)}</time>
            </Typography>
            <Badge tone={item.access === 'full' ? 'success' : 'neutral'}>
              {getHistoryAccessLabel(item.access)}
            </Badge>
          </Stack>
          <Stack gap="xs">
            <Typography as="h2" id={titleId} variant="heading-md">
              {item.title}
            </Typography>
            <Typography className={styles.keyPhrase}>{item.keyPhrase}</Typography>
          </Stack>
          <div aria-label="Использованные модули" className={styles.moduleList}>
            {item.modules.map((module) => (
              <Badge key={module} tone="info">
                {module}
              </Badge>
            ))}
          </div>
        </Stack>

        <div className={styles.cardActions}>
          <Button onClick={() => onOpen(item.id)}>Открыть</Button>
          <Button className={styles.deleteButton} onClick={() => onDelete(item.id)}>
            Удалить
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
