import { useEffect } from 'react';
import type { MouseEvent } from 'react';

import { useJourney } from '@features/journey';
import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import type { AppRoutePath } from '@shared/config';
import { useI18n } from '@shared/i18n';
import type { Locale } from '@shared/i18n';
import { Badge, ButtonLink, Container, Stack, Surface, Typography } from '@shared/ui';
import { useDraftPortraitState } from '@store';

import styles from './HomePage.module.css';

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    primary: string;
    numerology: string;
    portrait: string;
    trust: readonly string[];
    directionsTitle: string;
    directionsLead: string;
    directions: readonly {
      badge: string;
      cta: string;
      description: string;
      id: 'numerology' | 'portrait' | 'tarot';
      title: string;
    }[];
    note: string;
  }
> = {
  ru: {
    eyebrow: 'ТРИ СПОСОБА ПОСМОТРЕТЬ НА СЕБЯ',
    title: 'Выбери путь, который уже ищет тебя.',
    lead: 'Откройте личное чтение через символы, числа или внимательный взгляд на собственный контекст. Каждый путь раскрывается постепенно и оставляет последнее слово за вами.',
    primary: 'Открыть первое чтение',
    numerology: 'Моя нумерология',
    portrait: 'Создать личный портрет',
    trust: ['Локальный результат', 'Без обещаний будущего', 'Вы выбираете глубину'],
    directionsTitle: 'Куда вам интересно пойти сейчас?',
    directionsLead:
      'Три самостоятельных направления. Можно начать с одного и вернуться к другим позже.',
    note: 'Таро, нумерология и астрология предлагают интерпретационный взгляд для саморефлексии. Они не диагностируют и не гарантируют события.',
    directions: [
      {
        id: 'tarot',
        badge: 'ГЛАВНЫЙ ПУТЬ',
        title: 'Персональное Таро',
        description:
          'Тема, период, короткий контекст, дата и выбранные карты складываются в связный символический расклад.',
        cta: 'Открыть чтение',
      },
      {
        id: 'numerology',
        badge: 'ГЛУБОКИЙ МОДУЛЬ',
        title: 'Нумерологический профиль',
        description:
          'Прозрачные расчёты по дате: жизненный путь, проявление и текущий персональный период.',
        cta: 'Рассчитать профиль',
      },
      {
        id: 'portrait',
        badge: 'ОТДЕЛЬНЫЙ ПУТЬ',
        title: 'Личный портрет',
        description:
          'Ситуационные ответы превращаются в персональные наблюдения, контрасты и практические рекомендации.',
        cta: 'Создать портрет',
      },
    ],
  },
  en: {
    eyebrow: 'THREE WAYS TO LOOK AT YOURSELF',
    title: 'Choose the path already looking for you.',
    lead: 'Open a personal reading through symbols, numbers or a closer look at your own context. Each path unfolds gradually and leaves the final judgement with you.',
    primary: 'Open your first reading',
    numerology: 'My numerology',
    portrait: 'Create my portrait',
    trust: ['Local result', 'No future promises', 'You choose the depth'],
    directionsTitle: 'Where would you like to begin?',
    directionsLead:
      'Three independent paths. Start with one and return to the others whenever you wish.',
    note: 'Tarot, numerology and astrology offer interpretive perspectives for self-reflection. They do not diagnose or guarantee events.',
    directions: [
      {
        id: 'tarot',
        badge: 'MAIN PATH',
        title: 'Personal Tarot',
        description:
          'Your topic, period, short context, birth date and selected cards form one connected symbolic reading.',
        cta: 'Open a reading',
      },
      {
        id: 'numerology',
        badge: 'DEEP MODULE',
        title: 'Numerology profile',
        description:
          'Transparent date-based calculations: life path, outward expression and your current personal cycle.',
        cta: 'Calculate profile',
      },
      {
        id: 'portrait',
        badge: 'SEPARATE PATH',
        title: 'Personal portrait',
        description:
          'Situational answers become personal observations, contrasts and practical suggestions.',
        cta: 'Create portrait',
      },
    ],
  },
  uk: {
    eyebrow: 'ТРИ СПОСОБИ ПОГЛЯНУТИ НА СЕБЕ',
    title: 'Обери шлях, який уже шукає тебе.',
    lead: 'Відкрийте особисте читання через символи, числа або уважний погляд на власний контекст. Кожен шлях розкривається поступово й залишає останнє слово за вами.',
    primary: 'Відкрити перше читання',
    numerology: 'Моя нумерологія',
    portrait: 'Створити особистий портрет',
    trust: ['Локальний результат', 'Без обіцянок майбутнього', 'Ви обираєте глибину'],
    directionsTitle: 'Куди вам цікаво піти зараз?',
    directionsLead: 'Три самостійні напрями. Можна почати з одного й повернутися до інших пізніше.',
    note: 'Таро, нумерологія й астрологія пропонують інтерпретаційний погляд для саморефлексії. Вони не діагностують і не гарантують подій.',
    directions: [
      {
        id: 'tarot',
        badge: 'ГОЛОВНИЙ ШЛЯХ',
        title: 'Персональне Таро',
        description:
          'Тема, період, короткий контекст, дата й обрані карти складаються у зв’язний символічний розклад.',
        cta: 'Відкрити читання',
      },
      {
        id: 'numerology',
        badge: 'ГЛИБОКИЙ МОДУЛЬ',
        title: 'Нумерологічний профіль',
        description:
          'Прозорі розрахунки за датою: життєвий шлях, прояв і поточний персональний період.',
        cta: 'Розрахувати профіль',
      },
      {
        id: 'portrait',
        badge: 'ОКРЕМИЙ ШЛЯХ',
        title: 'Особистий портрет',
        description:
          'Ситуаційні відповіді перетворюються на персональні спостереження, контрасти й практичні рекомендації.',
        cta: 'Створити портрет',
      },
    ],
  },
};

