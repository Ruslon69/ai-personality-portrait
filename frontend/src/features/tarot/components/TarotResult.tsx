import { useMemo, useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy, tarotSpreadById } from '../data';
import { createTarotResultHeroPresentation } from '../lib';
import type { TarotReading } from '../types';
import { TarotCardView } from './TarotCardView';
import styles from './Tarot.module.css';

function firstSentence(value: string) {
  return (
    value
      .trim()
      .split(/(?<=[.!?])\s+/u)
      .find(Boolean) ?? value.trim()
  );
}

export function TarotResult({
  isSaved,
  locale,
  onContinueJourney,
  onOpenHistory,
  onRestart,
  reading,
  savedPresentation,
}: {
  isSaved: boolean;
  locale: Locale;
  onContinueJourney: () => void;
  onOpenHistory: () => void;
  onRestart: () => void;
  reading: TarotReading;
  savedPresentation?: { headline: string; motifs: readonly string[] };
}) {
  const copy = tarotCopy[locale];
  const spread = tarotSpreadById.get(reading.spreadId)!;
  const leadingSelection =
    reading.selections.find((selection) => selection.cardId === reading.leadingCardId) ??
    reading.selections[0];
  const leadingPosition = spread.positions.find(
    (position) => position.id === leadingSelection?.positionId,
  );
  const generatedPresentation = useMemo(
    () => createTarotResultHeroPresentation(reading),
    [reading],
  );
  const heroPresentation = savedPresentation
    ? {
        ...generatedPresentation,
        headline: savedPresentation.headline,
        motifs: savedPresentation.motifs,
      }
    : generatedPresentation;
  const [readingStarted, setReadingStarted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const readingRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  function beginReading() {
    setReadingStarted(true);
    window.requestAnimationFrame(() => {
      readingRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      readingRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <div className={styles.page}>
      <section aria-labelledby="reading-title" className={styles.resultHero}>
        <Container size="wide">
          <Surface className={styles.resultHeroSurface} elevation="low">
            <div className={styles.resultOpening}>
              <div className={styles.heroCardStage}>
                <span aria-hidden="true" className={styles.heroCardOrbit} />
                <TarotCardView
                  isRevealed
                  locale={locale}
                  position={
                    leadingPosition
                      ? `${copy.leadingCard} · ${leadingPosition.label[locale]}`
                      : copy.leadingCard
                  }
                  selection={leadingSelection}
                  theme={reading.context.deckTheme}
                  variant="leading"
                />
              </div>
              <Stack align="start" className={styles.resultCopy} gap="lg">
                <div className={styles.resultHeroBadges}>
                  <Badge tone="warning">{copy.resultEyebrow}</Badge>
                  {isSaved ? <Badge tone="success">{copy.savedReading}</Badge> : null}
                </div>
                <Typography as="h1" id="reading-title" variant="display">
                  {heroPresentation.headline}
                </Typography>
                <Typography className={styles.resultSupportingLine} variant="lead">
                  {heroPresentation.heroSummary}
                </Typography>
                <div className={styles.resultHeroTakeaway}>
                  <span>{copy.practicalDirection}</span>
                  <strong>{reading.practicalFocus}</strong>
                </div>
                <div className={styles.resultHeroActions}>
                  <Button onClick={beginReading} prominence="primary" size="large">
                    {copy.beginReading} <span aria-hidden="true">→</span>
                  </Button>
                  <Button onClick={onOpenHistory} prominence="secondary">
                    {copy.history}
                  </Button>
                </div>
                {isSaved ? (
                  <Typography className={styles.resultSavedNote}>{copy.savedLocally}</Typography>
                ) : null}
              </Stack>
            </div>
          </Surface>
        </Container>
      </section>
      <section
        aria-labelledby="pattern-title"
        className={styles.readingSection}
        data-visible={readingStarted || undefined}
        ref={readingRef}
        tabIndex={-1}
      >
        <Container size="wide">
          <Stack className={styles.readingContent} gap="lg">
            <section className={styles.resultPatternSection}>
              <div className={styles.sectionHeading}>
                <Typography as="p" variant="eyebrow">
                  {copy.readingChapter}
                </Typography>
                <Typography as="h2" id="pattern-title" variant="heading-lg">
                  {copy.pattern}
                </Typography>
              </div>
              <div className={styles.resultPatternGrid}>
                {(
                  [
                    [copy.repeatedTheme, heroPresentation.pattern.repeated],
                    [copy.resultTension, heroPresentation.pattern.tension],
                    [copy.resultSupport, heroPresentation.pattern.support],
                    [copy.resultAttention, heroPresentation.pattern.attention],
                  ] as const
                ).map(([label, value]) => (
                  <article className={styles.resultPatternItem} key={label}>
                    <span>{label}</span>
                    <Typography>{value}</Typography>
                  </article>
                ))}
              </div>
            </section>
            <section className={styles.resultReflection}>
              <span aria-hidden="true">?</span>
              <div>
                <strong>{copy.reflectionQuestion}</strong>
                <p>{heroPresentation.reflectionQuestion}</p>
              </div>
            </section>
            <section aria-labelledby="supporting-cards-title" className={styles.resultDetails}>
              <div className={styles.resultDetailsHeading}>
                <div>
                  <Typography as="h2" id="supporting-cards-title" variant="heading-lg">
                    {copy.cardDetails}
                  </Typography>
                </div>
                <Typography>{copy.cardDetailsNote}</Typography>
              </div>
              <div className={styles.interpretationList}>
                {reading.interpretations.map((interpretation, index) => {
                  const isOpen = expandedId === interpretation.id;
                  const card = tarotCardById.get(interpretation.cardId);
                  const selection = reading.selections[index];
                  const position = spread.positions.find(
                    (item) => item.id === interpretation.positionId,
                  );
                  const detailId = `interpretation-${index}`;
                  const triggerId = `interpretation-trigger-${index}`;
                  return (
                    <article
                      className={styles.interpretationCard}
                      data-open={isOpen || undefined}
                      key={interpretation.id}
                    >
                      <div className={styles.interpretationHeader}>
                        {selection ? (
                          <div className={styles.resultDetailThumbnail}>
                            <TarotCardView
                              index={index}
                              isRevealed
                              locale={locale}
                              selection={selection}
                              showPosition={false}
                              theme={reading.context.deckTheme}
                              total={reading.selections.length}
                              variant="history"
                            />
                          </div>
                        ) : null}
                        <div className={styles.interpretationTitle}>
                          <span className={styles.interpretationCardMeta}>
                            {position?.label[locale]} · {card?.name[locale]}
                            {selection
                              ? ` · ${
                                  selection.orientation === 'reversed'
                                    ? copy.reversed
                                    : copy.upright
                                }`
                              : ''}
                          </span>
                          <Typography as="h3" variant="heading-md">
                            {interpretation.headline}
                          </Typography>
                          <Typography className={styles.resultDetailTakeaway}>
                            {firstSentence(interpretation.meaningInPosition)}
                          </Typography>
                        </div>
                        <Button
                          aria-label={`${isOpen ? copy.showLess : copy.showMore}: ${position?.label[locale] ?? card?.name[locale] ?? index + 1}`}
                          aria-controls={detailId}
                          aria-expanded={isOpen}
                          id={triggerId}
                          onClick={() => setExpandedId(isOpen ? null : interpretation.id)}
                          prominence="secondary"
                        >
                          {isOpen ? copy.showLess : copy.showMore}
                        </Button>
                      </div>
                      {isOpen ? (
                        <div
                          aria-labelledby={triggerId}
                          className={styles.interpretationDetail}
                          id={detailId}
                          role="region"
                        >
                          <div>
                            <strong>{copy.whyHere}</strong>
                            <p>{interpretation.contextLink}</p>
                          </div>
                          <div>
                            <strong>{copy.connections}</strong>
                            <p>{interpretation.connections}</p>
                          </div>
                          <div>
                            <strong>{copy.practical}</strong>
                            <p>{interpretation.practicalTheme}</p>
                          </div>
                          <div>
                            <strong>{copy.reflectionQuestion}</strong>
                            <p>{interpretation.reflectionQuestion}</p>
                          </div>
                          <Typography className={styles.disclaimer}>
                            {interpretation.uncertainty}
                          </Typography>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
            <aside className={styles.resultSecondaryContext}>
              <Typography as="p" variant="eyebrow">
                {copy.secondaryContext}
              </Typography>
              <Typography>{heroPresentation.secondaryContext}</Typography>
              <small>{copy.secondaryContextNote}</small>
            </aside>
            <div aria-label={copy.resultActionsLabel} className={styles.resultActions} role="group">
              <Button onClick={onContinueJourney} prominence="primary" size="large">
                {copy.continueJourney} <span aria-hidden="true">→</span>
              </Button>
              <Button onClick={onRestart} prominence="secondary">
                {copy.restart}
              </Button>
            </div>
          </Stack>
        </Container>
      </section>
    </div>
  );
}
