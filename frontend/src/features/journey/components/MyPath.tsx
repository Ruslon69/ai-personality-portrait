import { useMemo, useState } from 'react';

import { useNotifications } from '@app/providers';
import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { localeDefinitions, type Locale } from '@shared/i18n';
import { Button, ButtonLink, Container, Stack, Typography } from '@shared/ui';
import { ROUTES } from '@shared/config';

import { journeyCopy, journeyPersistenceCopy, tarotHistoryCopy } from '../data';
import { useJourney } from '../hooks';
import type { JourneyReadingRecord } from '../types';
import { SavedReading } from './SavedReading';
import styles from './PersonalSpace.module.css';

export function MyPath({
  locale,
  onBack,
  onExplore,
  onExplorePortrait,
  onManageReadings,
  onOpenPortrait,
  onOpenReading,
  profiles,
}: {
  locale: Locale;
  onBack: () => void;
  onExplore: () => void;
  onExplorePortrait?: () => void;
  onManageReadings: () => void;
  onOpenPortrait: (profile: PersonalityProfile) => void;
  onOpenReading: (record: JourneyReadingRecord) => void;
  profiles: readonly PersonalityProfile[];
}) {
  const { notify } = useNotifications();
  const { actions, state } = useJourney();
  const copy = journeyCopy[locale];
  const [announcement, setAnnouncement] = useState('');
  const entries = useMemo(
    () =>
      [
        ...state.readings.map((record) => ({
          kind: 'tarot' as const,
          date: record.savedAt,
          record,
        })),
        ...profiles.map((profile) => ({
          kind: 'portrait' as const,
          date: profile.createdAt,
          profile,
        })),
      ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    [state.readings, profiles],
  );

  const groups = entries.reduce<{ key: string; date: string; entries: typeof entries }[]>(
    (result, entry) => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const previous = result.at(-1);
      if (previous?.key === key) previous.entries.push(entry);
      else result.push({ key, date: entry.date, entries: [entry] });
      return result;
    },
    [],
  );

  function toggleBookmark(record: JourneyReadingRecord) {
    const result = actions.toggleFavorite(record.reading.id);
    if (result.persisted) {
      setAnnouncement(record.favorite ? copy.path.removedBookmark : copy.path.addedBookmark);
    } else notify((language) => journeyPersistenceCopy[language].favoriteFailed, 'error');
  }

  return (
    <div className={styles.root}>
      <section aria-labelledby="path-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroFrame}>
            <Stack align="start" gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.path.eyebrow}
              </Typography>
              <Typography as="h1" id="path-title" tabIndex={-1} variant="display">
                {copy.path.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {copy.path.lead}
              </Typography>
              <div className={styles.actions}>
                {entries.length ? (
                  <Button onClick={onExplore} prominence="quiet">
                    {copy.latest.explore} <span aria-hidden="true">→</span>
                  </Button>
                ) : null}
                <Button onClick={onBack} prominence="quiet">
                  {copy.path.back}
                </Button>
              </div>
            </Stack>
            <span aria-hidden="true" className={styles.celestialMark}>
              ✧
            </span>
          </div>
        </Container>
      </section>

      <section aria-label={copy.book.chapterNavigation} className={styles.historySection}>
        <Container size="wide">
          {entries.length ? (
            <>
              {groups.map((group) => (
                <section
                  className={styles.archiveMonth}
                  key={group.key}
                  aria-labelledby={`archive-${group.key}`}
                >
                  <h2 id={`archive-${group.key}`} className={styles.monthHeading}>
                    {new Intl.DateTimeFormat(localeDefinitions[locale].formatTag, {
                      month: 'long',
                      year: 'numeric',
                    }).format(new Date(group.date))}
                  </h2>
                  <ol className={styles.timeline}>
                    {group.entries.map((entry) =>
                      entry.kind === 'tarot' ? (
                        <li key={entry.record.reading.id}>
                          <SavedReading
                            isPersisted={actions.isReadingPersisted(entry.record.reading.id)}
                            headingLevel="h3"
                            record={entry.record}
                            locale={locale}
                            onOpen={onOpenReading}
                          >
                            <Button
                              aria-describedby={`saved-reading-${entry.record.reading.id}`}
                              aria-pressed={entry.record.favorite}
                              onClick={() => toggleBookmark(entry.record)}
                              prominence="quiet"
                            >
                              <span aria-hidden="true">{entry.record.favorite ? '◆' : '◇'}</span>
                              {entry.record.favorite
                                ? copy.path.removeBookmark
                                : copy.path.addBookmark}
                            </Button>
                          </SavedReading>
                        </li>
                      ) : (
                        <li key={entry.profile.id}>
                          <article className={styles.savedPortrait}>
                            <span aria-hidden="true" className={styles.portraitMark}>
                              <PortraitMark identity={entry.profile.visualIdentity} size="sm" />
                            </span>
                            <div className={styles.readingCopy}>
                              <div className={styles.metadata}>
                                <span>{copy.path.portraitMilestone}</span>
                                <time dateTime={entry.date}>
                                  {new Intl.DateTimeFormat(localeDefinitions[locale].formatTag, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  }).format(new Date(entry.date))}
                                </time>
                              </div>
                              <Typography
                                as="h3"
                                id={`saved-portrait-${entry.profile.id}`}
                                lang={entry.profile.locale}
                                variant="heading-lg"
                              >
                                {entry.profile.revealHeadline}
                              </Typography>
                              <p className={styles.sessionNote}>{copy.path.session}</p>
                              <div className={styles.actions}>
                                <Button
                                  aria-describedby={`saved-portrait-${entry.profile.id}`}
                                  onClick={() => onOpenPortrait(entry.profile)}
                                  prominence="secondary"
                                >
                                  {copy.quick.latestTitle} <span aria-hidden="true">→</span>
                                </Button>
                              </div>
                            </div>
                          </article>
                        </li>
                      ),
                    )}
                  </ol>
                </section>
              ))}
              {state.readings.length ? (
                <div className={styles.utilityNavigation}>
                  <Button onClick={onManageReadings} prominence="quiet">
                    {copy.path.manage} <span aria-hidden="true">→</span>
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.empty}>
              <span aria-hidden="true" className={styles.emptyMark}>
                ✧
              </span>
              <Typography as="h2" variant="heading-lg">
                {tarotHistoryCopy[locale].emptyTitle}
              </Typography>
              <Typography>{copy.path.empty}</Typography>
              <div className={styles.actions}>
                <Button onClick={onExplore} prominence="primary">
                  {copy.empty.primary}
                </Button>
                <ButtonLink
                  href={ROUTES.portrait}
                  onClick={(event) => {
                    if (
                      !onExplorePortrait ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    onExplorePortrait();
                  }}
                  prominence="secondary"
                >
                  {copy.empty.secondary}
                </ButtonLink>
              </div>
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