const pathByDirection = {
  numerology: ROUTES.numerology,
  portrait: ROUTES.portrait,
  tarot: ROUTES.tarot,
};

export function HomePage() {
  const { locale } = useI18n();
  const { navigate } = useRouter();
  const { state: journey } = useJourney();
  const { currentProfile } = useDraftPortraitState();
  const content = copy[locale];
  const hasJourney = journey.readings.length > 0 || Boolean(currentProfile);

  useEffect(() => {
    if (hasJourney) navigate(ROUTES.profile, { replace: true });
  }, [hasJourney, navigate]);

  if (hasJourney) return null;
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
              <Stack align="start" gap="lg">
                <Badge tone="warning">{content.eyebrow}</Badge>
                <Typography as="h1" className={styles.heroTitle} id="home-title" variant="display">
                  {content.title}
                </Typography>
                <Typography className={styles.lead} variant="lead">
                  {content.lead}
                </Typography>
                <div className={styles.actions}>
                  <ButtonLink
                    href={ROUTES.tarot}
                    onClick={link(ROUTES.tarot)}
                    prominence="primary"
                    size="large"
                  >
                    {content.primary}
                    <span aria-hidden="true">→</span>
                  </ButtonLink>
                  <ButtonLink
                    href={ROUTES.numerology}
                    onClick={link(ROUTES.numerology)}
                    prominence="secondary"
                  >
                    {content.numerology}
                  </ButtonLink>
                  <ButtonLink
                    href={ROUTES.portrait}
                    onClick={link(ROUTES.portrait)}
                    prominence="quiet"
                  >
                    {content.portrait}
                  </ButtonLink>
                </div>
                <ul className={styles.trust}>
                  {content.trust.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Stack>
              <div aria-hidden="true" className={styles.heroVisual}>
                <div className={styles.tarotStack}>
                  <i />
                  <i />
                  <i />
                  <b>✦</b>
                </div>
                <div className={styles.numberOrbit}>
                  <span>11</span>
                  <i />
                  <i />
                  <i />
                </div>
                <div className={styles.portraitNode}>
                  <i />
                  <span />
                </div>
                <svg viewBox="0 0 500 420">
                  <path d="M106 210C175 160 210 170 250 210" />
                  <path d="M394 110C330 128 292 170 250 210" />
                  <path d="M386 322C320 300 285 255 250 210" />
                </svg>
              </div>
            </div>
          </Surface>
        </Container>
      </section>
      <section aria-labelledby="directions-title" className={styles.directions}>
        <Container size="wide">
          <Stack gap="lg">
            <div className={styles.sectionHeading}>
              <Typography as="h2" id="directions-title" variant="heading-lg">
                {content.directionsTitle}
              </Typography>
              <Typography>{content.directionsLead}</Typography>
            </div>
            <div className={styles.directionGrid}>
              {content.directions.map((item, index) => (
                <Surface
                  className={styles.directionCard}
                  data-direction={item.id}
                  elevation="low"
                  key={item.id}
                >
                  <div className={styles.directionContent}>
                    <div className={styles.directionHeader}>
                      <Badge tone={item.id === 'tarot' ? 'warning' : 'neutral'}>{item.badge}</Badge>
                      <span aria-hidden="true" className={styles.cardIndex}>
                        0{index + 1}
                      </span>
                    </div>
                    <Typography as="h3" variant="heading-lg">
                      {item.title}
                    </Typography>
                    <Typography className={styles.directionDescription}>
                      {item.description}
                    </Typography>
                    <ButtonLink
                      href={pathByDirection[item.id]}
                      onClick={link(pathByDirection[item.id])}
                      prominence={item.id === 'tarot' ? 'primary' : 'secondary'}
                    >
                      {item.cta}
                      <span aria-hidden="true">→</span>
                    </ButtonLink>
                  </div>
                  <span aria-hidden="true" className={styles.directionMotif}>
                    <i />
                    <i />
                    <i />
                  </span>
                </Surface>
              ))}
            </div>
            <Typography className={styles.note}>{content.note}</Typography>
          </Stack>
        </Container>
      </section>
    </div>
  );
}
