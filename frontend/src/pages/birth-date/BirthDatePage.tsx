import { DraftPortraitBirthDateStep } from '@features/birth-date';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function BirthDatePage() {
  const { navigate } = useRouter();

  return (
    <DraftPortraitBirthDateStep
      onBack={() => navigate(ROUTES.portraitQuestions)}
      onComplete={() => navigate(ROUTES.portraitGenerating)}
    />
  );
}
