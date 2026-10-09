import type { ReactNode } from 'react';

import { TarotCardView } from '@features/tarot';
import { localeDefinitions, type Locale } from '@shared/i18n';
import { productContractCopy } from '@shared/i18n/product-contract-copy';
import { Button, Typography } from '@shared/ui';

import { journeyCopy } from '../data';
import { historySnapshotForRecord } from '../lib';
import type { JourneyReadingRecord } from '../types';
import styles from './PersonalSpace.module.css';

/** Presentation reads the saved snapshot; opening always receives the original record. */
export function SavedReading({
  record,
  locale,
  onOpen,
  featured = false,
  isPersisted = true,
  children,
  headingLevel = 'h2',
}: {
  record: JourneyReadingRecord;
  locale: Locale;
  onOpen: (record: JourneyReadingRecord) => void;
  featured?: boolean;
  isPersisted?: boolean;
  children?: ReactNode;
  headingLevel?: 'h2' | 'h3';
}) {
  const snapshot = historySnapshotForRecord(record);
  const selection =
    snapshot.selections.find((item) => item.cardId === record.reading.leadingCardId) ??
    snapshot.selections[0];
  const copy = journeyCopy[locale];
  const date = new Intl.DateTimeFormat(localeDefinitions[locale].formatTag, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(record.savedAt));

  return (
    <article className={styles.savedReading} data-featured={featured || undefined}>
      {selection ? (
        <div className={styles.readingArt} lang={snapshot.locale}>
          <TarotCardView
            instantReveal
            isRevealed
            locale={snapshot.locale}
            selection={selection}
            showPosition={false}
            theme={record.reading.context.deckTheme}
            variant="history"
          />
        </div>
      ) : null}
      <div className={styles.readingCopy}>
        {featured ? <p className={styles.eyebrow}>{copy.latest.title}</p> : null}
        <div className={styles.metadata}>
          <span lang={snapshot.locale}>{snapshot.spreadTitle}</span>
          <time dateTime={record.savedAt}>{date}</time>
        </div>
        <Typography
          as={headingLevel}
          id={`saved-reading-${record.reading.id}`}
          lang={snapshot.locale}
          variant="heading-lg"
        >
          {snapshot.resultHeadline}
        </Typography>
        {featured ? (
          <p className={styles.takeaway} lang={record.reading.context.locale}>
            {record.reading.practicalFocus}
          </p>
        ) : null}
        {!isPersisted ? (
          <p className={styles.sessionNote} role="status">
            {productContractCopy[locale].tarotUnsaved}
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button
            aria-describedby={`saved-reading-${record.reading.id}`}
            onClick={() => onOpen(record)}
            prominence={featured ? 'primary' : 'secondary'}
          >
            {featured ? copy.latest.continue : copy.path.open}
            <span aria-hidden="true">→</span>
          </Button>
          {children}
        </div>
        <details className={styles.details}>
          <summary>{copy.path.details}</summary>
          <div lang={snapshot.locale}>
            <p className={styles.synthesis}>{snapshot.finalSynthesis}</p>
            {!featured && record.reading.practicalFocus !== snapshot.finalSynthesis ? (
              <p className={styles.takeaway}>{record.reading.practicalFocus}</p>
            ) : null}
            {snapshot.motifs.length ? (
              <ul className={styles.motifs}>
                {snapshot.motifs.map((motif) => (
                  <li key={motif}>{motif}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      </div>
    </article>
  );
}
