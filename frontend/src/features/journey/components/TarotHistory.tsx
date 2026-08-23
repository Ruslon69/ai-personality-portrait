import { useMemo, useState } from 'react';

import { TarotCardView, tarotCardById } from '@features/tarot';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Modal, Stack, Typography } from '@shared/ui';

import { tarotHistoryCopy } from '../data';
import { useJourney } from '../hooks';
import { historySnapshotForRecord } from '../lib';
import type { JourneyReadingRecord } from '../types';
import styles from './TarotHistory.module.css';

type PendingAction = { kind: 'clear' } | { kind: 'delete'; record: JourneyReadingRecord } | null;

export function TarotHistory({
  locale,
  onBack,
  onCreate,
  onOpenReading,
}: {
  locale: Locale;
  onBack: () => void;
  onCreate: () => void;
  onOpenReading: (record: JourneyReadingRecord) => void;
}) {
  const { actions, state } = useJourney();
  const copy = tarotHistoryCopy[locale];
  const [announcement, setAnnouncement] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const records = useMemo(
    () =>
      [...state.readings].sort(
        (left, right) =>
          right.savedAt.localeCompare(left.savedAt) ||
          left.reading.id.localeCompare(right.reading.id),
      ),
    [state.readings],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : locale === 'en' ? 'en-GB' : 'ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  );

  function confirmAction() {
    if (pendingAction?.kind === 'delete') {
      actions.deleteReading(pendingAction.record.reading.id);
      setAnnouncement(copy.removed);
    } else if (pendingAction?.kind === 'clear') {
      actions.clearReadings();
      setAnnouncement(copy.clearDescription);
    }
    setPendingAction(null);
  }

  const pendingTitle =
    pendingAction?.kind === 'delete'
      ? historySnapshotForRecord(pendingAction.record).spreadTitle
      : '';

  return (
    <div className={styles.root}>
      <section aria-labelledby="tarot-history-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <Stack gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h1" id="tarot-history-title" variant="display">
                {copy.title}
              </Typography>
              <Typography className={styles.heroLead} variant="lead">
                {copy.localOnly}
              </Typography>
            </Stack>
            <Button onClick={onBack} prominence="secondary">
              {copy.back}
            </Button>
          </div>
        </Container>
      </section>

      <section aria-labelledby="saved-readings-title" className={styles.section}>
        <Container size="wide">
          {records.length ? (
            <Stack gap="lg">
              <div className={styles.listHeading}>
                <Typography as="h2" id="saved-readings-title" variant="heading-lg">
                  {copy.saved}
                </Typography>
                <Button onClick={() => setPendingAction({ kind: 'clear' })} prominence="quiet">
                  {copy.clear}
                </Button>
              </div>
              <ol className={styles.list}>
                {records.map((record) => {
                  const snapshot = historySnapshotForRecord(record);
                  const leadingSelection =
                    record.reading.selections.find(
                      (selection) => selection.cardId === record.reading.leadingCardId,
                    ) ?? record.reading.selections[0];
                  const leadingCard = tarotCardById.get(record.reading.leadingCardId);
                  return (
                    <li key={record.reading.id}>
                      <article className={styles.item}>
                        {leadingSelection ? (
                          <div className={styles.thumbnail}>
                            <TarotCardView
                              isRevealed
                              locale={locale}
                              selection={leadingSelection}
                              showPosition={false}
                              theme={record.reading.context.deckTheme}
                              variant="history"
                            />
                          </div>
                        ) : null}
                        <div className={styles.itemCopy}>
                          <div className={styles.itemMeta}>
                            <time dateTime={record.savedAt}>
                              {dateFormatter.format(new Date(record.savedAt))}
                            </time>
                            <span>{snapshot.spreadTitle}</span>
                            <span>{copy.cardCount(snapshot.selections.length)}</span>
                            {snapshot.topic ? <span>{copy.topics[snapshot.topic]}</span> : null}
                          </div>
                          <Typography as="h3" variant="heading-md">
                            {snapshot.resultHeadline}
                          </Typography>
                          <Typography className={styles.leadingCardName}>
                            {leadingCard?.name[locale]}
                          </Typography>
                          <div className={styles.motifs}>
                            {snapshot.motifs.slice(0, 3).map((motif) => (
                              <Badge key={motif} tone="neutral">
                                {motif}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className={styles.actions}>
                          <Button onClick={() => onOpenReading(record)} prominence="primary">
                            {copy.open}
                          </Button>
                          <Button
                            aria-label={`${copy.delete}: ${snapshot.spreadTitle}`}
                            onClick={() => setPendingAction({ kind: 'delete', record })}
                            prominence="quiet"
                          >
                            {copy.delete}
                          </Button>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </Stack>
          ) : (
            <div className={styles.empty}>
              <Stack align="center" gap="lg">
                <Typography as="h2" id="saved-readings-title" variant="heading-lg">
                  {copy.emptyTitle}
                </Typography>
                <Typography>{copy.emptyDescription}</Typography>
                <Button onClick={onCreate} prominence="primary">
                  {copy.create}
                </Button>
              </Stack>
            </div>
          )}
        </Container>
      </section>

      <p aria-atomic="true" aria-live="polite" className={styles.srOnly} role="status">
        {announcement}
      </p>

      <Modal
        label={pendingAction?.kind === 'clear' ? copy.clearTitle : copy.deleteTitle}
        onClose={() => setPendingAction(null)}
        open={pendingAction !== null}
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="h2" variant="heading-md">
              {pendingAction?.kind === 'clear' ? copy.clearTitle : copy.deleteTitle}
            </Typography>
            <Typography>
              {pendingAction?.kind === 'clear'
                ? copy.clearDescription
                : copy.deleteDescription(pendingTitle)}
            </Typography>
          </Stack>
          <div className={styles.dialogActions}>
            <Button autoFocus onClick={() => setPendingAction(null)}>
              {locale === 'en' ? 'Cancel' : locale === 'uk' ? 'Скасувати' : 'Отмена'}
            </Button>
            <Button onClick={confirmAction} prominence="danger">
              {pendingAction?.kind === 'clear' ? copy.clearConfirm : copy.deleteConfirm}
            </Button>
          </div>
        </Stack>
      </Modal>
    </div>
  );
}
