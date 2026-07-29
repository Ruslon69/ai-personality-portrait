import { useEffect } from 'react';

import {
  AccountSettingsSection,
  AppearanceSettingsSection,
  CompatibilitySettingsSection,
  DangerZoneSection,
  DataManagementSection,
  PrivacySettingsSection,
  SettingsHero,
} from '../sections';
import { useUserSettings } from '../hooks';
import type {
  AppearanceOption,
  CompatibilityInvitation,
  SettingsAccount,
  SettingsAction,
  SettingsConsent,
} from '../types';
import { SettingsConfirmationDialog } from './SettingsConfirmationDialog';
import styles from './UserSettings.module.css';

type UserSettingsProps = {
  account: SettingsAccount;
  appearanceOptions: readonly AppearanceOption[];
  dangerActions: readonly SettingsAction[];
  dataActions: readonly SettingsAction[];
  initialInvitations: readonly CompatibilityInvitation[];
  privacyConsents: readonly SettingsConsent[];
};

export function UserSettings({
  account,
  appearanceOptions,
  dangerActions,
  dataActions,
  initialInvitations,
  privacyConsents,
}: UserSettingsProps) {
  const {
    announcement,
    cancelPendingAction,
    changeConsent,
    changeTheme,
    confirmPendingAction,
    consents,
    invitations,
    pendingAction,
    requestInvitationRevocation,
    runAction,
    theme,
  } = useUserSettings({ initialInvitations });

  useEffect(() => {
    window.requestAnimationFrame(() => document.getElementById('settings-title')?.focus());
  }, []);

  return (
    <div className={styles.root}>
      <SettingsHero />
      <AppearanceSettingsSection onChange={changeTheme} options={appearanceOptions} value={theme} />
      <DataManagementSection actions={dataActions} onAction={runAction} />
      <PrivacySettingsSection
        consents={consents}
        items={privacyConsents}
        onChange={changeConsent}
      />
      <CompatibilitySettingsSection
        invitations={invitations}
        onRevoke={requestInvitationRevocation}
      />
      <AccountSettingsSection account={account} />
      <DangerZoneSection actions={dangerActions} onAction={runAction} />

      <p aria-atomic="true" aria-live="polite" className={styles.visuallyHidden} role="status">
        {announcement}
      </p>

      <SettingsConfirmationDialog
        action={pendingAction}
        onCancel={cancelPendingAction}
        onConfirm={confirmPendingAction}
      />
    </div>
  );
}
