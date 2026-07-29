import {
  appearanceOptions,
  dangerZoneActions,
  demoCompatibilityInvitations,
  demoSettingsAccount,
  portraitDataActions,
  privacyConsentSettings,
  UserSettings,
} from '@features/user-settings';

export function SettingsPage() {
  return (
    <UserSettings
      account={demoSettingsAccount}
      appearanceOptions={appearanceOptions}
      dangerActions={dangerZoneActions}
      dataActions={portraitDataActions}
      initialInvitations={demoCompatibilityInvitations}
      privacyConsents={privacyConsentSettings}
    />
  );
}
