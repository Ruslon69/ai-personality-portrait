import { useMemo, useState } from 'react';

import { useNotifications } from '@app/providers';
import type { Locale } from '@shared/i18n';
import { Button, Container, Modal, Stack, Typography } from '@shared/ui';

import { journeyPersistenceCopy, tarotHistoryCopy } from '../data';
import { useJourney } from '../hooks';
import { historySnapshotForRecord } from '../lib';
import type { JourneyReadingRecord } from '../types';
import { SavedReading } from './SavedReading';
import styles from './PersonalSpace.module.css';

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
  const { notify } = useNotifications();
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

  function confirmAction() {
    if (pendingAction?.kind === 'delete') {
      const result = actions.deleteReading(pendingAction.record.reading.id);
      if (result.persisted) setAnnouncement(copy.removed);
      else notify((language) => journeyPersistenceCopy[language].deleteFailed, 'error');
    } else if (pendingAction?.kind === 'clear') {
      const result = actions.clearReadings();
      if (result.persisted) setAnnouncement(copy.cleared);
      else notify((language) => journeyPersistenceCopy[language].clearFailed, 'error');
    }
    setPendingAction(null);
    window.requestAnimationFrame(() => document.getElementById('saved-readings-title')?.focus());
  }

  const pendingTitle =
    pendingAction?.kind === 'delete'
      ? historySnapshotForRecord(pendingAction.record).resultHeadline
      : '';

  const deleteText = copy.deleteDescription(pendingTitle);
  const titleOffset = deleteText.indexOf(pendingTitle);

  return (
    <div className={styles.root}>
      <section aria-labelledby="tarot-history-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroFrame}>
            <Stack gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h1" id="tarot-history-title" variant="display">
                {copy.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {copy.localOnly}
              </Typography>
            </Stack>
            <div className={styles.actions}>
              {records.length ? (
                <Button onClick={onCreate} prominence="quiet">
                  {copy.create} <span aria-hidden="true">→</span>
                </Button>
              ) : null}
              <Button onClick={onBack} prominence="quiet">
                {copy.back}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="saved-readings-title" className={styles.historySection}>
        <Container size="wide">
          {records.length ? (
            <Stack gap="lg">
              <div className={styles.listHeading}>
                <Typography as="h2" id="saved-readings-title" tabIndex={-1} variant="heading-lg">
                  {copy.saved}
                </Typography>
                <Button onClick={() => setPendingAction({ kind: 'clear' })} prominence="quiet">
                  {copy.clear}
                </Button>
              </div>
              <ol className={styles.timeline}>
                {records.map((record) => (
                  <li key={record.reading.id}>
                    <SavedReading
                      isPersisted={actions.isReadingPersisted(record.reading.id)}
                      record={record}
                      locale={locale}
                      onOpen={onOpenReading}
                    >
                      <Button
                        aria-describedby={`saved-reading-${record.reading.id}`}
                        onClick={() => setPendingAction({ kind: 'delete', record })}
                        prominence="quiet"
                      >
                        {copy.delete}
                      </Button>
                    </SavedReading>
                  </li>
                ))}
              </ol>
            </Stack>
          ) : (
            <div className={styles.empty}>
              <span aria-hidden="true" className={styles.emptyMark}>
                ✧
              </span>
              <Stack align="start" gap="lg">
                <Typography as="h2" id="saved-readings-title" tabIndex={-1} variant="heading-lg">
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
        aria-describedby="history-confirmation-description"
        label={pendingAction?.kind === 'clear' ? copy.clearTitle : copy.deleteTitle}
        onClose={() => setPendingAction(null)}
        open={pendingAction !== null}
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="h2" variant="heading-md">
              {pendingAction?.kind === 'clear' ? copy.clearTitle : copy.deleteTitle}
            </Typography>
            <Typography id="history-confirmation-description">
              {pendingAction?.kind === 'clear' ? (
                copy.clearDescription
              ) : (
                <>
                  {deleteText.slice(0, titleOffset)}
                  <span
                    lang={
                      pendingAction?.kind === 'delete'
                        ? pendingAction.record.reading.context.locale
                        : locale
                    }
                  >
                    {pendingTitle}
                  </span>
                  {deleteText.slice(titleOffset + pendingTitle.length)}
                </>
              )}
            </Typography>
          </Stack>
          <div className={styles.dialogActions}>
            <Button autoFocus onClick={() => setPendingAction(null)} prominence="secondary">
              {copy.cancel}
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
