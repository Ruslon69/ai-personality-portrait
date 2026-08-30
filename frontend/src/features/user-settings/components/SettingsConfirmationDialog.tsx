import { Button, Modal, Stack, Typography } from '@shared/ui';

import type { PendingSettingsAction } from '../types';
import type { UserSettingsCopy } from '../data';
import styles from './UserSettings.module.css';

type SettingsConfirmationDialogProps = {
  action: PendingSettingsAction | null;
  copy: UserSettingsCopy['dialog'];
  onCancel: () => void;
  onConfirm: () => void;
};

export function SettingsConfirmationDialog({
  action,
  copy,
  onCancel,
  onConfirm,
}: SettingsConfirmationDialogProps) {
  const confirmation = action?.action.confirmation;

  return (
    <Modal label={copy.label} onClose={onCancel} open={Boolean(action)}>
      <Stack gap="lg">
        <Stack gap="sm">
          <Typography as="h2" variant="heading-md">
            {confirmation?.title ?? copy.defaultTitle}
          </Typography>
          <Typography>{confirmation?.description ?? copy.defaultDescription}</Typography>
        </Stack>
        <div className={styles.dialogActions}>
          <Button autoFocus onClick={onCancel}>
            {copy.cancel}
          </Button>
          <Button onClick={onConfirm} prominence="danger">
            {confirmation?.confirmLabel ?? copy.confirm}
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
