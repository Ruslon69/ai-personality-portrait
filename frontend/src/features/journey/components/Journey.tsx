import { useEffect, useMemo, useState } from 'react';

import type { PersonalityProfile } from '@entities/personality-profile';
import { createNumerologyProfile } from '@features/numerology';
import { tarotCardById } from '@features/tarot';
import type { Locale } from '@shared/i18n';
import { Button, Container, Stack, Typography } from '@shared/ui';

import { journeyCopy } from '../data';
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
  const { actions, state } = useJourney();
  const copy = journeyCopy[locale];
  const dateKey = getLocalDateKey();
  const chapters = useMemo(
    () => createJourneyChapters(state.readings, locale),
    [locale, state.readings],
  );
  const currentChapter = chapters.at(-1);
  const firstChapter = chapters[0];
  const candidate = useMemo(
    () => createDailyCard(state.identity, dateKey),
    [dateKey, state.identity],
  );
  const dailyCard = state.dailyCards[dateKey] ?? candidate;
  const card = tarotCardById.get(dailyCard.selection.cardId)!;
  const birthDate = currentChapter?.record.reading.context.birthDate;
  const numerology = useMemo(
    () => (birthDate ? createNumerologyProfile(birthDate, locale) : null),
    [birthDate, locale],
  );
  const [announcement, setAnnouncement] = useState('');
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : locale === 'en' ? 'en-GB' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );

  useEffect(() => {
    actions.ensureDailyCard(candidate);
  }, [actions, candidate]);

  function openDailyCard() {
    actions.ensureDailyCard(candidate);
    actions.openDailyCard(dateKey);
    setAnnouncement(`${card.name[locale]}. ${copy.card.opened}`);
  }

  function toggleBookmark(record: JourneyReadingRecord) {
    actions.toggleFavorite(record.reading.id);
    setAnnouncement(
      `${record.reading.headline}. ${record.favorite ? copy.path.removedBookmark : copy.path.addedBookmark}`,
    );
  }

  return (
    <div className={styles.root}>
      <section aria-labelledby="journey-title" className={styles.coverSection}>
        <Container size="wide">
          <div className={styles.bookCover}>
            <span aria-hidden="true" className={styles.coverSpine} />
            <span aria-hidden="true" className={styles.coverOrnament}>
              <i />
              <i />
              <i />
            </span>
            <div className={styles.coverCopy}>
              <Typography as="p" variant="eyebrow">
                {copy.hero.eyebrow}
              </Typography>
              <Typography as="h1" id="journey-title" tabIndex={-1} variant="display">
                {copy.book.title}
              </Typography>
              <Typography className={styles.readerName}>{copy.book.reader}</Typography>
              <Typography className={styles.coverLead} variant="lead">
                {chapters.length ? copy.hero.lead : copy.empty.description}
              </Typography>
            </div>
            <dl className={styles.coverMeta}>
              <div>
                <dt>{copy.book.firstChapter}</dt>
                <dd>
                  {firstChapter
                    ? dateFormatter.format(new Date(firstChapter.record.savedAt))
                    : copy.book.noChapters}
                </dd>
              </div>
              <div>
                <dt>{copy.book.currentChapter}</dt>
                <dd>
                  {currentChapter
                    ? `${currentChapter.number} · ${currentChapter.title}`
                    : copy.book.noChapters}
                </dd>
              </div>
            </dl>
            <div className={styles.coverActions}>
              {currentChapter ? (
                <Button
                  onClick={() => onOpenReading(currentChapter.record)}
                  prominence="primary"
                  size="large"
                >
                  {copy.latest.continue} <span aria-hidden="true">→</span>
                </Button>
              ) : (
                <Button onClick={onExploreTarot} prominence="primary" size="large">
                  {copy.empty.primary} <span aria-hidden="true">→</span>
                </Button>
              )}
              <Button onClick={onOpenPath} prominence="quiet">
                {copy.book.openPath}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {chapters.length ? (
        <nav aria-label={copy.book.chapterNavigation} className={styles.chapterNav}>
          <Container size="wide">
            <ol>
              {chapters.map((chapter) => (
                <li key={chapter.record.reading.id}>
                  <button
                    aria-current={
                      chapter.record.reading.id === currentChapter?.record.reading.id
                        ? 'true'
                        : undefined
                    }
                    onClick={() => onOpenReading(chapter.record)}
                    type="button"
                  >
                    <span>{chapter.number}</span>
                    <strong>{chapter.title}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </Container>
        </nav>
      ) : null}

      <section aria-labelledby="today-title" className={styles.bookSection}>
        <Container size="wide">
          <div className={styles.openBook}>
            <article className={styles.bookPage}>
              <div
                aria-label={dailyCard.openedAt ? card.name[locale] : copy.card.title}
                className={styles.dailyCardVisual}
                data-open={dailyCard.openedAt || undefined}
                role="img"
              >
                <span className={styles.dailyCardInner}>
                  <span aria-hidden="true" className={styles.dailyCardBack}>
                    <i />
                    <b />
                  </span>
                  <span className={styles.dailyCardFront}>
                    <b aria-hidden="true">{card.visual.glyph}</b>
                    <strong>{card.name[locale]}</strong>
                  </span>
                </span>
              </div>
              <div className={styles.pageCopy}>
                <Typography as="p" variant="eyebrow">
                  {copy.card.eyebrow}
                </Typography>
                <Typography as="h2" id="today-title" variant="heading-lg">
                  {dailyCard.openedAt ? card.name[locale] : copy.card.title}
                </Typography>
                <div
                  className={styles.dailyDetails}
                  hidden={!dailyCard.openedAt}
                  id="daily-card-details"
                >
                  {dailyCard.openedAt ? (
                    <>
                      <p>
                        {dailyCard.selection.orientation === 'reversed'
                          ? card.reversed[locale]
                          : card.upright[locale]}
                      </p>
                      <p className={styles.dailyAction}>
                        <strong>{copy.card.action}</strong>
                        <span>{card.advice[locale]}</span>
                      </p>
                    </>
                  ) : null}
                </div>
                <Button
                  aria-controls="daily-card-details"
                  aria-expanded={Boolean(dailyCard.openedAt)}
                  disabled={Boolean(dailyCard.openedAt)}
                  onClick={openDailyCard}
                  prominence={dailyCard.openedAt ? 'secondary' : 'primary'}
                >
                  {dailyCard.openedAt ? copy.card.opened : copy.card.open}
                </Button>
              </div>
            </article>

            <article className={styles.bookPage}>
              <div className={styles.pageNumber} aria-hidden="true">
                {dateKey.slice(-2)}
              </div>
              <Typography as="p" variant="eyebrow">
                {copy.numbers.title}
              </Typography>
              <Typography as="h2" variant="heading-lg">
                {copy.hero.title}
              </Typography>
              <Typography className={styles.pageLead}>{copy.numbers.description}</Typography>
              {numerology ? (
                <dl className={styles.numberLines}>
                  {[
                    [copy.numbers.day, numerology.personalDay.value],
                    [copy.numbers.month, numerology.personalMonth.value],
                    [copy.numbers.year, numerology.personalYear.value],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <Typography className={styles.muted}>{copy.numbers.noDate}</Typography>
              )}
            </article>
          </div>
        </Container>
      </section>

      {currentChapter ? (
        <section aria-labelledby="current-chapter-title" className={styles.currentChapterSection}>
          <Container size="wide">
            <article className={styles.currentChapter}>
              <div className={styles.chapterKicker}>
                <span>{copy.book.currentChapter}</span>
                <b>{currentChapter.number}</b>
              </div>
              <div className={styles.chapterEditorial}>
                <Typography as="h2" id="current-chapter-title" variant="display">
                  {currentChapter.title}
                </Typography>
                <div className={styles.chapterMetadata}>
                  <span>{currentChapter.readingType}</span>
                  <span>{currentChapter.dominantTheme}</span>
                </div>
                <blockquote>“{currentChapter.quote}”</blockquote>
                <Typography className={styles.chapterSummary} variant="lead">
                  {currentChapter.record.reading.summary}
                </Typography>
                <div className={styles.chapterActions}>
                  <Button onClick={() => onOpenReading(currentChapter.record)} prominence="primary">
                    {copy.path.open}
                  </Button>
                  <Button
                    aria-pressed={currentChapter.record.favorite}
                    className={styles.bookmarkButton}
                    onClick={() => toggleBookmark(currentChapter.record)}
                    prominence="quiet"
                  >
                    <span aria-hidden="true" className={styles.bookmarkShape} />
                    {currentChapter.record.favorite
                      ? copy.path.removeBookmark
                      : copy.path.addBookmark}
                  </Button>
                </div>
              </div>
            </article>
          </Container>
        </section>
      ) : (
        <section className={styles.emptyChapter}>
          <Container size="default">
            <Stack align="center" gap="lg">
              <span aria-hidden="true" className={styles.emptyMonogram}>
                I
              </span>
              <Typography as="h2" variant="heading-lg">
                {copy.empty.title}
              </Typography>
              <Typography>{copy.empty.description}</Typography>
              <Button onClick={onExploreTarot} prominence="primary">
                {copy.empty.primary}
              </Button>
            </Stack>
          </Container>
        </section>
      )}

      <section aria-labelledby="year-book-title" className={styles.yearBookSection}>
        <Container size="wide">
          <div className={styles.yearBookPlaceholder}>
            <span aria-hidden="true" className={styles.yearBookMark}>
              MMXXVI
            </span>
            <Stack gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.yearBook.eyebrow}
              </Typography>
              <Typography as="h2" id="year-book-title" variant="heading-lg">
                {copy.yearBook.title}
              </Typography>
              <Typography>{copy.yearBook.description}</Typography>
            </Stack>
          </div>
        </Container>
      </section>

      <section aria-label={copy.quick.title} className={styles.closingNavigation}>
        <Container size="wide">
          <div>
            <Button onClick={onOpenPath} prominence="secondary">
              {copy.quick.pathTitle}
            </Button>
            <Button onClick={onExploreTarot} prominence="quiet">
              {copy.latest.explore}
            </Button>
            {profile ? (
              <Button onClick={onOpenLatestPortrait} prominence="quiet">
                {profile.title}
              </Button>
            ) : null}
          </div>
        </Container>
      </section>

      <p aria-atomic="true" aria-live="polite" className={styles.srOnly} role="status">
        {announcement}
      </p>
    </div>
  );
}
