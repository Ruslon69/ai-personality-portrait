import type { PersonalityProfile } from '@entities/personality-profile';
import { PortraitResultBoundary } from '@features/personality-report';
import { ResultPreview } from '@features/result-preview';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n, type Locale } from '@shared/i18n';
import { useDraftPortraitState } from '@store';

export function ResultPreviewPageContent({
  locale,
  onOpenFullResult,
  profile,
}: {
  locale: Locale;
  onOpenFullResult: () => void;
  profile: PersonalityProfile | null;
}) {
  return (
    <PortraitResultBoundary locale={locale} profile={profile}>
      {(availableProfile) => (
        <ResultPreview onOpenFullResult={onOpenFullResult} profile={availableProfile} />
      )}
    </PortraitResultBoundary>
  );
}

export function ResultPreviewPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { currentProfile } = useDraftPortraitState();

  return (
    <ResultPreviewPageContent
      locale={locale}
      onOpenFullResult={() => navigate(ROUTES.portraitResult)}
      profile={currentProfile}
    />
  );
}
