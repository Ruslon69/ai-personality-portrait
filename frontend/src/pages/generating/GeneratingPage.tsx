import { DraftPortraitGenerating } from '@features/portrait-generation';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function GeneratingPage() {
  const { navigate } = useRouter();

  return (
    <DraftPortraitGenerating
      onComplete={() => navigate(ROUTES.portraitResultPreview, { replace: true })}
      onInsufficientData={() => navigate(ROUTES.portraitQuestions, { replace: true })}
    />
  );
}
