import { MyPath } from '@features/journey';
import { tarotSessionActions } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { draftPortraitActions, useDraftPortraitState } from '@store';

export function HistoryPage() {
  const { navigate } = useRouter();
  const { profiles } = useDraftPortraitState();
  const { locale } = useI18n();

  const openPortrait = (portraitId: string) => {
    draftPortraitActions.selectProfile(portraitId);
    navigate(ROUTES.portraitResult);
  };

  return (
    <MyPath
      locale={locale}
      onBack={() => navigate(ROUTES.profile)}
      onExplore={() => navigate(ROUTES.tarot)}
      onOpenPortrait={(profile) => openPortrait(profile.id)}
      onOpenReading={(record) => {
        tarotSessionActions.saveReading(record.reading);
        navigate(ROUTES.tarotResult);
      }}
      profiles={profiles}
    />
  );
}
