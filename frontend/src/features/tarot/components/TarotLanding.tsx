import { useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Modal, Stack, Typography } from '@shared/ui';

import { tarotCopy, tarotPreferencesCopy, tarotSpreads } from '../data';
import type { TarotSpread } from '../types';
import styles from './Tarot.module.css';

const durationBySize: Readonly<Record<number, number>> = { 1: 2, 4: 6, 5: 7, 6: 9 };

export function TarotLanding({
  confirmNewReading,
  hasUnfinishedReading,
  locale,
  onOpenHistory,
  onOpenSettings,
  onResume,
  onStart,
}: {
  confirmNewReading: boolean;
  hasUnfinishedReading: boolean;
  locale: Locale;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onResume: () => void;
  onStart: (spread: TarotSpread) => void;
}) {
  const copy = tarotCopy[locale];
  const preferencesCopy = tarotPreferencesCopy[locale];
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(tarotSpreads[0]!);
  const [pendingSpread, setPendingSpread] = useState<TarotSpread | null>(null);
  const selectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  function requestStart(spread: TarotSpread) {
    if (confirmNewReading && hasUnfinishedReading) {
      setPendingSpread(spread);
      return;
    }
    onStart(spread);
  }

  return (
    <div className={styles.page}>
      <section aria-labelledby="tarot-title" className={styles.tarotHero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <Stack align="start" gap="lg">
              <Badge tone="warning">{copy.eyebrow}</Badge>
              <Typography as="h1" id="tarot-title" variant="display">
                {copy.heroTitle}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {copy.heroLead}
              </Typography>
              <div className={styles.heroActions}>
                {hasUnfinishedReading ? (
                  <Button onClick={onResume} prominence="primary" size="large">
                    {copy.resumeReading} <span aria-hidden="true">→</span>
                  </Button>
                ) : null}
                <Button
                  onClick={() => {
                    selectionRef.current?.scrollIntoView({
                      behavior: prefersReducedMotion ? 'auto' : 'smooth',
                      block: 'start',
                    });
                    selectionRef.current?.focus({ preventScroll: true });
                  }}
                  prominence={hasUnfinishedReading ? 'secondary' : 'primary'}
                  size="large"
                >
                  {copy.primary} <span aria-hidden="true">→</span>
                </Button>
                <Button onClick={onOpenHistory} prominence="quiet">
                  {copy.history}
                </Button>
                <Button onClick={onOpenSettings} prominence="quiet">
                  {copy.settings}
                </Button>
              </div>
              <Typography className={styles.disclaimer}>{copy.reflectionNote}</Typography>
            </Stack>
            <div aria-hidden="true" className={styles.heroCards}>
              <i />
              <i />
              <i />
              <b>7</b>
              <span />
            </div>
          </div>
        </Container>
      </section>
      <section
        aria-labelledby="spread-title"
        className={styles.section}
        id="spreads"
        ref={selectionRef}
        tabIndex={-1}
      >
        <Container size="wide">
          <Stack gap="lg">
            <div className={styles.sectionHeading}>
              <Typography as="p" variant="eyebrow">
                {copy.reflection}
              </Typography>
              <Typography as="h2" id="spread-title" variant="heading-lg">
                {copy.chooseDirection}
              </Typography>
              <Typography>{copy.directionLead}</Typography>
            </div>
            <fieldset className={styles.spreadFieldset}>
              <legend className={styles.srOnly}>{copy.chooseDirection}</legend>
              <div className={styles.spreadCollection}>
                {tarotSpreads.map((spread) => (
                  <label
                    className={styles.spreadCard}
                    data-selected={selectedSpread.id === spread.id || undefined}
                    key={spread.id}
                  >
                    <input
                      checked={selectedSpread.id === spread.id}
                      className={styles.spreadRadio}
                      name="tarot-spread"
                      onChange={() => setSelectedSpread(spread)}
                      type="radio"
                    />
                    <span aria-hidden="true" className={styles.spreadIllustration}>
                      <i />
                      <i />
                      <i />
                      <b>{String(spread.positions.length).padStart(2, '0')}</b>
                    </span>
                    <span className={styles.spreadCardContent}>
                      <Badge tone={spread.access === 'free' ? 'success' : 'neutral'}>
                        {spread.access === 'free' ? copy.free : copy.premium}
                      </Badge>
                      <strong className={styles.spreadTitle}>{spread.title[locale]}</strong>
                      <span>{spread.description[locale]}</span>
                      <span className={styles.positionCount}>
                        {durationBySize[spread.positions.length] ?? 6} {copy.minutes} ·{' '}
                        {spread.positions.length} {copy.cards}
                      </span>
                    </span>
                    <span className={styles.selectionMark} aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.spreadAction}>
              <div aria-live="polite">
                <strong>{selectedSpread.title[locale]}</strong>
              </div>
              <Button
                onClick={() => requestStart(selectedSpread)}
                prominence="primary"
                size="large"
              >
                {copy.continueWith.replace('{title}', selectedSpread.title[locale])}{' '}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </Stack>
        </Container>
      </section>
      <Modal
        label={preferencesCopy.newReadingTitle}
        onClose={() => setPendingSpread(null)}
        open={pendingSpread !== null}
      >
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="h2" variant="heading-md">
              {preferencesCopy.newReadingTitle}
            </Typography>
            <Typography>{preferencesCopy.newReadingDescription}</Typography>
          </Stack>
          <div className={styles.readingConfirmActions}>
            <Button autoFocus onClick={() => setPendingSpread(null)}>
              {preferencesCopy.newReadingCancel}
            </Button>
            <Button
              onClick={() => {
                if (!pendingSpread) return;
                const spread = pendingSpread;
                setPendingSpread(null);
                onStart(spread);
              }}
              prominence="primary"
            >
              {preferencesCopy.newReadingConfirm}
            </Button>
          </div>
        </Stack>
      </Modal>
    </div>
  );
}
