import { useState } from 'react';

import { localeOptions, type Locale } from '@shared/i18n';
import { Button, Container, Modal, Stack, Toast, Typography } from '@shared/ui';

import { tarotPreferencesCopy } from '../data';
import { useTarotPreferences } from '../hooks';
import { TAROT_HISTORY_LIMIT_OPTIONS, type TarotHistoryLimit } from '../lib';
import styles from './TarotPreferencesSection.module.css';

export function TarotPreferencesSection({
  locale,
  onBackToTarot,
  onHistoryLimitChange,
}: {
  locale: Locale;
  onBackToTarot: () => void;
  onHistoryLimitChange: (limit: TarotHistoryLimit) => boolean;
}) {
  const copy = tarotPreferencesCopy[locale];
  const { actions, preferences } = useTarotPreferences();
  const [announcement, setAnnouncement] = useState('');
  const [resetPending, setResetPending] = useState(false);
  const [pendingLimit, setPendingLimit] = useState<TarotHistoryLimit | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [historyFailed, setHistoryFailed] = useState(false);
  const language = localeOptions.find((option) => option.locale === locale)?.label ?? locale;

  function update(patch: Parameters<typeof actions.update>[0]) {
    const persisted = actions.update(patch);
    setSaveFailed(!persisted);
    setAnnouncement(persisted ? copy.saved : '');
    return persisted;
  }

  function changeHistoryLimit(historyLimit: TarotHistoryLimit) {
    const persisted = update({ historyLimit });
    const historyPersisted = onHistoryLimitChange(historyLimit);
    setHistoryFailed(!historyPersisted);
    if (!historyPersisted) setAnnouncement('');
    if (persisted && historyPersisted) setPendingLimit(null);
  }

  function restoreDefaults() {
    const persisted = actions.restoreDefaults();
    const historyPersisted = onHistoryLimitChange(75);
    setHistoryFailed(!historyPersisted);
    setSaveFailed(!persisted);
    setAnnouncement(persisted && historyPersisted ? copy.restored : '');
    if (persisted && historyPersisted) setResetPending(false);
  }

  return (
    <section aria-labelledby="tarot-settings-title" className={styles.section} id="tarot-settings">
      <Container size="wide">
        <div className={styles.surface}>
          <Stack gap="lg">
            <div className={styles.introduction}>
              <Typography as="p" variant="eyebrow">
                {copy.eyebrow}
              </Typography>
              <Typography as="h2" id="tarot-settings-title" variant="heading-lg">
                {copy.title}
              </Typography>
              <Typography className={styles.muted}>{copy.description}</Typography>
            </div>

            <div className={styles.settingsList}>
              <label className={styles.toggleRow}>
                <input
                  checked={preferences.allowReversedCards}
                  onChange={(event) => update({ allowReversedCards: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <strong>{copy.allowReversed}</strong>
                  <small>{copy.allowReversedDescription}</small>
                </span>
              </label>

              <label className={styles.toggleRow}>
                <input
                  checked={preferences.revealAnimations}
                  onChange={(event) => update({ revealAnimations: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <strong>{copy.animations}</strong>
                  <small>{copy.animationsDescription}</small>
                </span>
              </label>

              <label className={styles.toggleRow}>
                <input
                  checked={preferences.confirmNewReading}
                  onChange={(event) => update({ confirmNewReading: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <strong>{copy.confirmNewReading}</strong>
                  <small>{copy.confirmNewReadingDescription}</small>
                </span>
              </label>

              <div className={styles.selectRow}>
                <label htmlFor="tarot-history-limit">
                  <strong>{copy.historyLimit}</strong>
                  <small id="tarot-history-description">{copy.historyDescription}</small>
                </label>
                <select
                  aria-describedby="tarot-history-description"
                  id="tarot-history-limit"
                  onChange={(event) => {
                    const limit = Number(event.target.value) as TarotHistoryLimit;
                    if (limit < preferences.historyLimit) setPendingLimit(limit);
                    else changeHistoryLimit(limit);
                  }}
                  value={preferences.historyLimit}
                >
                  {TAROT_HISTORY_LIMIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.languageRow}>
                <span>
                  <strong>{copy.language}</strong>
                  <small>{copy.languageDescription}</small>
                </span>
                <output aria-label={copy.language}>{language}</output>
              </div>
            </div>

            <div className={styles.footer}>
              <Button onClick={onBackToTarot} prominence="secondary">
                {copy.backToTarot}
              </Button>
              <div className={styles.resetGroup}>
                <Button
                  className={styles.resetAction}
                  onClick={() => setResetPending(true)}
                  prominence="quiet"
                >
                  {copy.reset}
                </Button>
              </div>
            </div>
            {(saveFailed || historyFailed) && !resetPending && pendingLimit === null ? (
              <Toast tone="error">
                <p>{saveFailed ? copy.saveFailed : copy.historyFailed}</p>
                <Button
                  onClick={() =>
                    historyFailed
                      ? changeHistoryLimit(preferences.historyLimit)
                      : update(preferences)
                  }
                  prominence="secondary"
                >
                  {copy.retry}
                </Button>
              </Toast>
            ) : null}
            <p aria-atomic="true" aria-live="polite" className={styles.feedback} role="status">
              {announcement}
            </p>
          </Stack>
        </div>
      </Container>

      <Modal
        aria-describedby={
          saveFailed || historyFailed
            ? 'tarot-reset-description tarot-reset-error'
            : 'tarot-reset-description'
        }
        className={styles.resetDialog}
        label={pendingLimit === null ? copy.resetTitle : copy.reduceTitle}
        onClose={() => {
          setResetPending(false);
          setPendingLimit(null);
        }}
        open={resetPending || pendingLimit !== null}
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="h2" variant="heading-md">
              {pendingLimit === null ? copy.resetTitle : copy.reduceTitle}
            </Typography>
            <Typography id="tarot-reset-description">
              {pendingLimit === null ? copy.resetDescription : copy.reduceDescription(pendingLimit)}
            </Typography>
          </Stack>
          {saveFailed || historyFailed ? (
            <Toast id="tarot-reset-error" tone="error">
              {saveFailed ? copy.saveFailed : copy.historyFailed}
            </Toast>
          ) : null}
          <div className={styles.dialogActions}>
            <Button
              autoFocus
              prominence="secondary"
              onClick={() => {
                setResetPending(false);
                setPendingLimit(null);
              }}
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={() =>
                pendingLimit === null ? restoreDefaults() : changeHistoryLimit(pendingLimit)
              }
              prominence="danger"
            >
              {pendingLimit === null ? copy.resetConfirm : copy.reduceConfirm}
            </Button>
          </div>
        </Stack>
      </Modal>
    </section>
  );
}
