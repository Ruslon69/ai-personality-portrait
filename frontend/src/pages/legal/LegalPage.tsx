import { Container, Stack, Surface, Typography } from '@shared/ui';

import type { LegalDocument } from './legal-copy';
import styles from './LegalPage.module.css';

type LegalPageProps = {
  document: LegalDocument;
};

export function LegalPage({ document }: LegalPageProps) {
  return (
    <div className={styles.root}>
      <Container>
        <article className={styles.article}>
          <Stack align="start" gap="md">
            <Typography as="p" variant="eyebrow">
              {document.eyebrow}
            </Typography>
            <Typography as="h1" variant="display">
              {document.title}
            </Typography>
            <Typography className={styles.intro} variant="lead">
              {document.intro}
            </Typography>
            <Typography variant="caption">{document.effectiveDate}</Typography>
            <Surface className={styles.notice}>
              <Typography>{document.ownerNotice}</Typography>
            </Surface>
          </Stack>

          <div className={styles.sections}>
            {document.sections.map((section) => (
              <section className={styles.section} key={section.title}>
                <Typography as="h2" variant="heading-md">
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
