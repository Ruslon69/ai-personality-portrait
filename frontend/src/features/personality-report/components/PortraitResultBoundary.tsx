import { useEffect, type ReactNode } from 'react';

import { ContentLayout } from '@app/layout';
import { ROUTES } from '@shared/config';
import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import type { Locale } from '@shared/i18n';
import { ButtonLink } from '@shared/ui';

import {
  portraitRecoveryCopy,
  resolvePortraitResultAvailability,
} from '../data/portrait-result-recovery';

export function PortraitResultRecovery({ locale }: { locale: Locale }) {
  const copy = portraitRecoveryCopy[locale];

  useEffect(() => focusElementByIdOnNextFrame('app-content'), []);

  return (
    <ContentLayout description={copy.description} title={copy.title}>
      <div>
        <ButtonLink href={ROUTES.portrait} prominence="primary" size="large">
          {copy.action}
        </ButtonLink>
      </div>
    </ContentLayout>
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
