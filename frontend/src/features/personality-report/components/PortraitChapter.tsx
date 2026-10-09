import type { ReactNode } from 'react';

import { Container } from '@shared/ui';

import styles from './PersonalizedReport.module.css';

export function PortraitChapter({
  children,
  className = '',
  id,
  quiet = false,
}: {
  children: ReactNode;
  className?: string;
  id: string;
  quiet?: boolean;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={`${styles.chapter} ${className}`} id={id}>
      <Container size="wide">
        <div className={styles.chapterFrame} data-quiet={quiet || undefined}>
          {children}
        </div>
      </Container>
    </section>
  );
}
