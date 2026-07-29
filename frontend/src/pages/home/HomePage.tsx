import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { Button, Card, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './HomePage.module.css';

const benefits = [
  {
    description:
      'Наблюдения помогают заметить привычные способы думать и действовать, не сводя человека к одному типу.',
    title: 'Портрет, а не ярлык',
  },
  {
    description:
      'Вы сами определяете, какие данные и интерпретации добавить. Необязательные части можно пропустить.',
    title: 'Глубина под вашим контролем',
  },
  {
    description:
      'Ответы, интересы и выбранные интерпретации соединяются в одну понятную, но честно размеченную картину.',
    title: 'Несколько взглядов на себя',
  },
  {
    description:
      'Важные наблюдения сопровождаются небольшими рекомендациями, которые можно попробовать в жизни.',
    title: 'Польза после результата',
  },
] as const;

const steps = [
  {
    description: 'Определите, какие стороны портрета вам сейчас интересны.',
    title: 'Выберите состав',
  },
  {
    description: 'Отвечайте готовыми вариантами — по одному короткому вопросу за раз.',
    title: 'Добавьте контекст',
  },
  {
    description: 'По желанию добавьте голос и данные для отдельных интерпретаций.',
    title: 'Дополните портрет',
  },
  {
    description: 'Получите краткую часть и исследуйте наблюдения в своём темпе.',
    title: 'Откройте результат',
  },
] as const;

export function HomePage() {
  const { navigate } = useRouter();

  const startPortrait = () => {
    navigate(ROUTES.portrait);
  };

  const showHowItWorks = () => {
    const sectionTitle = document.querySelector<HTMLElement>('#how-it-works-title');
    sectionTitle?.scrollIntoView();
    sectionTitle?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.root}>
      <section aria-labelledby="landing-title" className={styles.hero}>
        <Container size="wide">
          <Surface className={styles.heroSurface} elevation="low">
            <div className={styles.heroGrid}>
              <Stack align="start" className={styles.heroContent} gap="lg">
                <Stack align="start" gap="sm">
                  <Typography as="p" className={styles.eyebrow} variant="caption">
                    Персональное пространство для саморефлексии
                  </Typography>
                  <Typography as="h1" className={styles.heroTitle} id="landing-title">
                    Увидьте себя с новой стороны
                  </Typography>
                  <Typography className={styles.heroDescription}>
                    Создайте цифровой портрет из ваших ответов, интересов и, по желанию,
                    особенностей речи — без оценок и категоричных выводов.
                  </Typography>
                </Stack>

                <Stack className={styles.heroActions} direction="row" gap="sm" wrap>
                  <Button className={styles.primaryButton} onClick={startPortrait}>
                    Создать мой портрет
                  </Button>
                  <Button className={styles.secondaryButton} onClick={showHowItWorks}>
                    Как это работает
                  </Button>
                </Stack>

                <Typography className={styles.heroNote} variant="caption">
                  Для саморефлексии и развлечения — не диагностика и не прогноз. Начать можно без
                  регистрации, а голосовой этап можно пропустить.
                </Typography>
              </Stack>

              <div
                aria-label="Портрет объединяет выбранные пользователем смысловые слои"
                className={styles.portraitPreview}
                role="img"
              >
                <div className={styles.previewCenter}>
                  <Typography as="span" className={styles.previewLabel} variant="caption">
                    Ваш портрет
                  </Typography>
                  <Typography as="span" className={styles.previewValue} variant="heading-md">
                    Собран по вашим ответам
                  </Typography>
                </div>
                <span className={`${styles.previewLayer} ${styles.previewLayerOne}`}>Ответы</span>
                <span className={`${styles.previewLayer} ${styles.previewLayerTwo}`}>Интересы</span>
                <span className={`${styles.previewLayer} ${styles.previewLayerThree}`}>
                  Речь по желанию
                </span>
                <span className={`${styles.previewLayer} ${styles.previewLayerFour}`}>
                  Интерпретации
                </span>
              </div>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="benefits-title" className={styles.section}>
        <Container size="wide">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Что вы получите
              </Typography>
              <Typography as="h2" id="benefits-title" variant="heading-lg">
                Содержательный взгляд без лишней сложности
              </Typography>
              <Typography>
                Портрет показывает связи между выбранными вами источниками и сохраняет понятное
                происхождение каждого вывода.
              </Typography>
            </Stack>

            <div className={styles.benefitGrid}>
              {benefits.map((benefit, index) => {
                const titleId = `benefit-${index + 1}-title`;

                return (
                  <Card
                    aria-labelledby={titleId}
                    className={styles.benefitCard}
                    key={benefit.title}
                  >
                    <Stack gap="sm">
                      <Typography as="h3" id={titleId} variant="heading-sm">
                        {benefit.title}
                      </Typography>
                      <Typography className={styles.mutedText}>{benefit.description}</Typography>
                    </Stack>
                  </Card>
                );
              })}
            </div>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="how-it-works-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.stepsSurface}>
            <Stack gap="xl">
              <Stack className={styles.sectionIntroduction} gap="sm">
                <Typography as="p" className={styles.eyebrow} variant="caption">
                  Как это работает
                </Typography>
                <Typography as="h2" id="how-it-works-title" tabIndex={-1} variant="heading-lg">
                  Четыре спокойных шага к результату
                </Typography>
                <Typography>
                  Никаких длинных анкет: на каждом этапе виден один понятный следующий шаг.
                </Typography>
              </Stack>

              <ol className={styles.stepList}>
                {steps.map((step, index) => (
                  <li className={styles.stepItem} key={step.title}>
                    <Typography aria-hidden="true" as="span" className={styles.stepNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Stack gap="xs">
                      <Typography as="h3" variant="heading-sm">
                        {step.title}
                      </Typography>
                      <Typography className={styles.mutedText}>{step.description}</Typography>
                    </Stack>
                  </li>
                ))}
              </ol>
            </Stack>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="privacy-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.privacySurface} elevation="low">
            <div className={styles.privacyGrid}>
              <Stack gap="sm">
                <Typography as="p" className={styles.eyebrow} variant="caption">
                  Голос и приватность
                </Typography>
                <Typography as="h2" id="privacy-title" variant="heading-lg">
                  Голос добавляет нюанс, но не является обязательным
                </Typography>
              </Stack>

              <Stack className={styles.privacyCopy} gap="md">
                <Typography>
                  Запись нужна только для наблюдений за особенностями речи в текущем фрагменте. Она
                  не используется для идентификации человека.
                </Typography>
                <Typography className={styles.privacyStatement}>
                  Голосовой этап можно пропустить, а исходная запись по умолчанию удаляется после
                  анализа.
                </Typography>
              </Stack>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="final-cta-title" className={styles.finalSection}>
        <Container size="wide">
          <Stack align="center" className={styles.finalContent} gap="lg">
            <Stack align="center" className={styles.finalCopy} gap="sm">
              <Typography as="h2" id="final-cta-title" variant="heading-lg">
                Соберите портрет на своих условиях
              </Typography>
              <Typography>
                Выберите только те слои, которые вам интересны, и начните с коротких вопросов.
              </Typography>
            </Stack>
            <Button className={styles.primaryButton} onClick={startPortrait}>
              Создать мой портрет
            </Button>
          </Stack>
        </Container>
      </section>
    </div>
  );
}
