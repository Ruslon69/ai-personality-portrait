import { useEffect, type ReactNode } from 'react';

import { ROUTES } from '@shared/config';
import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { Locale } from '@shared/i18n';
import { ButtonLink, Container, Typography } from '@shared/ui';

import {
  portraitRecoveryCopy,
  resolvePortraitResultAvailability,
} from '../data/portrait-result-recovery';
import styles from './PortraitResultBoundary.module.css';

export function PortraitResultRecovery({ locale }: { locale: Locale }) {
  const copy = portraitRecoveryCopy[locale];

  useEffect(() => focusElementByIdOnNextFrame('app-content'), []);

  return (
    <section aria-labelledby="portrait-recovery-title" className={styles.root}>
      <Container size="default">
        <div className={styles.content}>
          <span aria-hidden="true" className={styles.mark}>
            <i />
          </span>
          <Typography as="p" className={styles.eyebrow} variant="eyebrow">
            Soul Arkana
          </Typography>
          <Typography as="h1" id="portrait-recovery-title" variant="display">
            {copy.title}
          </Typography>
          <Typography className={styles.description} variant="lead">
            {copy.description}
          </Typography>
          <ButtonLink href={ROUTES.portrait} prominence="primary" size="large">
            {copy.action}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function PortraitResultBoundary<T>({
  children,
  locale,
  profile,
}: {
  children: (profile: T) => ReactNode;
  locale: Locale;
  profile: T | null;
}) {
  const availability = resolvePortraitResultAvailability(profile);

  return availability.kind === 'available' ? (
    <>{children(availability.profile)}</>
  ) : (
    <PortraitResultRecovery locale={locale} />
  );
}
