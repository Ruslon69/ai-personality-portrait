import { pluralForm } from '@shared/i18n';
import { tarotCardCountForms } from '../data/card-count-copy';
import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { Button, Container, Modal, Stack, Typography } from '@shared/ui';

import { tarotCopy, tarotPreferencesCopy, tarotSpreads } from '../data';
import type { TarotSpread } from '../types';
import styles from './TarotEntry.module.css';
import { TarotSpreadIcon } from './TarotSpreadIcon';
import selectionStyles from './TarotSpreadSelector.module.css';

const durationBySize: Readonly<Record<number, number>> = { 1: 2, 4: 6, 5: 7, 6: 9 };

function cardCountLabel(count: number, locale: Locale) {
  return `${count} ${pluralForm(count, locale, tarotCardCountForms[locale])}`;
}

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
    if (spread.id !== 'day' && confirmNewReading && hasUnfinishedReading) {
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
            <Stack align="start" className={styles.heroCopy} gap="lg">
              <Typography as="p" className={styles.eyebrow} variant="eyebrow">
                {copy.eyebrow}
              </Typography>
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
              </div>
              <div aria-label={copy.secondaryActions} className={styles.utilityActions}>
                <Button onClick={onOpenHistory} prominence="quiet">
                  {copy.history}
                </Button>
                <Button onClick={onOpenSettings} prominence="quiet">
                  {copy.settings}
                </Button>
              </div>
            </Stack>
            <div aria-hidden="true" className={styles.heroArtwork}>
              <picture>
                <source
                  media="(max-width: 600px)"
                  srcSet="/tarot-entry/tarot-entry-mobile-640.webp 640w, /tarot-entry/tarot-entry-mobile-960.webp 960w"
                  sizes="100vw"
                  width="960"
                  height="931"
                />
                <img
                  alt=""
                  src="/tarot-entry/tarot-entry-960.webp"
                  srcSet="/tarot-entry/tarot-entry-960.webp 960w, /tarot-entry/tarot-entry-1536.webp 1536w"
                  sizes="(max-width: 1100px) 75vw, (max-width: 1600px) 70vw, 1100px"
                  width="1536"
                  height="1024"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </Container>
      </section>
      <section
        aria-labelledby="spread-title"
        className={selectionStyles.section}
        id="spreads"
        ref={selectionRef}
        tabIndex={-1}
      >
        <Container size="wide">
          <Stack gap="lg">
            <div className={selectionStyles.sectionHeading}>
              <Typography as="p" variant="eyebrow">
                {copy.reflection}
              </Typography>
              <Typography as="h2" id="spread-title" variant="heading-lg">
                {copy.chooseDirection}
              </Typography>
              <Typography>
                {selectedSpread.id === 'day'
                  ? productContractCopy[locale].dailyDescription
                  : copy.directionLead}
              </Typography>
            </div>
            <fieldset className={selectionStyles.spreadFieldset}>
              <legend className={styles.srOnly}>{copy.chooseDirection}</legend>
              <div className={selectionStyles.spreadCollection}>
                {tarotSpreads.map((spread) => (
                  <label
                    className={selectionStyles.spreadCard}
                    data-spread={spread.id}
                    data-selected={selectedSpread.id === spread.id || undefined}
                    key={spread.id}
                  >
                    <input
                      checked={selectedSpread.id === spread.id}
                      className={styles.spreadRadio}
                      aria-labelledby={`spread-${spread.id}-title`}
                      aria-describedby={`spread-${spread.id}-description spread-${spread.id}-meta`}
                      name="tarot-spread"
                      onChange={() => setSelectedSpread(spread)}
                      type="radio"
                    />
                    <span aria-hidden="true" className={selectionStyles.spreadIllustration}>
                      <TarotSpreadIcon spreadId={spread.id} />
                    </span>
                    <span className={selectionStyles.spreadCardContent}>
                      <strong
                        className={selectionStyles.spreadTitle}
                        id={`spread-${spread.id}-title`}
                      >
                        {spread.title[locale]}
                      </strong>
                      <span id={`spread-${spread.id}-description`}>
                        {spread.description[locale]}
                      </span>
                      <span
                        className={selectionStyles.positionCount}
                        id={`spread-${spread.id}-meta`}
                      >
                        {durationBySize[spread.positions.length] ?? 6} {copy.minutes} ·{' '}
                        {cardCountLabel(spread.positions.length, locale)}
                        {spread.access === 'free' ? (
                          <span className={selectionStyles.freeLabel}> · {copy.free}</span>
                        ) : null}
                      </span>
                    </span>
                    <span className={selectionStyles.selectionMark} aria-hidden="true">
                      {selectedSpread.id === spread.id ? '✓' : '→'}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={selectionStyles.spreadAction}>
              <div aria-live="polite">
                <strong>{selectedSpread.title[locale]}</strong>
              </div>
              <Button
                onClick={() => requestStart(selectedSpread)}
                prominence="primary"
                size="large"
              >
                {selectedSpread.id === 'day'
                  ? productContractCopy[locale].dailyOpen
                  : copy.continueWith.replace('{title}', selectedSpread.title[locale])}{' '}
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
