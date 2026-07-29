import { PortraitGenerating } from '@features/portrait-generation';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function GeneratingPage() {
  const { navigate } = useRouter();

  return (
    <PortraitGenerating
      onComplete={() => navigate(ROUTES.portraitResultPreview, { replace: true })}
    />
  );
}
