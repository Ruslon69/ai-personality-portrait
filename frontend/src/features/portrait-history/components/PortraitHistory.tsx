import { useEffect } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { Button, Container, Stack, Typography } from '@shared/ui';

import { usePortraitHistory } from '../hooks';
import type { PortraitHistoryItem } from '../types';
import { HistoryDeleteDialog } from './HistoryDeleteDialog';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HistoryItemCard } from './HistoryItemCard';
import styles from './PortraitHistory.module.css';

type PortraitHistoryProps = {
  initialItems: readonly PortraitHistoryItem[];
  onBackToProfile: () => void;
  onCreatePortrait: () => void;
  onOpenPortrait: (portraitId: string) => void;
};

export function PortraitHistory({
  initialItems,
  onBackToProfile,
  onCreatePortrait,
  onOpenPortrait,
}: PortraitHistoryProps) {
  const {
    announcement,
    cancelDelete,
    confirmDelete,
    items,
    lastRemovedId,
    pendingDeleteItem,
    requestDelete,
  } = usePortraitHistory(initialItems);

  useEffect(() => focusElementByIdOnNextFrame('history-title'), []);

  useEffect(() => {
    if (!lastRemovedId) {
      return;
    }

    const targetId = items.length === 0 ? 'history-empty-title' : 'history-list-title';
    return focusElementByIdOnNextFrame(targetId);
  }, [items.length, lastRemovedId]);

  return (
    <div className={styles.root}>
      <section aria-labelledby="history-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <Stack gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Сохранённые результаты
              </Typography>
              <Typography as="h1" className={styles.heroTitle} id="history-title" tabIndex={-1}>
                История портретов
              </Typography>
              <Typography className={styles.heroLead}>
                Сравнивайте ключевые мысли и возвращайтесь к нужному результату.
              </Typography>
            </Stack>
            <Button onClick={onBackToProfile}>Вернуться в профиль</Button>
          </div>
        </Container>
      </section>

      <section aria-labelledby="history-list-title" className={styles.listSection}>
        <Container size="wide">
          {items.length > 0 ? (
            <Stack gap="lg">
              <Typography as="h2" id="history-list-title" tabIndex={-1} variant="heading-lg">
                Сохранённые портреты
              </Typography>
              <div className={styles.historyList}>
                {items.map((item) => (
                  <HistoryItemCard
                    item={item}
                    key={item.id}
                    onDelete={requestDelete}
                    onOpen={onOpenPortrait}
                  />
                ))}
              </div>
            </Stack>
          ) : (
            <HistoryEmptyState onCreatePortrait={onCreatePortrait} />
          )}
        </Container>
      </section>

      <p aria-atomic="true" aria-live="polite" className={styles.visuallyHidden} role="status">
        {announcement}
      </p>

      <HistoryDeleteDialog
        item={pendingDeleteItem}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
