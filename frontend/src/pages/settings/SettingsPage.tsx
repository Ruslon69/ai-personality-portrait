import { journeyActions } from '@features/journey';
import { TarotPreferencesSection } from '@features/tarot';
import {
  appearanceOptions,
  dangerZoneActions,
  demoCompatibilityInvitations,
  demoSettingsAccount,
  portraitDataActions,
  privacyConsentSettings,
  UserSettings,
} from '@features/user-settings';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function SettingsPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  return (
    <UserSettings
      account={demoSettingsAccount}
      appearanceOptions={appearanceOptions}
      dangerActions={dangerZoneActions}
      dataActions={portraitDataActions}
      initialInvitations={demoCompatibilityInvitations}
      privacyConsents={privacyConsentSettings}
      tarotPreferences={
        <TarotPreferencesSection
          locale={locale}
          onBackToTarot={() => navigate(ROUTES.tarot)}
          onHistoryLimitChange={journeyActions.setHistoryLimit}
        />
      }
    />
  );
}
