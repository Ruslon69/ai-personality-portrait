import { TarotLanding, useTarotSession } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';

export function TarotPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { actions } = useTarotSession();
  return (
    <TarotLanding
      locale={locale}
      onStart={(spread) => {
        actions.chooseSpread(spread.id);
        navigate(ROUTES.tarotReading);
      }}
    />
  );
}
