import { Badge, Container, Stack, Surface, Typography } from '@shared/ui';

import type { SettingsAccount } from '../types';
import styles from './UserSettingsSections.module.css';

type AccountSettingsSectionProps = {
  account: SettingsAccount;
};

export function AccountSettingsSection({ account }: AccountSettingsSectionProps) {
  return (
    <section aria-labelledby="account-settings-title" className={styles.section}>
      <Container size="wide">
        <Surface className={styles.accountSurface} elevation="low">
          <div className={styles.accountGrid}>
            <Stack gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Аккаунт
              </Typography>
              <Typography as="h2" id="account-settings-title" variant="heading-lg">
                Текущее состояние
              </Typography>
            </Stack>
            <Stack align="start" gap="sm">
              <Badge tone="neutral">{account.label}</Badge>
              <Typography className={styles.muted}>{account.description}</Typography>
              <Typography variant="caption">Регистрация на этом этапе не требуется.</Typography>
            </Stack>
          </div>
        </Surface>
      </Container>
    </section>
  );
}
