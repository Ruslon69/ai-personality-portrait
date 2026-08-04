import type { ProfileLocale, SourceReference } from '@entities/personality-profile';

import styles from './Explainability.module.css';

type SourceChipProps = {
  locale?: ProfileLocale;
  source: SourceReference;
};

export function SourceSymbol({ source }: SourceChipProps) {
  const commonProps = {
    'aria-hidden': true,
    className: styles.sourceIcon,
    viewBox: '0 0 20 20',
  } as const;

  if (source.id === 'answers') {
    return (
      <svg {...commonProps}>
        <circle cx="4" cy="5" r="1.2" />
        <circle cx="4" cy="10" r="1.2" />
        <circle cx="4" cy="15" r="1.2" />
        <path d="M7 5h9M7 10h7M7 15h9" />
      </svg>
    );
  }

  if (source.id === 'interests') {
    return (
      <svg {...commonProps}>
        <circle cx="10" cy="10" r="2" />
        <circle cx="4" cy="5" r="1.5" />
        <circle cx="16" cy="6" r="1.5" />
        <circle cx="15" cy="15" r="1.5" />
        <path d="m5.3 5.9 3.2 2.8m3.1.1 3.1-2m-3.2 4.8 2.5 2.3" />
      </svg>
    );
  }

  if (source.id === 'voice') {
    return (
      <svg {...commonProps}>
        <path d="M2 10h2l1.5-4 2.3 8 2.2-10 2.3 12 2.2-8 1.5 2h2" />
      </svg>
    );
  }

  if (source.id === 'numerology') {
    return (
      <svg {...commonProps}>
        <path d="M7 3 5 17m8-14-2 14M3 8h14M2 13h14" />
      </svg>
    );
  }

  if (source.id === 'zodiac') {
    return (
      <svg {...commonProps}>
        <circle cx="10" cy="10" r="6.5" />
        <circle cx="10" cy="3.5" r="1" />
        <circle cx="16.5" cy="10" r="1" />
        <circle cx="10" cy="16.5" r="1" />
        <path d="m5.4 5.6 4.6 4.4 4.6-4.4" />
      </svg>
    );
  }

  if (source.id === 'birth-date') {
    return (
      <svg {...commonProps}>
        <rect height="13" rx="2" width="14" x="3" y="4" />
        <path d="M6 2.5v3M14 2.5v3M3 8h14M7 11h2m2 0h2m-6 3h2" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="10" cy="10" r="2" />
      <ellipse cx="10" cy="10" rx="8" ry="4" />
      <path d="M10 2c2.2 2.1 3.2 4.8 3 8-.2 3.2-1.2 5.8-3 8" />
    </svg>
  );
}

export function SourceChip({ locale = 'ru', source }: SourceChipProps) {
  const prefix = locale === 'en' ? 'Source' : locale === 'uk' ? 'Джерело' : 'Источник';
  return (
    <span className={styles.sourceChip} data-category={source.category} data-source={source.id}>
      <SourceSymbol source={source} />
      <span className={styles.visuallyHidden}>
        {prefix}: {source.label}.{' '}
      </span>
      <span aria-hidden="true">{source.shortLabel}</span>
    </span>
  );
}
