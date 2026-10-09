import { journeyActions } from '@features/journey';
import { TarotPreferencesSection } from '@features/tarot';
import { getLocalizedUserSettingsData, UserSettings } from '@features/user-settings';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function SettingsPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const data = getLocalizedUserSettingsData(locale);
  return (
    <UserSettings
      appearanceOptions={data.appearanceOptions}
      locale={locale}
      onOpenHistory={() => navigate(ROUTES.tarotHistory)}
      onOpenPrivacy={() => navigate(ROUTES.privacy)}
      onOpenProfile={() => navigate(ROUTES.profile)}
      tarotPreferences={
        <TarotPreferencesSection
          locale={locale}
          onBackToTarot={() => navigate(ROUTES.tarot)}
          onHistoryLimitChange={(limit) => {
            const result = journeyActions.setHistoryLimit(limit);
            return result.persisted;
          }}
        />
      }
    />
  );
}
