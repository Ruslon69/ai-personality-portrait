import { historySnapshotForRecord, useJourney } from '@features/journey';
import { tarotCopy, TarotResult, useTarotSession } from '@features/tarot';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './TarotResultPage.module.css';

export function TarotResultPage() {
  const { locale } = useI18n();
  const copy = tarotCopy[locale];
  const { navigate } = useRouter();
  const { actions: journeyActions, state: journeyState } = useJourney();
  const { actions, state: sessionState } = useTarotSession();
  if (!sessionState.reading)
    return (
      <section aria-labelledby="tarot-result-empty-title" className={styles.emptyState}>
        <Container size="default">
          <Surface className={styles.emptySurface} elevation="low">
            <Stack align="start" gap="lg">
              <Typography as="h1" id="tarot-result-empty-title" variant="heading-lg">
                {copy.missing}
              </Typography>
              <Typography className={styles.emptyDescription}>{copy.missingDescription}</Typography>
              <Button onClick={() => navigate(ROUTES.tarot)} prominence="primary">
                {copy.returnTarot}
              </Button>
            </Stack>
          </Surface>
        </Container>
      </section>
    );
  const savedRecord = journeyState.readings.find(
    (record) => record.reading.id === sessionState.reading?.id,
  );
  const savedSnapshot = savedRecord ? historySnapshotForRecord(savedRecord) : null;
  return (
    <TarotResult
      isSaved={journeyActions.isReadingPersisted(sessionState.reading.id)}
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
