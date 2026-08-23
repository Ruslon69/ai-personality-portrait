import { historySnapshotForRecord, useJourney } from '@features/journey';
import { TarotResult, useTarotSession } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button, Container, Stack, Typography } from '@shared/ui';

export function TarotResultPage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { state: journeyState } = useJourney();
  const { actions, state: sessionState } = useTarotSession();
  if (!sessionState.reading)
    return (
      <Container size="default">
        <Stack align="start" gap="lg">
          <Typography as="h1" variant="heading-lg">
            {locale === 'en'
              ? 'Create a reading first'
              : locale === 'uk'
                ? 'Спочатку створіть розклад'
                : 'Сначала создайте расклад'}
          </Typography>
          <Button onClick={() => navigate(ROUTES.tarot)} prominence="primary">
            {locale === 'en'
              ? 'Go to Tarot'
              : locale === 'uk'
                ? 'Перейти до Таро'
                : 'Перейти к Таро'}
          </Button>
        </Stack>
      </Container>
    );
  const savedRecord = journeyState.readings.find(
    (record) => record.reading.id === sessionState.reading?.id,
  );
  const savedSnapshot = savedRecord ? historySnapshotForRecord(savedRecord) : null;
  return (
    <TarotResult
      isSaved={Boolean(savedRecord)}
      locale={locale}
      onContinueJourney={() => navigate(ROUTES.profile)}
      onOpenHistory={() => navigate(ROUTES.tarotHistory)}
      onRestart={() => {
        actions.reset();
        navigate(ROUTES.tarot);
      }}
      reading={sessionState.reading}
      savedPresentation={
        savedSnapshot
          ? { headline: savedSnapshot.resultHeadline, motifs: savedSnapshot.motifs }
          : undefined
      }
    />
  );
}
