import { BirthDateStep } from '@features/birth-date';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function BirthDatePage() {
  const { navigate } = useRouter();

  return (
    <BirthDateStep
      onBack={() => navigate(ROUTES.portraitVoice)}
      onComplete={() => navigate(ROUTES.portraitGenerating)}
    />
  );
}
