import { useEffect, useMemo, useState } from 'react';

import { useNotifications } from '@app/providers';
import type { PersonalityProfile } from '@entities/personality-profile';
import { TarotCardView, tarotCardById } from '@features/tarot';
import type { Locale } from '@shared/i18n';
import { Button, Container, Stack, Typography } from '@shared/ui';

import { journeyCopy, journeyPersistenceCopy } from '../data';
import { useJourney } from '../hooks';
import { createDailyCard, createJourneyChapters, getLocalDateKey } from '../lib';
import type { JourneyReadingRecord } from '../types';
import styles from './Journey.module.css';

type JourneyProps = {
  locale: Locale;
  onExploreTarot: () => void;
  onOpenLatestPortrait: () => void;
  onOpenPath: () => void;
  onOpenReading: (record: JourneyReadingRecord) => void;
  profile: PersonalityProfile | null;
};

export function Journey({
  locale,
  onExploreTarot,
  onOpenLatestPortrait,
  onOpenPath,
  onOpenReading,
  profile,
}: JourneyProps) {
  const { notify } = useNotifications();
  const { actions, state } = useJourney();
  const copy = journeyCopy[locale];
  const persistenceCopy = journeyPersistenceCopy[locale];
  const dateKey = getLocalDateKey();
  const chapters = useMemo(
    () => createJourneyChapters(state.readings, locale),
    [locale, state.readings],
  );
  const currentChapter = chapters.at(-1);
  const candidate = useMemo(
    () => createDailyCard(state.identity, dateKey),
    [dateKey, state.identity],
  );
  const dailyCard = state.dailyCards[dateKey] ?? candidate;
  const card = tarotCardById.get(dailyCard.selection.cardId)!;
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    actions.ensureDailyCard(candidate);
  }, [actions, candidate]);

  function openDailyCard() {
    const ensured = actions.ensureDailyCard(candidate);
    if (!ensured.persisted) {
      notify(persistenceCopy.dailyCardFailed, 'error');
      return;
    }

    const result = actions.openDailyCard(dateKey);
    if (result.persisted) setAnnouncement(`${card.name[locale]}. ${copy.card.opened}`);
    else notify(persistenceCopy.dailyCardFailed, 'error');
  }

  const hasPrimaryResult = Boolean(currentChapter || profile);

  return (
    <div className={styles.root}>
      <section aria-labelledby="results-title" className={styles.resultsHero}>
        <Container size="wide">
          <div className={styles.resultsHeroFrame}>
            <Stack align="start" className={styles.resultsHeroCopy} gap="lg">
              <Typography as="p" variant="eyebrow">
                {copy.hero.eyebrow}
              </Typography>
              <Typography as="h1" id="results-title" tabIndex={-1} variant="display">
                {hasPrimaryResult ? copy.hero.title : copy.empty.title}
              </Typography>
              <Typography className={styles.resultsLead} variant="lead">
                {hasPrimaryResult ? copy.hero.lead : copy.empty.description}
              </Typography>
              <div className={styles.resultsActions}>
                {currentChapter ? (
                  <Button
                    onClick={() => onOpenReading(currentChapter.record)}
                    prominence="primary"
                    size="large"
                  >
                    {copy.latest.continue} <span aria-hidden="true">→</span>
                  </Button>
                ) : profile ? (
                  <Button onClick={onOpenLatestPortrait} prominence="primary" size="large">
                    {copy.quick.latestTitle} <span aria-hidden="true">→</span>
                  </Button>
                ) : (
                  <Button onClick={onExploreTarot} prominence="primary" size="large">
                    {copy.empty.primary} <span aria-hidden="true">→</span>
                  </Button>
                )}
                {hasPrimaryResult ? (
                  <Button onClick={onOpenPath} prominence="quiet">
                    {copy.book.openPath}
                  </Button>
                ) : null}
              </div>
            </Stack>

            <div aria-hidden="true" className={styles.resultsMark}>
              <span />
              <i />
              <b>{chapters.length || (profile ? 1 : 0)}</b>
            </div>
          </div>
        </Container>
      </section>

      {currentChapter ? (
        <section aria-labelledby="latest-result-title" className={styles.latestResultSection}>
          <Container size="wide">
            <article className={styles.latestResult}>
              <div>
                <Typography as="p" variant="eyebrow">
                  {copy.latest.title}
                </Typography>
                <Typography as="h2" id="latest-result-title" variant="heading-lg">
                  {currentChapter.title}
                </Typography>
                <Typography className={styles.resultsLead}>
                  {currentChapter.record.reading.summary}
                </Typography>
              </div>
              <span className={styles.resultNumber} aria-hidden="true">
                {currentChapter.number}
              </span>
            </article>
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="today-title" className={styles.todaySection}>
        <Container size="wide">
          <div className={styles.todayGrid}>
            <div className={styles.resultsDailyCardVisual}>
              <TarotCardView
                isRevealed={Boolean(dailyCard.openedAt)}
                locale={locale}
                onClick={dailyCard.openedAt ? undefined : openDailyCard}
                selection={dailyCard.selection}
                theme="cosmic-minimal"
                variant="history"
              />
            </div>
            <Stack align="start" gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.card.eyebrow}
              </Typography>
              <Typography as="h2" id="today-title" variant="heading-lg">
                {dailyCard.openedAt ? card.name[locale] : copy.card.title}
              </Typography>
              {dailyCard.openedAt ? (
                <>
                  <Typography className={styles.resultsLead}>
                    {dailyCard.selection.orientation === 'reversed'
                      ? card.reversed[locale]
                      : card.upright[locale]}
                  </Typography>
                  <Typography className={styles.dailySuggestion}>
                    <strong>{copy.card.action}</strong>
                    <span>{card.advice[locale]}</span>
                  </Typography>
                </>
              ) : (
                <Button onClick={openDailyCard} prominence="secondary">
                  {copy.card.open}
                </Button>
              )}
            </Stack>
          </div>
        </Container>
      </section>

      <nav aria-label={copy.quick.title} className={styles.simpleNavigation}>
        <Container size="wide">
          <div>
            <Button onClick={onExploreTarot} prominence="quiet">
              {copy.latest.explore}
            </Button>
            {profile && currentChapter ? (
              <Button onClick={onOpenLatestPortrait} prominence="quiet">
                {copy.quick.latestTitle}
              </Button>
            ) : null}
          </div>
        </Container>
      </nav>

      <p aria-atomic="true" aria-live="polite" className={styles.srOnly} role="status">
        {announcement}
      </p>
    </div>
  );
}
