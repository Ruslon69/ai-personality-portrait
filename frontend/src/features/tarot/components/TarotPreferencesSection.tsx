import { useState } from 'react';

import { localeOptions, type Locale } from '@shared/i18n';
import { Button, Container, Modal, Stack, Surface, Typography } from '@shared/ui';

import { tarotPreferencesCopy } from '../data';
import { useTarotPreferences } from '../hooks';
import { TAROT_HISTORY_LIMIT_OPTIONS, type TarotHistoryLimit } from '../lib';
import styles from './TarotPreferencesSection.module.css';

export function TarotPreferencesSection({
  locale,
  onHistoryLimitChange,
}: {
  locale: Locale;
  onHistoryLimitChange: (limit: TarotHistoryLimit) => void;
}) {
  const copy = tarotPreferencesCopy[locale];
  const { actions, preferences } = useTarotPreferences();
  const [announcement, setAnnouncement] = useState('');
  const [resetPending, setResetPending] = useState(false);
  const language = localeOptions.find((option) => option.locale === locale)?.label ?? locale;

  function update(patch: Parameters<typeof actions.update>[0]) {
    actions.update(patch);
    setAnnouncement(copy.saved);
  }

  function changeHistoryLimit(historyLimit: TarotHistoryLimit) {
    update({ historyLimit });
    onHistoryLimitChange(historyLimit);
  }

  function restoreDefaults() {
    actions.restoreDefaults();
    onHistoryLimitChange(75);
    setAnnouncement(copy.restored);
    setResetPending(false);
  }

  return (
    <section aria-labelledby="tarot-settings-title" className={styles.section} id="tarot-settings">
      <Container size="wide">
        <Surface className={styles.surface} elevation="low">
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
                  <small>{copy.historyDescription}</small>
                </label>
                <select
                  id="tarot-history-limit"
                  onChange={(event) =>
                    changeHistoryLimit(Number(event.target.value) as TarotHistoryLimit)
                  }
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
              <Button onClick={() => setResetPending(true)} prominence="quiet">
                {copy.reset}
              </Button>
            </div>
          </Stack>
        </Surface>
      </Container>

      <p aria-atomic="true" aria-live="polite" className={styles.srOnly} role="status">
        {announcement}
      </p>

      <Modal label={copy.resetTitle} onClose={() => setResetPending(false)} open={resetPending}>
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="h2" variant="heading-md">
              {copy.resetTitle}
            </Typography>
            <Typography>{copy.resetDescription}</Typography>
          </Stack>
          <div className={styles.dialogActions}>
            <Button autoFocus onClick={() => setResetPending(false)}>
              {copy.cancel}
            </Button>
            <Button onClick={restoreDefaults} prominence="primary">
              {copy.resetConfirm}
            </Button>
          </div>
        </Stack>
      </Modal>
    </section>
  );
}
