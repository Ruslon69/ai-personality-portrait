import type { ProfileLocale } from '@entities/personality-profile';
import { Container } from '@shared/ui';

import {
  portraitJourneyCopy,
  type PortraitDestinationId,
  type PortraitTransitionKey,
} from '../data/portrait-journey-copy';
import { navigateToPortraitSection } from './navigate-to-portrait-section';
import styles from './PersonalizedReport.module.css';

export function PortraitSectionTransition({
  contained = false,
  from,
  locale,
  to,
}: {
  contained?: boolean;
  from: PortraitTransitionKey;
  locale: ProfileLocale;
  to: PortraitDestinationId;
}) {
  const copy = portraitJourneyCopy[locale];
  const transition = copy.transitions[from];

  const content = (
    <div className={styles.transitionInner}>
      <span className={styles.transitionEyebrow}>{transition.eyebrow}</span>
      <p className={styles.transitionLead}>{transition.lead}</p>
      <a
        className={styles.transitionLink}
        href={`#${to}`}
        onClick={(event) => {
          event.preventDefault();
          navigateToPortraitSection(to, true);
        }}
      >
        {copy.sections[to]}
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
  return (
    <div
      className={styles.transition}
      data-contained={contained || undefined}
      data-from-section={from}
      data-next-section={to}
    >
      {contained ? content : <Container size="wide">{content}</Container>}
    </div>
  );
}
