import { useState } from 'react';

import { appConfig } from '@shared/config';

import styles from './BrandIdentity.module.css';

type BrandIdentityProps = {
  decorative?: boolean;
  variant?: 'full' | 'header' | 'compact';
};

/** One identity; full artwork is loaded only in explicitly larger brand contexts. */
export function BrandIdentity({ decorative = false, variant = 'header' }: BrandIdentityProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : appConfig.brand.name}
      className={styles.root}
      data-brand-identity={variant}
      data-image-failed={imageFailed || undefined}
      role={decorative ? undefined : 'img'}
    >
      {!imageFailed ? (
        <img
          alt=""
          aria-hidden="true"
          className={styles.emblem}
          decoding="async"
          height={variant === 'full' ? 501 : 64}
          loading={variant === 'full' ? 'lazy' : 'eager'}
          onError={() => setImageFailed(true)}
          sizes={variant === 'full' ? '192px' : undefined}
          src={variant === 'full' ? '/brand/emblem-384.webp' : '/brand/compact-mark.svg'}
          srcSet={
            variant === 'full'
              ? '/brand/emblem-384.webp 384w, /brand/emblem-768.webp 768w'
              : undefined
          }
          width={variant === 'full' ? 384 : 64}
        />
      ) : null}
      <span aria-hidden="true" className={styles.wordmark} data-brand-wordmark>
        {appConfig.brand.displayName}
      </span>
    </span>
  );
}
