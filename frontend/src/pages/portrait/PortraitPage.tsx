import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { ButtonLink, Container, Stack, Surface, Typography } from '@shared/ui';
import { draftPortraitActions } from '@store';

import styles from './PortraitPage.module.css';

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function PortraitPage() {
  const { navigate } = useRouter();
  const { messages } = useI18n();
  const content = messages.start;

  const startQuestions = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) return;

    event.preventDefault();
    draftPortraitActions.resetDraft();
    navigate(ROUTES.portraitQuestions);
  };

  return (
    <div className={styles.root}>
      <section aria-labelledby="start-portrait-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroFrame}>
            <div className={styles.heroGrid}>
              <Stack align="start" className={styles.heroContent} gap="lg">
                <Typography as="p" className={styles.eyebrow} variant="eyebrow">
                  {content.hero.eyebrow}
                </Typography>
                <Typography
                  as="h1"
                  className={styles.heroTitle}
                  id="start-portrait-title"
                  variant="display"
                >
                  {content.hero.title.join(' ')}
                </Typography>
                <Typography className={styles.heroDescription} variant="lead">
                  {content.hero.description}
                </Typography>
                <ButtonLink
                  aria-describedby="start-duration-note"
                  href={ROUTES.portraitQuestions}
                  onClick={startQuestions}
                  prominence="primary"
                  size="large"
                >
                  {content.hero.primaryCta}
                  <span aria-hidden="true">→</span>
                </ButtonLink>
                <Typography className={styles.heroNote} id="start-duration-note" variant="caption">
                  {content.hero.note}
                </Typography>
              </Stack>

              <div aria-hidden="true" className={styles.portraitVisual}>
                <span className={styles.faceLine} />
                <span className={styles.observationDot} />
                <span className={styles.observationDot} />
                <span className={styles.observationDot} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="essentials-title" className={styles.summarySection}>
        <Container size="wide">
          <Typography
            as="h2"
            className={styles.summaryTitle}
            id="essentials-title"
            variant="heading-md"
          >
            {content.essentials.title}
          </Typography>
          <div className={styles.summaryGrid}>
            {content.essentials.items.map((item) => (
              <div className={styles.summaryItem} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.detailsSection}>
        <Container size="default">
          <details className={styles.details}>
            <summary>{content.journey.title}</summary>
            <div className={styles.detailsContent}>
              <ol>
                {content.journey.items.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong>
                    <span>{step.description}</span>
                  </li>
                ))}
              </ol>
              <Surface className={styles.privacyNote}>
                <Typography as="h3" variant="heading-sm">
                  {content.privacy.title}
                </Typography>
                <Typography>{content.privacy.description}</Typography>
              </Surface>
            </div>
          </details>
        </Container>
      </section>
    </div>
  );
}
