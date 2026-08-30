import { useNotifications } from '@app/providers';
import type { PersonalityProfile } from '@entities/personality-profile';
import { PersonalityReport, PortraitResultBoundary } from '@features/personality-report';
import { useI18n, type Locale } from '@shared/i18n';
import { useDraftPortraitState } from '@store';

export function FullResultPageContent({
  locale,
  onShare,
  profile,
}: {
  locale: Locale;
  onShare: () => void;
  profile: PersonalityProfile | null;
}) {
  return (
    <PortraitResultBoundary locale={locale} profile={profile}>
      {(availableProfile) => <PersonalityReport onShare={onShare} profile={availableProfile} />}
    </PortraitResultBoundary>
  );
}

export function FullResultPage() {
  const { notify } = useNotifications();
  const { locale } = useI18n();
  const { currentProfile } = useDraftPortraitState();

  return (
    <FullResultPageContent
      locale={locale}
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
