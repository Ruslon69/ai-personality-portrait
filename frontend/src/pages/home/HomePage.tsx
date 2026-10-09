import { homeCopy } from './home-copy';
import { type MouseEvent } from 'react';

import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import type { AppRoutePath } from '@shared/config';
import { useI18n } from '@shared/i18n';
import type { Locale } from '@shared/i18n';
import { ButtonLink, Container, Typography } from '@shared/ui';

import styles from './HomePage.module.css';

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    primary: string;
    trust: readonly string[];
    directionsTitle: string;
    directions: readonly {
      badge: string;
      cta: string;
      description: string;
      id: 'numerology' | 'portrait';
      title: string;
    }[];
    note: string;
  }
> = homeCopy;

const pathByDirection = {
  numerology: ROUTES.numerology,
  portrait: ROUTES.portrait,
};

const artworkByDirection = {
  numerology: {
    src: '/home/numerology-home-480.webp',
    srcSet: '/home/numerology-home-480.webp 480w, /home/numerology-home-960.webp 960w',
  },
  portrait: {
    src: '/home/portrait-home-480.webp',
    srcSet: '/home/portrait-home-480.webp 480w, /home/portrait-home-960.webp 960w',
  },
};

export function HomePage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const content = copy[locale];

  const link = (path: AppRoutePath) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className={styles.root}>
      <div aria-hidden="true" className={styles.atmosphere}>
        <picture>
          <source media="(max-width: 600px)" srcSet="/home/cosmic-background-800.webp" />
          <img
            alt=""
            src="/home/cosmic-background-1440.webp"
            width="1440"
            height="810"
            decoding="async"
          />
        </picture>
        <span className={styles.lightField} />
      </div>
      <section aria-labelledby="home-title" className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <Typography as="p" className={styles.eyebrow} variant="eyebrow">
                {content.eyebrow}
              </Typography>
              <Typography as="h1" className={styles.heroTitle} id="home-title" variant="display">
                {content.title}
              </Typography>
              <Typography className={styles.lead} variant="lead">
                {content.lead}
              </Typography>
              <ButtonLink
                className={styles.primaryAction}
                href={ROUTES.tarot}
                onClick={link(ROUTES.tarot)}
                prominence="primary"
                size="large"
              >
                {content.primary}
                <span aria-hidden="true">→</span>
              </ButtonLink>
              <ul className={styles.trust}>
                {content.trust.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div aria-hidden="true" className={styles.heroVisual}>
              <span className={styles.heroGlow} />
              <picture>
                <source
                  media="(max-width: 600px)"
                  srcSet="/home/tarot-hero-mobile-640.webp 640w, /home/tarot-hero-mobile-960.webp 960w"
                  sizes="100vw"
                  width="960"
                  height="875"
                />
                <img
                  className={styles.heroArtwork}
                  alt=""
                  src="/home/tarot-hero-1280.webp"
                  srcSet="/home/tarot-hero-1280.webp 1280w, /home/tarot-hero-1672.webp 1672w"
                  sizes="(max-width: 1100px) 85vw, (max-width: 1600px) 76vw, 1240px"
                  width="1672"
                  height="941"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </Container>
      </section>
      <section aria-labelledby="directions-title" className={styles.directions}>
        <Container size="wide">
          <img
            alt=""
            aria-hidden="true"
            className={styles.celestialDivider}
            src="/home/celestial-divider-640.webp"
            width="640"
            height="213"
            loading="lazy"
            decoding="async"
          />
          <Typography
            as="h2"
            className={styles.sectionTitle}
            id="directions-title"
            variant="heading-lg"
          >
            {content.directionsTitle}
          </Typography>
          <div className={styles.directionGrid}>
            {content.directions.map((item) => (
              <a
                className={styles.directionCard}
                data-direction={item.id}
                href={pathByDirection[item.id]}
                key={item.id}
                onClick={link(pathByDirection[item.id])}
              >
                <img
                  aria-hidden="true"
                  alt=""
                  className={styles.methodVisual}
                  src={artworkByDirection[item.id].src}
                  srcSet={artworkByDirection[item.id].srcSet}
                  sizes="(max-width: 600px) 100vw, (max-width: 1100px) 55vw, 640px"
                  width="960"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.methodCopy}>
                  <span className={styles.cardBadge}>{item.badge}</span>
                  <Typography as="h3" variant="heading-md">
                    {item.title}
                  </Typography>
                  <Typography className={styles.directionDescription}>
                    {item.description}
                  </Typography>
                  <span className={styles.cardAction}>
                    {item.cta} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
          <Typography className={styles.note}>{content.note}</Typography>
        </Container>
      </section>
    </div>
  );
}
