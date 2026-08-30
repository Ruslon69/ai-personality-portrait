import { useNotifications } from '@app/providers';
import { journeyActions, journeyPersistenceCopy } from '@features/journey';
import { tarotSessionActions, TarotReadingFlow } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function TarotReadingPage() {
  const { notify } = useNotifications();
  const { locale } = useI18n();
  const { navigate } = useRouter();
  return (
    <TarotReadingFlow
      locale={locale}
      onBack={() => navigate(ROUTES.tarot)}
      onComplete={(reading) => {
        const result = journeyActions.recordReading(reading);
        tarotSessionActions.saveReading(result.value);
        if (!result.persisted) notify(journeyPersistenceCopy[locale].saveFailed, 'error');
        navigate(ROUTES.tarotResult, { replace: true });
      }}
    />
  );
}
