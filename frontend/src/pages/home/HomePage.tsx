import { Fragment } from 'react';

import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import type { I18nMessages } from '@shared/i18n';
import { ButtonLink, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './HomePage.module.css';

const heroNodeClasses = [
  styles.heroNodeAnswers,
  styles.heroNodeInterests,
  styles.heroNodeZodiac,
  styles.heroNodeNumerology,
  styles.heroNodeVoice,
] as const;

const bentoClasses = [
  styles.bentoCard1,
  styles.bentoCard2,
  styles.bentoCard3,
  styles.bentoCard4,
  styles.bentoCard5,
] as const;

const numerologyValues = ['1', '3', '7', '9', '11', '22'] as const;

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

type HeroVisualContent = I18nMessages['home']['hero']['visual'];

function LivingPortrait({ content }: { content: HeroVisualContent }) {
  return (
    <figure aria-label={content.ariaLabel} className={styles.livingPortrait} role="img">
      <svg
        aria-hidden="true"
        className={styles.portraitNetwork}
        focusable="false"
        viewBox="0 0 600 600"
      >
        <g className={styles.coordinateGrid}>
          <path d="M100 0V600M200 0V600M300 0V600M400 0V600M500 0V600" />
          <path d="M0 100H600M0 200H600M0 300H600M0 400H600M0 500H600" />
        </g>
        <g className={styles.orbitLines}>
          <ellipse cx="300" cy="300" rx="236" ry="154" transform="rotate(-14 300 300)" />
          <ellipse cx="300" cy="300" rx="184" ry="244" transform="rotate(22 300 300)" />
          <circle cx="300" cy="300" r="112" />
        </g>
        <g className={styles.digitalPrint}>
          <path d="M266 356C224 316 232 242 286 218C346 190 408 238 392 300" />
          <path d="M244 376C182 316 202 210 278 180C366 144 456 216 430 316" />
          <path d="M292 382C258 348 260 288 300 270C342 252 374 288 364 330" />
        </g>
      </svg>

      <svg
        aria-hidden="true"
        className={styles.connectionNetwork}
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 600 600"
      >
        <g className={styles.connectionLines}>
          <path
            className={styles.connectionAnswers}
            d="M96 50C146 88 184 156 210 210"
            pathLength="1"
          />
          <path
            className={styles.connectionInterests}
            d="M500 104C452 124 416 170 390 210"
            pathLength="1"
          />
          <path
            className={styles.connectionZodiac}
            d="M480 470C442 450 412 416 390 390"
            pathLength="1"
          />
          <path
            className={styles.connectionNumerology}
            d="M150 540C180 486 198 430 210 390"
            pathLength="1"
          />
          <path
            className={styles.connectionVoice}
            d="M94 305C124 303 148 302 166 300"
            pathLength="1"
          />
        </g>
      </svg>

      <div aria-hidden="true" className={styles.portraitCore}>
        <span className={styles.corePulse} />
        <Typography as="span" className={styles.coreLabel} variant="caption">
          {content.coreLabel}
        </Typography>
        <Typography as="span" className={styles.coreValue} variant="heading-md">
          {content.coreValue}
        </Typography>
        <Typography as="span" className={styles.coreStatus} variant="caption">
          {content.coreStatus}
        </Typography>
      </div>

      {content.layers.map((layer, index) => (
        <div
          aria-hidden="true"
          className={`${styles.heroNode} ${heroNodeClasses[index] ?? ''}`}
          key={layer}
        >
          <span className={styles.nodePoint} />
          <span>{layer}</span>
        </div>
      ))}
    </figure>
  );
}

function BentoMotif({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div aria-hidden="true" className={`${styles.bentoMotif} ${styles.linkMotif}`}>
        <span className={styles.linkNode} />
        <span className={styles.linkNode} />
        <span className={styles.linkNode} />
        <span className={styles.linkCore} />
        <i />
        <i />
        <i />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div aria-hidden="true" className={`${styles.bentoMotif} ${styles.layerMotif}`}>
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (index === 2) {
    return (
      <div aria-hidden="true" className={`${styles.bentoMotif} ${styles.orbitMotif}`}>
        <span />
        <span />
        <i />
      </div>
    );
  }

  if (index === 3) {
    return (
      <div aria-hidden="true" className={`${styles.bentoMotif} ${styles.actionMotif}`}>
        <span>01</span>
        <i />
        <span>02</span>
        <b />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`${styles.bentoMotif} ${styles.depthMotif}`}>
      <span />
      <span />
      <span />
    </div>
  );
}

function ProcessMotif() {
  return (
    <span aria-hidden="true" className={styles.processMotif}>
      <i />
      <i />
      <i />
      <b />
    </span>
  );
}

function ThematicLayerVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div aria-hidden="true" className={`${styles.thematicVisual} ${styles.questionsVisual}`}>
        <div className={styles.questionPrompt}>
          <i />
          <i />
        </div>
        <div className={styles.answerOptions}>
          <span>
            <i />
          </span>
          <span className={styles.selectedOption}>
            <i />
          </span>
          <span>
            <i />
          </span>
        </div>
        <div className={styles.questionProgress}>
          <span>01</span>
          <i />
        </div>
        <b className={styles.confirmLine} />
      </div>
    );
  }

  if (index === 1) {
    return (
      <svg
        aria-hidden="true"
        className={`${styles.thematicVisual} ${styles.interestsVisual}`}
        focusable="false"
        viewBox="0 0 120 120"
      >
        <g className={styles.interestLinks}>
          <path d="M60 60L24 28M60 60L94 25M60 60L101 72M60 60L66 102M60 60L19 84" />
        </g>
        <g className={styles.interestNodes}>
          <circle cx="24" cy="28" r="7" />
          <circle cx="94" cy="25" r="5" />
          <circle cx="101" cy="72" r="7" />
          <circle cx="66" cy="102" r="5" />
          <circle cx="19" cy="84" r="5" />
        </g>
        <g className={styles.interestActiveNodes}>
          <circle cx="24" cy="28" r="3" />
          <circle cx="101" cy="72" r="3" />
          <circle cx="66" cy="102" r="3" />
        </g>
        <circle className={styles.interestCore} cx="60" cy="60" r="13" />
        <circle className={styles.interestCoreDot} cx="60" cy="60" r="4" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <div aria-hidden="true" className={`${styles.thematicVisual} ${styles.voiceVisual}`}>
        <div className={styles.voiceWave}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={styles.voiceTimeline}>
          <span>00:32</span>
          <i />
        </div>
        <div className={styles.voiceQuality}>
          <i />
          <i />
          <i />
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div aria-hidden="true" className={`${styles.thematicVisual} ${styles.numerologyVisual}`}>
        <i className={styles.numberRing} />
        {numerologyValues.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
    );
  }

  if (index === 4) {
    return (
      <svg
        aria-hidden="true"
        className={`${styles.thematicVisual} ${styles.zodiacVisual}`}
        focusable="false"
        viewBox="0 0 100 100"
      >
        <path className={styles.zodiacSector} d="M50 50L70 15A40 40 0 0 1 85 30Z" />
        <circle className={styles.zodiacRing} cx="50" cy="50" r="40" />
        <g className={styles.zodiacPoints}>
          <circle cx="50" cy="10" r="2" />
          <circle cx="70" cy="15" r="2" />
          <circle cx="85" cy="30" r="2" />
          <circle cx="90" cy="50" r="2" />
          <circle cx="85" cy="70" r="2" />
          <circle cx="70" cy="85" r="2" />
          <circle cx="50" cy="90" r="2" />
          <circle cx="30" cy="85" r="2" />
          <circle cx="15" cy="70" r="2" />
          <circle cx="10" cy="50" r="2" />
          <circle cx="15" cy="30" r="2" />
          <circle cx="30" cy="15" r="2" />
        </g>
        <path className={styles.constellationLine} d="M15 70L30 15L70 15L85 70" />
        <g className={styles.constellationNodes}>
          <circle cx="15" cy="70" r="3" />
          <circle cx="30" cy="15" r="3" />
          <circle cx="70" cy="15" r="3" />
          <circle cx="85" cy="70" r="3" />
        </g>
      </svg>
    );
  }

  if (index === 5) {
    return (
      <div aria-hidden="true" className={`${styles.thematicVisual} ${styles.astrologyVisual}`}>
        <span className={styles.astroOrbit1}>
          <i />
        </span>
        <span className={styles.astroOrbit2}>
          <i />
        </span>
        <span className={styles.astroOrbit3}>
          <i />
        </span>
        <b className={styles.astroCore} />
      </div>
    );
  }

  return null;
}

