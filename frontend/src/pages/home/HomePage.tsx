import type { MouseEvent } from 'react';

import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import type { AppRoutePath } from '@shared/config';
import { useI18n } from '@shared/i18n';
import type { Locale } from '@shared/i18n';
import { ButtonLink, Container, Surface, Typography } from '@shared/ui';

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
> = {
  ru: {
    eyebrow: 'Soul Arkana',
    title: 'Узнайте больше о себе',
    lead: 'Посмотрите на свою ситуацию через карты Таро. Другие способы узнать о себе можно выбрать ниже.',
    primary: 'Начать',
    trust: ['3–5 минут', 'Понятный результат', 'Сохраняется в браузере'],
    directionsTitle: 'Другие способы узнать о себе',
    note: 'Результаты помогают поразмышлять о себе и не заменяют профессиональную консультацию.',
    directions: [
      {
        id: 'numerology',
        badge: 'По дате рождения',
        title: 'Что говорит ваша дата?',
        description: 'Узнайте основные черты и тему текущего периода.',
        cta: 'Узнать',
      },
      {
        id: 'portrait',
        badge: 'Вопросы о себе',
        title: 'Какой я человек?',
        description: 'Ответьте на несколько вопросов и получите понятное описание себя.',
        cta: 'Начать разбор',
      },
    ],
  },
  en: {
    eyebrow: 'Soul Arkana',
    title: 'Learn more about yourself',
    lead: 'See your situation through a Tarot reading. You can explore other ways to reflect below.',
    primary: 'Start',
    trust: ['3–5 minutes', 'Clear takeaways', 'Saved in your browser'],
    directionsTitle: 'Other ways to learn about yourself',
    note: 'Results are designed for personal reflection and do not replace professional advice.',
    directions: [
      {
        id: 'numerology',
        badge: 'By birth date',
        title: 'What does your date say?',
        description: 'See your key traits and the theme of your current period.',
        cta: 'Find out',
      },
      {
        id: 'portrait',
        badge: 'Questions about you',
        title: 'What am I like?',
        description: 'Answer a few questions and get a clear description of yourself.',
        cta: 'Start reflection',
      },
    ],
  },
  uk: {
    eyebrow: 'Soul Arkana',
    title: 'Дізнайтеся більше про себе',
    lead: 'Погляньте на свою ситуацію через карти Таро. Інші способи дізнатися про себе можна обрати нижче.',
    primary: 'Почати',
    trust: ['3–5 хвилин', 'Зрозумілий результат', 'Зберігається у браузері'],
    directionsTitle: 'Інші способи дізнатися про себе',
    note: 'Результати допомагають поміркувати про себе й не замінюють професійної консультації.',
    directions: [
      {
        id: 'numerology',
        badge: 'За датою народження',
        title: 'Що говорить ваша дата?',
        description: 'Дізнайтеся про основні риси й тему поточного періоду.',
        cta: 'Дізнатися',
      },
      {
        id: 'portrait',
        badge: 'Запитання про себе',
        title: 'Яка я людина?',
        description: 'Дайте відповідь на кілька запитань і отримайте зрозумілий опис себе.',
        cta: 'Почати розбір',
      },
    ],
  },
};

const pathByDirection = {
  numerology: ROUTES.numerology,
  portrait: ROUTES.portrait,
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
      <section aria-labelledby="home-title" className={styles.hero}>
        <Container size="wide">
          <Surface className={styles.heroFrame}>
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
                <span className={styles.heroOrbit}>
                  <i />
                  <i />
                </span>
                <span className={styles.heroCard}>
                  <svg focusable="false" viewBox="0 0 220 360">
                    <rect
                      className={styles.heroCardFrame}
                      height="340"
                      rx="15"
                      width="200"
                      x="10"
                      y="10"
                    />
                    <rect
                      className={styles.heroCardInner}
                      height="312"
                      rx="10"
                      width="172"
                      x="24"
                      y="24"
                    />
                    <path className={styles.heroCardArc} d="M53 267V151a57 57 0 0 1 114 0v116" />
                    <path className={styles.heroCandle} d="M91 264h38M98 264v-76h24v76" />
                    <path className={styles.heroWick} d="M110 188v-17" />
                    <path
                      className={styles.heroFlame}
                      d="M110 170c-18-9-21-27-10-41 7-9 15-16 17-31 18 18 25 37 16 53-5 9-13 16-23 19Z"
                    />
                    <path className={styles.heroCardOrbit} d="M45 104c42-39 103-43 139-9" />
                    <circle className={styles.heroOrbitPoint} cx="184" cy="95" r="4" />
                    <path
                      className={styles.heroCardStar}
                      d="m53 74 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"
                    />
                  </svg>
                </span>
                <span className={styles.heroStar} data-position="top">
                  ✦
                </span>
                <span className={styles.heroStar} data-position="bottom">
                  ✦
                </span>
              </div>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="directions-title" className={styles.directions}>
        <Container size="wide">
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
                <span className={styles.cardBadge}>{item.badge}</span>
                <Typography as="h3" variant="heading-md">
                  {item.title}
                </Typography>
                <Typography className={styles.directionDescription}>{item.description}</Typography>
                <span className={styles.cardAction}>
                  {item.cta} <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
          <Typography className={styles.note}>{content.note}</Typography>
        </Container>
      </section>
    </div>
  );
}
