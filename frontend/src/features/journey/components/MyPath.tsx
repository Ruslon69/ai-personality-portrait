import { useMemo, useState } from 'react';

import type { PersonalityProfile } from '@entities/personality-profile';
import { TarotCardView } from '@features/tarot';
import type { Locale } from '@shared/i18n';
import { Badge, Button, Container, Stack, Typography } from '@shared/ui';

import { journeyCopy } from '../data';
import { useJourney } from '../hooks';
import { createJourneyChapters } from '../lib';
import type { JourneyReadingRecord } from '../types';
import styles from './Journey.module.css';

export function MyPath({
  locale,
  onBack,
  onExplore,
  onOpenPortrait,
  onOpenReading,
  profiles,
}: {
  locale: Locale;
  onBack: () => void;
  onExplore: () => void;
  onOpenPortrait: (profile: PersonalityProfile) => void;
  onOpenReading: (record: JourneyReadingRecord) => void;
  profiles: readonly PersonalityProfile[];
}) {
  const { actions, state } = useJourney();
  const copy = journeyCopy[locale];
  const [announcement, setAnnouncement] = useState('');
  const chapters = useMemo(
    () => createJourneyChapters(state.readings, locale),
    [locale, state.readings],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : locale === 'en' ? 'en-GB' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );

  function toggleBookmark(record: JourneyReadingRecord) {
    actions.toggleFavorite(record.reading.id);
    setAnnouncement(
      `${record.reading.headline}. ${record.favorite ? copy.path.removedBookmark : copy.path.addedBookmark}`,
    );
  }

  return (
    <div className={styles.root}>
      <section aria-labelledby="path-title" className={styles.pathHero}>
        <Container size="wide">
          <div className={styles.pathHeroGrid}>
            <Stack gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.path.eyebrow}
              </Typography>
              <Typography as="h1" id="path-title" tabIndex={-1} variant="display">
                {copy.path.title}
              </Typography>
              <Typography className={styles.heroLead} variant="lead">
                {copy.path.lead}
              </Typography>
            </Stack>
            <Button onClick={onBack} prominence="secondary">
              {copy.path.back}
            </Button>
          </div>
        </Container>
      </section>

      <section aria-label={copy.book.chapterNavigation} className={styles.pathSection}>
        <Container size="wide">
          {chapters.length || profiles.length ? (
            <ol className={styles.bookTimeline}>
              {chapters.map((chapter) => (
                <li className={styles.chapterEntry} key={chapter.record.reading.id}>
                  <div aria-hidden="true" className={styles.chapterRail}>
                    <span>{chapter.number}</span>
                  </div>
                  <article>
                    <header>
                      <div>
                        <Typography as="p" variant="eyebrow">
                          {copy.path.journeyMilestone} {chapter.number}
                        </Typography>
                        <Typography as="h2" variant="display">
                          {chapter.title}
                        </Typography>
                      </div>
                      <time dateTime={chapter.record.savedAt}>
                        {dateFormatter.format(new Date(chapter.record.savedAt))}
                      </time>
                    </header>
                    <div className={styles.chapterMetadata}>
                      <span>{chapter.readingType}</span>
                      <span>{chapter.dominantTheme}</span>
                    </div>
                    {chapter.record.reading.selections[0] ? (
                      <div className={styles.timelineCardVisual}>
                        <TarotCardView
                          isRevealed
                          locale={locale}
                          selection={chapter.record.reading.selections[0]}
                          theme={chapter.record.reading.context.deckTheme}
                          variant="history"
                        />
                      </div>
                    ) : null}
                    <blockquote>“{chapter.quote}”</blockquote>
                    <Typography className={styles.chapterSummary}>
                      {chapter.record.reading.summary}
                    </Typography>
                    <footer className={styles.chapterActions}>
                      <Button onClick={() => onOpenReading(chapter.record)} prominence="primary">
                        {copy.path.open}
                      </Button>
                      <Button
                        aria-pressed={chapter.record.favorite}
                        className={styles.bookmarkButton}
                        onClick={() => toggleBookmark(chapter.record)}
                        prominence="quiet"
                      >
                        <span aria-hidden="true" className={styles.bookmarkShape} />
                        {chapter.record.favorite ? copy.path.removeBookmark : copy.path.addBookmark}
                      </Button>
                    </footer>
                  </article>
                </li>
              ))}

              {profiles.map((profile, index) => (
                <li className={styles.interludeEntry} key={profile.id}>
                  <div aria-hidden="true" className={styles.chapterRail}>
                    <span>·</span>
                  </div>
                  <article>
                    <Badge tone="info">{copy.path.portraitMilestone}</Badge>
                    <Typography as="h2" variant="heading-lg">
                      {profile.title}
                    </Typography>
                    <blockquote>“{profile.revealHeadline}”</blockquote>
                    <Button onClick={() => onOpenPortrait(profile)} prominence="secondary">
                      {copy.path.open}
                    </Button>
                    <span aria-hidden="true" className={styles.interludeNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </article>
                </li>
              ))}

              <li className={styles.futureChapter}>
                <div aria-hidden="true" className={styles.chapterRail}>
                  <span>∞</span>
                </div>
                <article>
                  <Typography as="p" variant="eyebrow">
                    {copy.yearBook.eyebrow}
                  </Typography>
                  <Typography as="h2" variant="heading-lg">
                    {copy.yearBook.title}
                  </Typography>
                  <Typography>{copy.yearBook.description}</Typography>
                </article>
              </li>
            </ol>
          ) : (
            <div className={styles.bookEmpty}>
              <span aria-hidden="true" className={styles.emptyMonogram}>
                I
              </span>
              <Stack align="center" gap="lg">
                <Typography as="h2" variant="heading-lg">
                  {copy.path.empty}
                </Typography>
                <Typography>{copy.empty.description}</Typography>
                <Button onClick={onExplore} prominence="primary">
                  {copy.empty.primary}
                </Button>
              </Stack>
            </div>
          )}
        </Container>
      </section>

      <p aria-live="polite" className={styles.srOnly} role="status">
        {announcement}
      </p>
    </div>
  );
}
