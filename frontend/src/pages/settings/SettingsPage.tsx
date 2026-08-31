import { useNotifications } from '@app/providers';
import { journeyActions, journeyPersistenceCopy } from '@features/journey';
import { TarotPreferencesSection } from '@features/tarot';
import { getLocalizedUserSettingsData, UserSettings } from '@features/user-settings';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function SettingsPage() {
  const { notify } = useNotifications();
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const data = getLocalizedUserSettingsData(locale);
  return (
    <UserSettings
      appearanceOptions={data.appearanceOptions}
      locale={locale}
      tarotPreferences={
        <TarotPreferencesSection
          locale={locale}
          onBackToTarot={() => navigate(ROUTES.tarot)}
          onHistoryLimitChange={(limit) => {
            const result = journeyActions.setHistoryLimit(limit);
            if (!result.persisted)
              notify(journeyPersistenceCopy[locale].historyLimitFailed, 'error');
          }}
        />
      }
    />
  );
}
