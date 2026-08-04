import { useMemo, useState } from 'react';

import type { PersonalityProfile } from '@entities/personality-profile';
import { removePortraitById } from '../utils';

export function usePortraitHistory(initialItems: readonly PersonalityProfile[]) {
  const [items, setItems] = useState<readonly PersonalityProfile[]>(() => [...initialItems]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [lastRemovedId, setLastRemovedId] = useState<string | null>(null);
  const pendingDeleteItem = useMemo(
    () => items.find((item) => item.id === pendingDeleteId) ?? null,
    [items, pendingDeleteId],
  );

  const requestDelete = (portraitId: string) => {
    setPendingDeleteId(portraitId);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteItem) {
      return;
    }

    setItems((current) => removePortraitById(current, pendingDeleteItem.id));
    setAnnouncement(
      `Портрет «${pendingDeleteItem.title}» скрыт из локальной истории до обновления страницы.`,
    );
    setLastRemovedId(pendingDeleteItem.id);
    setPendingDeleteId(null);
  };

  return {
    announcement,
    cancelDelete,
    confirmDelete,
    items,
    lastRemovedId,
    pendingDeleteItem,
    requestDelete,
  };
}
