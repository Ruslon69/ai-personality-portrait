import { useEffect } from 'react';
import {
  navigateToDailyCard,
  tarotStartDestination,
} from '@features/journey/lib/daily-card-contract';
import { useTarotSession } from '@features/tarot';
import { journeyActions } from '@features/journey';
import { tarotSessionActions, TarotReadingFlow } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function TarotReadingPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { state } = useTarotSession();
  useEffect(() => {
    if (tarotStartDestination(state.spreadId) === ROUTES.profile)
      navigateToDailyCard(navigate, true);
  }, [navigate, state.spreadId]);
  if (state.spreadId === 'day') return null;
  return (
    <TarotReadingFlow
      locale={locale}
      onBack={() => navigate(ROUTES.tarot)}
      onComplete={(reading) => {
        const result = journeyActions.recordReading(reading);
        tarotSessionActions.saveReading(result.value);
        // The result provides one persistent, localized and accessible save status.
        navigate(ROUTES.tarotResult, { replace: true });
      }}
    />
  );
}
