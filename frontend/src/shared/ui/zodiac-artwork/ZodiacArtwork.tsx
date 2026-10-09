import type { ZodiacArtwork as Artwork } from '@assets/zodiac';
import type { Locale } from '@shared/i18n';

import styles from './ZodiacArtwork.module.css';

type Props = {
  artwork: Artwork;
  locale: Locale;
  sizes: string;
  loading?: 'eager' | 'lazy';
};

export function ZodiacArtwork({ artwork, locale, sizes, loading = 'lazy' }: Props) {
  // An identity mismatch must never become a misleading product illustration.
  if (artwork.reviewStatus !== 'verified') return null;
  return (
    <div className={styles.artwork} data-zodiac-artwork={artwork.id}>
      <img
        alt={artwork.descriptions[locale]}
        decoding="async"
        height={artwork.height}
        loading={loading}
        sizes={sizes}
        src={artwork.variants[0]?.src}
        srcSet={artwork.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ')}
        style={{ objectPosition: artwork.objectPosition }}
        width={artwork.width}
      />
    </div>
  );
}
