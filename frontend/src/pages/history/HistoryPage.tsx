import { demoPortraitHistory, PortraitHistory } from '@features/portrait-history';
import { useRouter } from '@router';
import { ROUTES } from '@shared/config';

export function HistoryPage() {
  const { navigate } = useRouter();

  return (
    <PortraitHistory
      initialItems={demoPortraitHistory}
      onBackToProfile={() => navigate(ROUTES.profile)}
      onCreatePortrait={() => navigate(ROUTES.portrait)}
      onOpenPortrait={() => navigate(ROUTES.portraitResult)}
    />
  );
}
