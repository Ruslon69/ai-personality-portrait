import { ResultPreview } from '@features/result-preview';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';

export function ResultPreviewPage() {
  const { navigate } = useRouter();

  return <ResultPreview onOpenFullResult={() => navigate(ROUTES.portraitResult)} />;
}
