import { Fragment } from 'react';

import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { ButtonLink, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './PortraitPage.module.css';

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function PortraitPage() {
  const { navigate } = useRouter();
  const { messages } = useI18n();
  const content = messages.start;

  const startQuestions = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    navigate(ROUTES.portraitQuestions);
  };

  return (
    <div className={styles.root}>
      <section aria-labelledby="start-portrait-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroFrame}>
            <div className={styles.heroGrid}>
              <Stack align="start" className={styles.heroContent} gap="lg">
                <Stack align="start" className={styles.heroCopy} gap="md">
                  <Typography as="p" className={styles.heroEyebrow} variant="eyebrow">
                    <span aria-hidden="true" className={styles.eyebrowSignal} />
                    {content.hero.eyebrow}
                  </Typography>
                  <Typography
                    as="h1"
                    className={styles.heroTitle}
                    id="start-portrait-title"
                    variant="display"
                  >
                    {content.hero.title.map((line, index) => (
                      <Fragment key={line}>
                        {index > 0 ? ' ' : null}
                        <span className={styles.titleLine}>{line}</span>
                      </Fragment>
                    ))}
                  </Typography>
                  <Typography className={styles.heroDescription} variant="lead">
                    {content.hero.description}
                  </Typography>
                </Stack>

                <ButtonLink
                  aria-describedby="start-duration-note"
                  className={styles.primaryCta}
                  href={ROUTES.portraitQuestions}
                  onClick={startQuestions}
                  prominence="primary"
                  size="large"
                >
                  {content.hero.primaryCta}
                  <span aria-hidden="true" className={styles.ctaArrow}>
                    →
                  </span>
                </ButtonLink>

                <Typography className={styles.heroNote} id="start-duration-note" variant="caption">
                  {content.hero.note}
                </Typography>
              </Stack>

              <div
                aria-label={`${content.journey.title}. ${content.journey.items
                  .map((item) => item.title)
                  .join('. ')}`}
                className={styles.journeyVisual}
                role="img"
              >
                <div aria-hidden="true" className={styles.journeyOrbit} />
                <div aria-hidden="true" className={styles.journeyCore}>
                  <span>AI</span>
                </div>
                <ol aria-hidden="true" className={styles.journeyTrack}>
                  {content.journey.items.map((item, index) => (
                    <li key={item.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.title}</strong>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="journey-title" className={styles.section}>
        <Container size="wide">
          <Stack gap="xl">
            <div className={styles.sectionHeading}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {content.journey.eyebrow}
                </Typography>
                <Typography as="h2" id="journey-title" variant="heading-lg">
                  {content.journey.title}
                </Typography>
              </Stack>
              <Typography className={styles.sectionLead}>{content.hero.note}</Typography>
            </div>

            <ol className={styles.journeyList}>
              {content.journey.items.map((step, index) => (
                <li className={styles.journeyStep} key={step.title}>
                  <div aria-hidden="true" className={styles.stepIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <Stack gap="sm">
                    <Typography as="h3" variant="heading-sm">
                      {step.title}
                    </Typography>
                    <Typography className={styles.mutedText}>{step.description}</Typography>
                  </Stack>
                </li>
              ))}
            </ol>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="essentials-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.essentialsSurface}>
            <div className={styles.essentialsHeading}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {content.essentials.eyebrow}
                </Typography>
                <Typography as="h2" id="essentials-title" variant="heading-lg">
                  {content.essentials.title}
                </Typography>
              </Stack>
              <Typography className={styles.sectionLead}>
                {content.essentials.description}
              </Typography>
            </div>

            <dl className={styles.essentialsList}>
              {content.essentials.items.map((item, index) => (
                <div className={styles.essentialItem} key={item.title}>
                  <dt>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </dt>
                  <dd>
                    <Typography as="span" variant="heading-sm">
                      {item.title}
                    </Typography>
                    <Typography className={styles.mutedText}>{item.description}</Typography>
                    {item.badge ? (
                      <Typography as="span" className={styles.essentialBadge} variant="caption">
                        {item.badge}
                      </Typography>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="result-title" className={styles.section}>
        <Container size="wide">
          <div className={styles.resultFrame}>
            <Stack className={styles.resultCopy} gap="md">
              <Typography as="p" variant="eyebrow">
                {content.result.eyebrow}
              </Typography>
              <Typography as="h2" id="result-title" variant="heading-lg">
                {content.result.title}
              </Typography>
              <Typography className={styles.sectionLead}>{content.result.description}</Typography>
            </Stack>
            <ul className={styles.resultPoints}>
              {content.result.points.map((point, index) => (
                <li key={point}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-labelledby="start-privacy-title" className={styles.privacySection}>
        <Container size="wide">
          <Surface className={styles.privacySurface}>
            <div className={styles.privacyGrid}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {content.privacy.eyebrow}
                </Typography>
                <Typography as="h2" id="start-privacy-title" variant="heading-lg">
                  {content.privacy.title}
                </Typography>
              </Stack>
              <Typography className={styles.privacyCopy}>{content.privacy.description}</Typography>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="start-cta-title" className={styles.finalSection}>
        <Container size="wide">
          <div className={styles.finalFrame}>
            <Stack className={styles.finalCopy} gap="sm">
              <Typography as="h2" id="start-cta-title" variant="heading-lg">
                {content.final.title}
              </Typography>
              <Typography>{content.final.description}</Typography>
            </Stack>
            <ButtonLink
              className={styles.primaryCta}
              href={ROUTES.portraitQuestions}
              onClick={startQuestions}
              prominence="primary"
              size="large"
            >
              {content.hero.primaryCta}
              <span aria-hidden="true" className={styles.ctaArrow}>
                →
              </span>
            </ButtonLink>
          </div>
        </Container>
      </section>
    </div>
  );
}
