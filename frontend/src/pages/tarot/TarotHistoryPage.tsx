import { TarotHistory } from '@features/journey';
import { tarotSessionActions } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function TarotHistoryPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  return (
    <TarotHistory
      locale={locale}
      onBack={() => navigate(ROUTES.tarot)}
      onCreate={() => navigate(ROUTES.tarot)}
      onOpenReading={(record) => {
        tarotSessionActions.saveReading(record.reading);
        navigate(ROUTES.tarotResult);
      }}
    />
  );
}
