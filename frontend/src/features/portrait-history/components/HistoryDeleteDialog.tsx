import { Button, Modal, Stack, Typography } from '@shared/ui';

import type { PortraitHistoryItem } from '../types';
import styles from './PortraitHistory.module.css';

type HistoryDeleteDialogProps = {
  item: PortraitHistoryItem | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function HistoryDeleteDialog({ item, onCancel, onConfirm }: HistoryDeleteDialogProps) {
  return (
    <Modal label="Подтверждение удаления портрета" onClose={onCancel} open={item !== null}>
      <Stack gap="lg">
        <Stack gap="sm">
          <Typography as="h2" variant="heading-md">
            Скрыть портрет из истории?
          </Typography>
          <Typography>
            {item
              ? `«${item.title}» исчезнет из списка только в этой вкладке. Реальные данные не удаляются.`
              : 'Выберите портрет для удаления.'}
          </Typography>
        </Stack>
        <div className={styles.dialogActions}>
          <Button autoFocus onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={onConfirm} prominence="danger">
            Скрыть из истории
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
