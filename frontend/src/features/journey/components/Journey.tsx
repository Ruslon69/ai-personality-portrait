import { useEffect, useMemo, useState, type MouseEvent } from 'react';

import { useNotifications } from '@app/providers';
import type { PersonalityProfile } from '@entities/personality-profile';
import { TarotCardView, tarotCardById } from '@features/tarot';
import { messagesByLocale, type Locale } from '@shared/i18n';
import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { Button, ButtonLink, Container, Stack, Typography } from '@shared/ui';
import { ROUTES, type AppRoutePath } from '@shared/config';

import { journeyCopy, journeyPersistenceCopy } from '../data';
import { useJourney, useLocalDateKey } from '../hooks';
import { createDailyCard, dailyCardSectionId } from '../lib';
import type { JourneyReadingRecord } from '../types';
import { SavedReading } from './SavedReading';
import styles from './PersonalSpace.module.css';

type JourneyProps = {
  locale: Locale;
  hasNumerology?: boolean;
  numerologyUnsaved?: boolean;
  onNavigate?: (path: AppRoutePath) => void;
  onExploreTarot: () => void;
  onOpenLatestPortrait: () => void;
  onOpenPath: () => void;
  onOpenReading: (record: JourneyReadingRecord) => void;
  profile: PersonalityProfile | null;
};

export function Journey({
  locale,
  hasNumerology = false,
  numerologyUnsaved = false,
  onNavigate,
  onExploreTarot,
  onOpenLatestPortrait,
  onOpenPath,
  onOpenReading,
  profile,
}: JourneyProps) {
  const { notify } = useNotifications();
  const messages = messagesByLocale[locale];
  const { actions, state } = useJourney();
  const copy = journeyCopy[locale];
  const dateKey = useLocalDateKey();
  const latestReading = useMemo(
    () => [...state.readings].sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0],
    [state.readings],
  );
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
      notify((language) => journeyPersistenceCopy[language].dailyCardFailed, 'error');
      return;
    }

    const result = actions.openDailyCard(dateKey);
    if (result.persisted) setAnnouncement(`${card.name[locale]}. ${copy.card.opened}`);
    else notify((language) => journeyPersistenceCopy[language].dailyCardFailed, 'error');
  }

  const hasPrimaryResult = Boolean(latestReading || profile || hasNumerology);

  function followLink(event: MouseEvent<HTMLAnchorElement>, path: AppRoutePath) {
    if (
      !onNavigate ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onNavigate(path);
  }

  return (
    <div className={styles.root}>
      <section aria-labelledby="results-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroFrame}>
            <Stack align="start" gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.hero.eyebrow}
              </Typography>
              <Typography as="h1" id="results-title" tabIndex={-1} variant="display">
                {hasPrimaryResult ? copy.hero.title : copy.empty.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {hasPrimaryResult ? copy.hero.lead : copy.empty.description}
              </Typography>
              <div className={styles.actions}>
                <Button
                  onClick={onExploreTarot}
                  prominence={hasPrimaryResult ? 'quiet' : 'primary'}
                  size={hasPrimaryResult ? 'default' : 'large'}
                >
                  {hasPrimaryResult ? copy.latest.explore : copy.empty.primary}
                  <span aria-hidden="true">→</span>
                </Button>
                {hasPrimaryResult ? (
                  <Button onClick={onOpenPath} prominence="quiet">
                    {copy.book.openPath}
                  </Button>
                ) : (
                  <ButtonLink
                    href={ROUTES.portrait}
                    onClick={(event) => followLink(event, ROUTES.portrait)}
                    prominence="secondary"
                  >
                    {copy.empty.secondary}
                  </ButtonLink>
                )}
              </div>
            </Stack>

            <span aria-hidden="true" className={styles.celestialMark}>
              ✧
            </span>
          </div>
        </Container>
      </section>

      {latestReading ? (
        <section aria-label={copy.latest.title} className={styles.latestSection}>
          <Container size="wide">
            <SavedReading
              featured
              isPersisted={actions.isReadingPersisted(latestReading.reading.id)}
              record={latestReading}
              locale={locale}
              onOpen={onOpenReading}
            />
          </Container>
        </section>
      ) : null}

      <section aria-label={copy.quick.title} className={styles.archiveSection}>
        <Container size="wide">
          <div className={styles.archiveGrid}>
            {profile ? (
              <article className={styles.archivePortrait}>
                <Typography as="p" variant="eyebrow">
                  {copy.path.portraitMilestone}
                </Typography>
                <Typography as="h2" lang={profile.locale} variant="heading-lg">
                  {profile.revealHeadline}
                </Typography>
                <Typography className={styles.lead} lang={profile.locale}>
                  {profile.revealLead}
                </Typography>
                <p className={styles.sessionNote}>{copy.path.session}</p>
                <Button onClick={onOpenLatestPortrait} prominence="secondary">
                  {copy.quick.latestTitle} <span aria-hidden="true">→</span>
                </Button>
              </article>
            ) : null}
            <div className={styles.archiveIndex}>
              <Typography as="p" variant="eyebrow">
                {copy.quick.title}
              </Typography>
              <ButtonLink
                href={hasNumerology ? ROUTES.numerologyResult : ROUTES.numerology}
                onClick={(event) =>
                  followLink(event, hasNumerology ? ROUTES.numerologyResult : ROUTES.numerology)
                }
                prominence="quiet"
              >
                {hasNumerology ? copy.quick.numerologyContinue : messages.navigation.numerology}
                <span aria-hidden="true">→</span>
              </ButtonLink>
              {hasNumerology ? (
                <p className={styles.sessionNote}>
                  {numerologyUnsaved
                    ? productContractCopy[locale].numerologyUnsaved
                    : copy.quick.numerologySession}
                </p>
              ) : null}
              {!profile && hasPrimaryResult ? (
                <ButtonLink
                  href={ROUTES.portrait}
                  onClick={(event) => followLink(event, ROUTES.portrait)}
                  prominence="quiet"
                >
                  {copy.empty.secondary} <span aria-hidden="true">→</span>
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="today-title"
        className={styles.dailySection}
        id={dailyCardSectionId}
        tabIndex={-1}
        style={{ scrollMarginTop: '6rem' }}
      >
        <Container size="wide">
          <div className={styles.dailyGrid}>
            <div className={styles.dailyArt}>
              <TarotCardView
                isRevealed={Boolean(dailyCard.openedAt)}
                locale={locale}
                onClick={dailyCard.openedAt ? undefined : openDailyCard}
                selection={dailyCard.selection}
                theme="cosmic-minimal"
                variant="history"
              />
            </div>
            <Stack align="start" className={styles.dailyCopy} gap="md">
              <Typography as="p" variant="eyebrow">
                {copy.card.eyebrow}
              </Typography>
              <Typography as="h2" id="today-title" variant="heading-lg">
                {dailyCard.openedAt ? card.name[locale] : copy.card.title}
              </Typography>
              {dailyCard.openedAt ? (
                <>
                  <Typography className={styles.lead}>
                    {dailyCard.selection.orientation === 'reversed'
                      ? card.reversed[locale]
                      : card.upright[locale]}
                  </Typography>
                  <Typography className={styles.takeaway}>
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

      <p aria-atomic="true" aria-live="polite" className={styles.srOnly} role="status">
        {announcement}
      </p>
    </div>
  );
}
