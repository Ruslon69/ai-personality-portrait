import { useRef, useState } from 'react';

import { useMediaQuery } from '@hooks';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Stack, Surface, Typography } from '@shared/ui';

import { tarotCardById, tarotCopy, tarotPackages, tarotSpreadById } from '../data';
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
                  position={copy.leadingCard}
                  selection={reading.selections[0]}
                  theme={reading.context.deckTheme}
                  variant="leading"
                />
              </div>
              <Stack align="start" className={styles.resultCopy} gap="lg">
                <Badge tone="warning">{copy.resultEyebrow}</Badge>
                <Typography as="h1" id="reading-title" variant="display">
                  {reading.headline}
                </Typography>
                <Typography variant="lead">{reading.summary}</Typography>
                <div className={styles.resultSignals}>
                  <span>{spread.title[locale]}</span>
                  <span>
                    {reading.context.numerology.lifePath.label}:{' '}
                    {reading.context.numerology.lifePath.value}
                  </span>
                  <span>{reading.context.numerology.zodiac.sign}</span>
                </div>
                <Button onClick={beginReading} prominence="primary" size="large">
                  {copy.beginReading} <span aria-hidden="true">→</span>
                </Button>
              </Stack>
            </div>
            <div aria-hidden="true" className={styles.supportingSpread}>
              {reading.selections.slice(1, 5).map((selection, index) => (
                <TarotCardView
                  index={index}
                  isRevealed
                  key={selection.cardId}
                  locale={locale}
                  selection={selection}
                  theme={reading.context.deckTheme}
                  total={Math.min(4, reading.selections.length - 1)}
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
          <Stack gap="lg">
            <div className={styles.sectionHeading}>
              <Typography as="p" variant="eyebrow">
                {copy.readingChapter}
              </Typography>
              <Typography as="h2" id="pattern-title" variant="heading-lg">
                {copy.pattern}
              </Typography>
              <Typography variant="lead">{reading.practicalFocus}</Typography>
            </div>
            <article className={styles.featuredInterpretation}>
              <span aria-hidden="true" className={styles.featuredIndex}>
                01
              </span>
              <div>
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
              <span aria-hidden="true" className={styles.featuredGlyph}>
                {leading.visual.glyph}
              </span>
            </article>
            <div className={styles.interpretationList}>
              {reading.interpretations.slice(1, visibleCount).map((interpretation, index) => {
                const isOpen = expanded.includes(interpretation.id);
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
                          {tarotCardById.get(interpretation.cardId)?.visual.glyph}
                        </span>
                        <div>
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
