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
      hasUnfinishedReading={state.inProgress}
      locale={locale}
      onOpenHistory={() => navigate(ROUTES.tarotHistory)}
      onOpenSettings={() => navigate(ROUTES.settings)}
      onStart={(spread) => {
        actions.chooseSpread(spread.id);
        navigate(ROUTES.tarotReading);
      }}
    />
  );
}
