import { Button, Modal, Stack, Typography } from '@shared/ui';

import type { PendingSettingsAction } from '../types';
import styles from './UserSettings.module.css';

type SettingsConfirmationDialogProps = {
  action: PendingSettingsAction | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SettingsConfirmationDialog({
  action,
  onCancel,
  onConfirm,
}: SettingsConfirmationDialogProps) {
  const confirmation = action?.action.confirmation;

  return (
    <Modal label="Подтверждение действия с данными" onClose={onCancel} open={Boolean(action)}>
      <Stack gap="lg">
        <Stack gap="sm">
          <Typography as="h2" variant="heading-md">
            {confirmation?.title ?? 'Подтвердите действие'}
          </Typography>
          <Typography>
            {confirmation?.description ?? 'Это действие ожидает подтверждения.'}
          </Typography>
        </Stack>
        <div className={styles.dialogActions}>
          <Button autoFocus onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={onConfirm} prominence="danger">
            {confirmation?.confirmLabel ?? 'Подтвердить'}
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
