import { Journey } from '@features/journey';
import { tarotSessionActions } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { useDraftPortraitState } from '@store';

export function ProfilePage() {
  const { navigate } = useRouter();
  const { currentProfile } = useDraftPortraitState();
  const { locale } = useI18n();

  return (
    <Journey
      locale={locale}
      onExploreTarot={() => navigate(ROUTES.tarot)}
      onOpenLatestPortrait={() => navigate(ROUTES.portraitResult)}
      onOpenPath={() => navigate(ROUTES.profileHistory)}
      onOpenReading={(record) => {
        tarotSessionActions.saveReading(record.reading);
        navigate(ROUTES.tarotResult);
      }}
      profile={currentProfile}
    />
  );
}
