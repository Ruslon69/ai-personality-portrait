import { zodiacTraditionNames } from '@shared/i18n/zodiac-names';
import type { ReactNode } from 'react';

import type { ZodiacArtwork as Artwork } from '@assets/zodiac';
import type { Locale } from '@shared/i18n';

import { ZodiacArtwork } from './ZodiacArtwork';
import styles from './ZodiacChapter.module.css';

/** Presentation accepts an already resolved identity; it never infers a sign. */
export function ZodiacChapter({
  artwork,
  children,
  locale,
  title,
  contentLocale = locale,
}: {
  artwork: Artwork;
  children: ReactNode;
  locale: Locale;
  contentLocale?: Locale;
  title: string;
}) {
  if (artwork.reviewStatus !== 'verified') return null;
  return (
    <div className={styles.chapter} data-zodiac-chapter={artwork.system}>
      <div className={styles.copy}>
        <p className={styles.tradition}>{zodiacTraditionNames[locale][artwork.system]}</p>
        <h3 lang={contentLocale}>{title}</h3>
        <div className={styles.body}>{children}</div>
      </div>
      <div className={styles.visual}>
        <span aria-hidden="true" className={styles.orbit} />
        <ZodiacArtwork
          artwork={artwork}
          locale={locale}
          sizes="(min-width: 90rem) 720px, (min-width: 48rem) 52vw, calc(100vw - 2rem)"
        />
      </div>
    </div>
  );
}
