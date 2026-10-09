import { Container, Stack, Typography } from '@shared/ui';

import type { LegalDocument } from './legal-copy';
import styles from './LegalPage.module.css';

type LegalPageProps = {
  document: LegalDocument;
};

export function LegalPage({ document }: LegalPageProps) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!/^legal-section-\d+$/.test(id)) return;
    const frame = window.requestAnimationFrame(() => {
      const heading = window.document.getElementById(id);
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [document]);
  return (
    <div className={styles.root}>
      <Container>
        <article className={styles.article}>
          <Stack align="start" className={styles.introduction} gap="md">
            <Typography as="p" variant="eyebrow">
              {document.eyebrow}
            </Typography>
            <Typography as="h1" variant="display">
              {document.title}
            </Typography>
            <Typography className={styles.intro} variant="lead">
              {document.intro}
            </Typography>
            <Typography className={styles.effectiveDate} variant="caption">
              {document.effectiveDate}
            </Typography>
            <aside className={styles.notice}>
              <Typography>{document.ownerNotice}</Typography>
            </aside>
          </Stack>

          <nav aria-label={document.title} className={styles.contents}>
            {document.sections.map((section, index) => (
              <a href={`#legal-section-${index + 1}`} key={section.title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </a>
            ))}
          </nav>

          <div className={styles.sections}>
            {document.sections.map((section, index) => (
              <section className={styles.section} key={section.title}>
                <span aria-hidden="true" className={styles.sectionNumber}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Typography
                  as="h2"
                  id={`legal-section-${index + 1}`}
                  tabIndex={-1}
                  variant="heading-md"
                >
                  {section.title}
                </Typography>
                {section.paragraphs?.map((paragraph) => (
                  <Typography key={paragraph}>{paragraph}</Typography>
                ))}
                {section.items ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>
                        <Typography>{item}</Typography>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </Container>
    </div>
  );
}
import { useEffect } from 'react';
