import { Typography } from '@shared/ui';

import styles from './Explainability.module.css';

type ExplanationSectionProps = {
  children: React.ReactNode;
  id: string;
  title: string;
};

export function ExplanationSection({ children, id, title }: ExplanationSectionProps) {
  return (
    <section aria-labelledby={id} className={styles.explanationSection}>
      <Typography as="h4" id={id} variant="heading-sm">
        {title}
      </Typography>
      {children}
    </section>
  );
}
