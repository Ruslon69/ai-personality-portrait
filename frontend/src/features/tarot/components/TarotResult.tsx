import { useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy, tarotPackages, tarotSpreadById } from '../data';
import { createTarotResultHeroPresentation } from '../lib';
import type { TarotReading } from '../types';
import { TarotCardView } from './TarotCardView';
import styles from './Tarot.module.css';

export function TarotResult({
  locale,
  onContinueJourney,
  onRestart,
  reading,
}: {
  locale: Locale;
  onContinueJourney: () => void;
  onRestart: () => void;
  reading: TarotReading;
}) {
  const copy = tarotCopy[locale];
  const spread = tarotSpreadById.get(reading.spreadId)!;
  const leading = tarotCardById.get(reading.leadingCardId)!;
  const leadingSelection =
    reading.selections.find((selection) => selection.cardId === reading.leadingCardId) ??
    reading.selections[0];
  const leadingPosition = spread.positions.find(
    (position) => position.id === leadingSelection?.positionId,
  );
  const heroPresentation = createTarotResultHeroPresentation(reading);
  const supportingSelections = reading.selections.filter(
    (selection) => selection !== leadingSelection,
  );
  const [readingStarted, setReadingStarted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(Math.min(2, reading.interpretations.length));
  const [expanded, setExpanded] = useState<readonly string[]>([]);
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
                <Badge tone="warning">{copy.resultEyebrow}</Badge>
                <Typography as="h1" id="reading-title" variant="display">
                  {heroPresentation.headline}
                </Typography>
                <Typography className={styles.resultSupportingLine} variant="lead">
                  {heroPresentation.supportingLine}
                </Typography>
                <div className={styles.resultSignals}>
                  {heroPresentation.metadata.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <Button onClick={beginReading} prominence="primary" size="large">
                  {copy.beginReading} <span aria-hidden="true">→</span>
                </Button>
              </Stack>
            </div>
            <div aria-hidden="true" className={styles.supportingSpread}>
              {supportingSelections.slice(0, 4).map((selection, index) => (
                <TarotCardView
                  index={index}
                  isRevealed
                  key={selection.cardId}
                  locale={locale}
                  selection={selection}
                  theme={reading.context.deckTheme}
                  total={Math.min(4, supportingSelections.length)}
                  variant="compact"
                />
              ))}
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
            <div className={styles.sectionHeading}>
              <Typography as="p" variant="eyebrow">
                {copy.readingChapter}
              </Typography>
              <Typography as="h2" id="pattern-title" variant="heading-lg">
                {copy.pattern}
              </Typography>
              <Typography className={styles.resultSummary} variant="lead">
                {reading.summary}
              </Typography>
            </div>
            <article className={styles.featuredInterpretation}>
              <div aria-hidden="true" className={styles.featuredDecoration}>
                <span className={styles.featuredIndex}>01</span>
                <span className={styles.featuredGlyph}>{leading.visual.glyph}</span>
              </div>
              <div className={styles.featuredInterpretationCopy}>
                <Typography as="p" variant="eyebrow">
                  {copy.leadingCard}
                </Typography>
                <Typography as="h3" variant="heading-lg">
                  {reading.interpretations[0]?.headline}
                </Typography>
                <Typography variant="lead">
                  {reading.interpretations[0]?.meaningInPosition}
                </Typography>
              </div>
            </article>
            {reading.interpretations[0] ? (
              <div className={styles.mainInterpretationDetails}>
                <section>
                  <Typography as="h3" variant="heading-md">
                    {copy.connections}
                  </Typography>
                  <Typography>{reading.interpretations[0].connections}</Typography>
                </section>
                <section>
                  <Typography as="h3" variant="heading-md">
                    {copy.numerologyLink}
                  </Typography>
                  <Typography>{reading.interpretations[0].numerologyLink}</Typography>
                </section>
                <section>
                  <Typography as="h3" variant="heading-md">
                    {copy.practical}
                  </Typography>
                  <Typography>{reading.interpretations[0].practicalTheme}</Typography>
                </section>
                <section>
                  <Typography as="h3" variant="heading-md">
                    {copy.reflectionQuestion}
                  </Typography>
                  <Typography>{reading.interpretations[0].reflectionQuestion}</Typography>
                </section>
                <Typography className={styles.disclaimer}>
                  {reading.interpretations[0].uncertainty}
                </Typography>
              </div>
            ) : null}
            <section aria-labelledby="supporting-cards-title" className={styles.supportingCards}>
              <div className={styles.supportingCardsHeading}>
                <Typography as="p" variant="eyebrow">
                  {copy.readingChapter}
                </Typography>
                <Typography as="h3" id="supporting-cards-title" variant="heading-md">
                  {copy.revealedCards}
                </Typography>
              </div>
              <div className={styles.resultCardSpread} data-count={reading.selections.length}>
                {reading.selections.map((selection, index) => {
                  const card = tarotCardById.get(selection.cardId);
                  const position = spread.positions.find(
                    (item) => item.id === selection.positionId,
                  );
                  return (
                    <article
                      className={styles.resultSpreadItem}
                      key={`${selection.cardId}-${selection.positionId}`}
                    >
                      <TarotCardView
                        index={index}
                        isRevealed
                        locale={locale}
                        selection={selection}
                        showPosition={false}
                        theme={reading.context.deckTheme}
                        total={reading.selections.length}
                        variant="supporting"
                      />
                      <span>{position?.label[locale]}</span>
                      <strong>{card?.name[locale]}</strong>
                    </article>
                  );
                })}
              </div>
            </section>
            <div className={styles.interpretationList}>
              {reading.interpretations.slice(1, visibleCount).map((interpretation, index) => {
                const isOpen = expanded.includes(interpretation.id);
                const card = tarotCardById.get(interpretation.cardId);
                const selection = reading.selections.find(
                  (item) => item.cardId === interpretation.cardId,
                );
                return (
                  <article
                    className={styles.interpretationCard}
                    data-open={isOpen || undefined}
                    key={interpretation.id}
                  >
                    <div className={styles.interpretationHeader}>
                      <span className={styles.interpretationNumber} aria-hidden="true">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                      <div className={styles.interpretationTitle}>
                        <span aria-hidden="true" className={styles.miniGlyph}>
                          {card?.visual.glyph}
                        </span>
                        <div>
                          <span className={styles.interpretationCardMeta}>
                            {card?.name[locale]}
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
                          <Typography>{interpretation.meaningInPosition}</Typography>
                        </div>
                      </div>
                      <Button
                        aria-controls={`interpretation-${index}`}
                        aria-expanded={isOpen}
                        onClick={() =>
                          setExpanded((current) =>
                            current.includes(interpretation.id)
                              ? current.filter((id) => id !== interpretation.id)
                              : [...current, interpretation.id],
                          )
                        }
                        prominence="secondary"
                      >
                        {isOpen ? copy.showLess : copy.showMore}
                      </Button>
                    </div>
                    {isOpen ? (
                      <div className={styles.interpretationDetail} id={`interpretation-${index}`}>
                        <div>
                          <strong>{copy.whyHere}</strong>
                          <p>{interpretation.contextLink}</p>
                        </div>
                        <div>
                          <strong>{copy.connections}</strong>
                          <p>{interpretation.connections}</p>
                        </div>
                        <div>
                          <strong>{copy.numerologyLink}</strong>
                          <p>{interpretation.numerologyLink}</p>
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
            {visibleCount < reading.interpretations.length ? (
              <div className={styles.nextChapter}>
                <Typography>
                  {copy.morePositions.replace(
                    '{count}',
                    String(reading.interpretations.length - visibleCount),
                  )}
                </Typography>
                <Button
                  onClick={() =>
                    setVisibleCount((count) => Math.min(count + 1, reading.interpretations.length))
                  }
                  prominence="primary"
                >
                  {copy.openNextChapter} <span aria-hidden="true">↓</span>
                </Button>
              </div>
            ) : null}
          </Stack>
        </Container>
      </section>
      <section className={styles.section} data-visible={readingStarted || undefined}>
        <Container size="wide">
          <div className={styles.boundaryGrid}>
            <Surface className={styles.accessCard}>
              <Badge tone="success">{copy.free}</Badge>
              <Typography as="h2" variant="heading-md">
                {copy.freeNote}
              </Typography>
              <Typography>{leading.advice[locale]}</Typography>
            </Surface>
            <Surface className={styles.accessCard}>
              <Badge tone="neutral">{copy.premium}</Badge>
              <Typography as="h2" variant="heading-md">
                {copy.premium}
              </Typography>
              <Typography>{copy.premiumNote}</Typography>
            </Surface>
          </div>
        </Container>
      </section>
      <section
        aria-labelledby="packages-title"
        className={styles.section}
        data-visible={readingStarted || undefined}
      >
        <Container size="wide">
          <Surface className={styles.packages}>
            <Stack gap="lg">
              <Typography as="h2" id="packages-title" variant="heading-lg">
                {copy.packages}
              </Typography>
              <Typography>{copy.noPrices}</Typography>
              <ul>
                {tarotPackages[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className={styles.resultActions}>
                <Button onClick={onContinueJourney} prominence="primary" size="large">
                  {copy.continueJourney} <span aria-hidden="true">→</span>
                </Button>
                <Button onClick={onRestart} prominence="secondary">
                  {copy.restart}
                </Button>
              </div>
              <Typography className={styles.disclaimer}>{copy.reflectionNote}</Typography>
            </Stack>
          </Surface>
        </Container>
      </section>
    </div>
  );
}