function getLayerVisual(index: number) {
  if (index === 0) {
    return 'questions';
  }

  if (index === 1) {
    return 'interests';
  }

  if (index === 2) {
    return 'voice';
  }

  if (index === 3) {
    return 'numerology';
  }

  if (index === 4) {
    return 'zodiac';
  }

  if (index === 5) {
    return 'astrology';
  }

  return undefined;
}

export function HomePage() {
  const { navigate } = useRouter();
  const { messages } = useI18n();
  const content = messages.home;

  const openStart = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    navigate(ROUTES.portrait);
  };

  const showHowItWorks = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    const sectionTitle = document.querySelector<HTMLElement>('#ai-process-title');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionTitle?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    sectionTitle?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.root}>
      <section aria-labelledby="landing-title" className={styles.hero}>
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
                    id="landing-title"
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

                <Stack className={styles.heroActions} direction="row" gap="sm" wrap>
                  <ButtonLink
                    className={styles.primaryCta}
                    href={ROUTES.portrait}
                    onClick={openStart}
                    prominence="primary"
                    size="large"
                  >
                    {content.hero.primaryCta}
                    <span aria-hidden="true" className={styles.ctaArrow}>
                      →
                    </span>
                  </ButtonLink>
                  <ButtonLink
                    href="#ai-process-title"
                    onClick={showHowItWorks}
                    prominence="secondary"
                    size="large"
                  >
                    {content.hero.secondaryCta}
                  </ButtonLink>
                </Stack>

                <ul className={styles.trustList}>
                  {content.hero.trustSignals.map((signal) => (
                    <li key={signal}>
                      <span aria-hidden="true" className={styles.trustMarker} />
                      {signal}
                    </li>
                  ))}
                </ul>
              </Stack>

              <LivingPortrait content={content.hero.visual} />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="benefits-title" className={styles.section}>
        <Container size="wide">
          <Stack gap="xl">
            <div className={styles.sectionHeading}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {content.benefits.eyebrow}
                </Typography>
                <Typography as="h2" id="benefits-title" variant="heading-lg">
                  {content.benefits.title}
                </Typography>
              </Stack>
              <Typography className={styles.sectionLead}>{content.benefits.description}</Typography>
            </div>

            <div className={styles.bentoGrid}>
              {content.benefits.items.map((benefit, index) => {
                const titleId = `benefit-${index + 1}-title`;

                return (
                  <article
                    aria-labelledby={titleId}
                    className={`${styles.bentoCard} ${bentoClasses[index] ?? ''}`}
                    key={benefit.title}
                  >
                    <BentoMotif index={index} />
                    <Stack className={styles.bentoCopy} gap="sm">
                      <Typography as="p" className={styles.bentoEyebrow} variant="caption">
                        {benefit.eyebrow}
                      </Typography>
                      <Typography as="h3" id={titleId} variant="heading-md">
                        {benefit.title}
                      </Typography>
                      <Typography className={styles.mutedText}>{benefit.description}</Typography>
                    </Stack>
                  </article>
                );
              })}
            </div>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="ai-process-title" className={styles.processSection}>
        <Container size="wide">
          <Surface className={styles.processSurface}>
            <Stack gap="xl">
              <div className={styles.sectionHeading}>
                <Stack gap="sm">
                  <Typography as="p" variant="eyebrow">
                    {content.process.eyebrow}
                  </Typography>
                  <Typography as="h2" id="ai-process-title" tabIndex={-1} variant="heading-lg">
                    {content.process.title}
                  </Typography>
                </Stack>
                <Typography className={styles.sectionLead}>
                  {content.process.description}
                </Typography>
              </div>

              <div aria-hidden="true" className={styles.processPipeline}>
                <span data-stage="1">{content.process.items[0]?.title}</span>
                <i data-connection="1" />
                <span data-stage="2">{content.process.items[1]?.title}</span>
                <i data-connection="2" />
                <strong data-stage="3">{content.process.synthesisLabel}</strong>
                <i data-connection="3" />
                <span data-stage="4">{content.process.resultLabel}</span>
              </div>

              <ol className={styles.processList}>
                {content.process.items.map((step, index) => (
                  <li className={styles.processCard} data-step={index + 1} key={step.title}>
                    <span aria-hidden="true" className={styles.processNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Stack gap="sm">
                      <Typography as="h3" variant="heading-sm">
                        {step.title}
                      </Typography>
                      <Typography className={styles.mutedText}>{step.description}</Typography>
                    </Stack>
                    <ProcessMotif />
                  </li>
                ))}
              </ol>

              <ul className={styles.originList}>
                {content.process.origins.map((origin, index) => (
                  <li key={origin}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    {origin}
                  </li>
                ))}
              </ul>
            </Stack>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="emotion-title" className={styles.emotionSection}>
        <Container size="wide">
          <div className={styles.emotionFrame}>
            <span aria-hidden="true" className={styles.emotionOrbit} />
            <Typography as="p" variant="eyebrow">
              {content.emotion.eyebrow}
            </Typography>
            <Typography as="h2" className={styles.emotionTitle} id="emotion-title">
              {content.emotion.title}
            </Typography>
            <Typography className={styles.emotionDescription}>
              {content.emotion.description}
            </Typography>
          </div>
        </Container>
      </section>

      <section aria-labelledby="layers-title" className={styles.section}>
        <Container size="wide">
          <Stack gap="xl">
            <div className={styles.sectionHeading}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {content.layers.eyebrow}
                </Typography>
                <Typography as="h2" id="layers-title" variant="heading-lg">
                  {content.layers.title}
                </Typography>
              </Stack>
              <Typography className={styles.sectionLead}>{content.layers.description}</Typography>
            </div>

            <div className={styles.layerGrid}>
              {content.layers.items.map((layer, index) => (
                <article
                  className={styles.layerCard}
                  data-visual={getLayerVisual(index)}
                  key={layer.title}
                >
                  <ThematicLayerVisual index={index} />
                  <div aria-hidden="true" className={styles.layerMark}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <Stack className={styles.layerCopy} gap="sm">
                    <div className={styles.layerMeta}>
                      <Typography as="p" className={styles.layerCategory} variant="caption">
                        {layer.label}
                      </Typography>
                      {layer.badge ? (
                        <Typography as="span" className={styles.layerBadge} variant="caption">
                          {layer.badge}
                        </Typography>
                      ) : null}
                    </div>
                    <Typography as="h3" variant="heading-sm">
                      {layer.title}
                    </Typography>
                    <Typography className={styles.mutedText}>{layer.description}</Typography>
                  </Stack>
                </article>
              ))}
            </div>

            <div className={styles.layerLegend}>
              <span>
                <i aria-hidden="true" data-kind="base" />
                {content.layers.baseLabel}
              </span>
              <span>
                <i aria-hidden="true" data-kind="optional" />
                {content.layers.optionalLabel}
              </span>
            </div>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="privacy-title" className={styles.privacySection}>
        <Container size="wide">
          <Surface className={styles.privacySurface}>
            <div className={styles.privacyGrid}>
              <Stack gap="sm">
                <Typography as="p" variant="eyebrow">
                  {content.privacy.eyebrow}
                </Typography>
                <Typography as="h2" id="privacy-title" variant="heading-lg">
                  {content.privacy.title}
                </Typography>
              </Stack>
              <Stack className={styles.privacyCopy} gap="md">
                <Typography>{content.privacy.description}</Typography>
                <Typography className={styles.privacyStatement}>
                  {content.privacy.statement}
                </Typography>
              </Stack>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="final-cta-title" className={styles.finalSection}>
        <Container size="wide">
          <div className={styles.finalFrame}>
            <Stack align="center" className={styles.finalCopy} gap="sm">
              <Typography as="h2" id="final-cta-title" variant="heading-lg">
                {content.final.title}
              </Typography>
              <Typography>{content.final.description}</Typography>
            </Stack>
            <ButtonLink
              className={`${styles.primaryCta} ${styles.finalCta}`}
              href={ROUTES.portrait}
              onClick={openStart}
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
