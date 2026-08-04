import { useEffect } from 'react';

import { ResultPreview } from '@features/result-preview';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useDraftPortraitState } from '@store';

export function ResultPreviewPage() {
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
    <ResultPreview
      onOpenFullResult={() => navigate(ROUTES.portraitResult)}
      profile={currentProfile}
    />
  );
}
