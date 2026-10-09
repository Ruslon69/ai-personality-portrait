import { useEffect, useState } from 'react';

import { Journey, dailyCardSectionId, focusDailyCard } from '@features/journey';
import { loadNumerologyBirthDate, numerologyResultSession } from '@features/numerology';
import { tarotSessionActions } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { useDraftPortraitState } from '@store';

export function ProfilePage() {
  const { navigate } = useRouter();
  const { currentProfile } = useDraftPortraitState();
  const { locale } = useI18n();
  const [birthDate] = useState(loadNumerologyBirthDate);

  useEffect(() => {
    if (window.location.hash === `#${dailyCardSectionId}`) {
      const frame = window.requestAnimationFrame(focusDailyCard);
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  return (
    <Journey
      locale={locale}
      hasNumerology={Boolean(birthDate)}
      numerologyUnsaved={numerologyResultSession.peek()?.persisted === false}
      onNavigate={navigate}
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
