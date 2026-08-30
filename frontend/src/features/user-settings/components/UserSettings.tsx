import { useEffect, type ReactNode } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { Locale } from '@shared/i18n';

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
import { userSettingsCopy } from '../data';
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
  locale: Locale;
  privacyConsents: readonly SettingsConsent[];
  tarotPreferences: ReactNode;
};

export function UserSettings({
  account,
  appearanceOptions,
  dangerActions,
  dataActions,
  initialInvitations,
  locale,
  privacyConsents,
  tarotPreferences,
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
  } = useUserSettings({ initialInvitations, locale });
  const copy = userSettingsCopy[locale];

  useEffect(() => focusElementByIdOnNextFrame('settings-title'), []);

  return (
    <div className={styles.root}>
      <SettingsHero copy={copy.hero} />
      <AppearanceSettingsSection
        copy={copy.appearance}
        onChange={changeTheme}
        options={appearanceOptions}
        value={theme}
      />
      {tarotPreferences}
      <DataManagementSection actions={dataActions} copy={copy.data} onAction={runAction} />
      <PrivacySettingsSection
        consents={consents}
        copy={copy.privacy}
        items={privacyConsents}
        onChange={changeConsent}
      />
      <CompatibilitySettingsSection
        copy={copy.compatibility}
        invitations={invitations}
        locale={locale}
        onRevoke={requestInvitationRevocation}
      />
      <AccountSettingsSection account={account} copy={copy.account} />
      <DangerZoneSection actions={dangerActions} copy={copy.danger} onAction={runAction} />

      <p aria-atomic="true" aria-live="polite" className={styles.visuallyHidden} role="status">
        {announcement}
      </p>

      <SettingsConfirmationDialog
        action={pendingAction}
        copy={copy.dialog}
        onCancel={cancelPendingAction}
        onConfirm={confirmPendingAction}
      />
    </div>
  );
}
