import { useEffect } from 'react';

import { useNotifications } from '@app/providers';
import { PersonalityReport } from '@features/personality-report';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { useDraftPortraitState } from '@store';

export function FullResultPage() {
  const { notify } = useNotifications();
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { currentProfile } = useDraftPortraitState();

  useEffect(() => {
    if (!currentProfile) {
      navigate(ROUTES.portrait, { replace: true });
    }
  }, [currentProfile, navigate]);

  if (!currentProfile) {
    return null;
  }

  return (
    <PersonalityReport
      onShare={() =>
        notify(
          locale === 'en'
            ? 'Sharing is not available in the local version yet.'
            : locale === 'uk'
              ? 'Публікація поки недоступна в локальній версії.'
              : 'Публикация пока недоступна в локальной версии.',
          'info',
        )
      }
      profile={currentProfile}
    />
  );
}
