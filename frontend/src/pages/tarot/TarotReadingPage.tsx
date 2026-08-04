import { journeyActions } from '@features/journey';
import { TarotReadingFlow } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function TarotReadingPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  return (
    <TarotReadingFlow
      locale={locale}
      onBack={() => navigate(ROUTES.tarot)}
      onComplete={(reading) => {
        journeyActions.recordReading(reading);
        navigate(ROUTES.tarotResult);
      }}
    />
  );
}
