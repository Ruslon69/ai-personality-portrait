import { useMemo, useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { Button, Container, Stack, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy, tarotSpreadById } from '../data';
import { createTarotResultHeroPresentation } from '../lib';
import type { TarotReading } from '../types';
import { TarotCardView } from './TarotCardView';
import styles from './TarotResult.module.css';

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
  const contentLocale = reading.context.locale;
  const contentCopy = tarotCopy[contentLocale];
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
    <div className={styles.page} lang={locale} data-result-locale={contentLocale}>
      <section aria-labelledby="reading-title" className={styles.resultHero}>
        <Container size="wide">
          <div className={styles.resultHeroSurface}>
            <div className={styles.resultOpening}>
              <div className={styles.heroCardStage} lang={contentLocale}>
                <span aria-hidden="true" className={styles.heroCardOrbit} />
                <TarotCardView
                  isRevealed
                  locale={contentLocale}
                  position={
                    leadingPosition
                      ? `${contentCopy.leadingCard} · ${leadingPosition.label[contentLocale]}`
                      : contentCopy.leadingCard
                  }
                  selection={leadingSelection}
                  showPosition={false}
                  theme={reading.context.deckTheme}
                  variant="leading"
                />
              </div>
              <Stack align="start" className={styles.resultCopy} gap="lg">
                <div className={styles.resultHeroBadges}>
                  <span lang={contentLocale}>{spread.title[contentLocale]}</span>
                  {isSaved ? <span>{copy.savedReading}</span> : <span>{copy.resultEyebrow}</span>}
                </div>
                <Typography as="h1" lang={contentLocale} id="reading-title" variant="display">
                  {heroPresentation.headline}
                </Typography>
                <Typography
                  lang={contentLocale}
                  className={styles.resultSupportingLine}
                  variant="lead"
                >
                  {heroPresentation.heroSummary}
                </Typography>
                <div className={styles.resultHeroTakeaway}>
                  <span>{copy.practicalDirection}</span>
                  <strong lang={contentLocale}>{reading.practicalFocus}</strong>
                </div>
                <div className={styles.resultHeroActions}>
                  <Button onClick={beginReading} prominence="primary" size="large">
                    {copy.beginReading} <span aria-hidden="true">→</span>
                  </Button>
                  <Button onClick={onOpenHistory} prominence="quiet">
                    {copy.history}
                  </Button>
                </div>
                <Typography
                  className={styles.resultSavedNote}
                  role={isSaved ? undefined : 'status'}
                >
                  {isSaved ? copy.savedLocally : productContractCopy[locale].tarotUnsaved}
                </Typography>
              </Stack>
            </div>
          </div>
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
                    <Typography lang={contentLocale}>{value}</Typography>
                  </article>
                ))}
              </div>
            </section>
            <section className={styles.resultReflection}>
              <span aria-hidden="true">?</span>
              <div>
                <strong>{copy.reflectionQuestion}</strong>
                <p lang={contentLocale}>{heroPresentation.reflectionQuestion}</p>
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
                          <div className={styles.resultDetailThumbnail} lang={contentLocale}>
                            <TarotCardView
                              index={index}
                              isRevealed
                              locale={contentLocale}
                              selection={selection}
                              showPosition={false}
                              theme={reading.context.deckTheme}
                              total={reading.selections.length}
                              variant="history"
                            />
                          </div>
                        ) : null}
                        <div className={styles.interpretationTitle}>
                          <span className={styles.interpretationCardMeta} lang={contentLocale}>
                            {position?.label[contentLocale]}
                            {selection
                              ? ` · ${
                                  selection.orientation === 'reversed'
                                    ? contentCopy.reversed
                                    : contentCopy.upright
                                }`
                              : ''}
                          </span>
                          <Typography
                            as="h3"
                            id={`${triggerId}-title`}
                            lang={contentLocale}
                            variant="heading-md"
                          >
                            {card?.name[contentLocale]}
                          </Typography>
                          <Typography className={styles.resultDetailTakeaway} lang={contentLocale}>
                            {firstSentence(interpretation.meaningInPosition)}
                          </Typography>
                        </div>
                        <Button
                          aria-label={isOpen ? copy.showLess : copy.showMore}
                          aria-describedby={`${triggerId}-title`}
                          aria-controls={detailId}
                          aria-expanded={isOpen}
                          id={triggerId}
                          className={styles.detailTrigger}
                          onClick={() => setExpandedId(isOpen ? null : interpretation.id)}
                          prominence="quiet"
                        >
                          <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                        </Button>
                      </div>
                      {isOpen ? (
                        <div
                          aria-labelledby={triggerId}
                          className={styles.interpretationDetail}
                          id={detailId}
                          role="region"
                        >
                          <Typography className={styles.detailHeadline} lang={contentLocale}>
                            {interpretation.headline}
                          </Typography>
                          <div>
                            <strong>{copy.whyHere}</strong>
                            <p lang={contentLocale}>{interpretation.contextLink}</p>
                          </div>
                          <div>
                            <strong>{copy.connections}</strong>
                            <p lang={contentLocale}>{interpretation.connections}</p>
                          </div>
                          <div>
                            <strong>{copy.practical}</strong>
                            <p lang={contentLocale}>{interpretation.practicalTheme}</p>
                          </div>
                          <div>
                            <strong>{copy.reflectionQuestion}</strong>
                            <p lang={contentLocale}>{interpretation.reflectionQuestion}</p>
                          </div>
                          <Typography className={styles.disclaimer} lang={contentLocale}>
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
              <Typography lang={contentLocale}>{heroPresentation.secondaryContext}</Typography>
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
