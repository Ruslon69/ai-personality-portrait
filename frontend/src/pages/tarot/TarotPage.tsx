import {
  navigateToDailyCard,
  tarotStartDestination,
} from '@features/journey/lib/daily-card-contract';
import { TarotLanding, useTarotPreferences, useTarotSession } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function TarotPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { actions, state } = useTarotSession();
  const { preferences } = useTarotPreferences();
  return (
    <TarotLanding
      confirmNewReading={preferences.confirmNewReading}
      hasUnfinishedReading={state.inProgress && state.spreadId !== 'day'}
      locale={locale}
      onOpenHistory={() => navigate(ROUTES.tarotHistory)}
      onOpenSettings={() => navigate(ROUTES.settings)}
      onResume={() => navigate(ROUTES.tarotReading)}
      onStart={(spread) => {
        if (tarotStartDestination(spread.id) === ROUTES.profile) {
          navigateToDailyCard(navigate);
          return;
        }
        actions.chooseSpread(spread.id);
        navigate(ROUTES.tarotReading);
      }}
    />
  );
}
