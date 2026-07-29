import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { Badge, Button, Card, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './PortraitPage.module.css';

const requirements = [
  {
    description: 'Короткий путь, который можно пройти в спокойном темпе.',
    label: 'Время',
    title: '3–5 минут',
  },
  {
    description: 'Готовые варианты — не нужно писать длинные ответы.',
    label: 'Формат',
    title: 'Несколько простых вопросов',
  },
  {
    description: 'Она нужна только для выбранных интерпретационных блоков.',
    label: 'Данные',
    title: 'Дата рождения',
  },
  {
    badge: 'Необязательно',
    description: 'Короткая запись подготовленного текста, которую можно пропустить.',
    label: 'Дополнение',
    title: 'Голос',
  },
] as const;

const outcomes = [
  {
    description: 'Связная картина из выбранных вами смысловых слоёв.',
    title: 'Персональный портрет',
  },
  {
    description: 'Небольшие идеи, которые можно применить без резких изменений.',
    title: 'Практические рекомендации',
  },
  {
    badge: 'Сначала бесплатно',
    description: 'Первая содержательная часть открывается до предложения оплаты.',
    title: 'Бесплатный результат',
  },
  {
    description: 'Расширенный разбор останется вашим решением после знакомства с результатом.',
    title: 'Полная версия позже',
  },
] as const;

export function PortraitPage() {
  const { navigate } = useRouter();

  const startQuestions = () => {
    navigate(ROUTES.portraitQuestions);
  };

  return (
    <div className={styles.root}>
      <section aria-labelledby="start-portrait-title" className={styles.hero}>
        <Container size="wide">
          <Surface className={styles.heroSurface} elevation="low">
            <div className={styles.heroGrid}>
              <Stack align="start" className={styles.heroContent} gap="lg">
                <Stack align="start" gap="sm">
                  <Typography as="p" className={styles.eyebrow} variant="caption">
                    Начало портрета
                  </Typography>
                  <Typography as="h1" className={styles.heroTitle} id="start-portrait-title">
                    Несколько шагов, чтобы увидеть общую картину
                  </Typography>
                  <Typography className={styles.heroDescription}>
                    Ответьте на короткие вопросы и добавьте только те данные, которые считаете
                    нужными. Первую часть портрета вы увидите бесплатно.
                  </Typography>
                </Stack>

                <Button
                  aria-describedby="start-duration-note"
                  className={styles.primaryButton}
                  onClick={startQuestions}
                >
                  Начать
                </Button>

                <Typography className={styles.heroNote} id="start-duration-note" variant="caption">
                  Обычно прохождение занимает 3–5 минут. Голос можно пропустить.
                </Typography>
              </Stack>

              <Surface
                aria-label="Кратко о прохождении"
                className={styles.journeySummary}
                elevation="medium"
                role="region"
              >
                <Stack gap="lg">
                  <Stack gap="xs">
                    <Typography as="p" variant="caption">
                      Перед началом
                    </Typography>
                    <Typography as="h2" variant="heading-md">
                      Всё важное — на одном экране
                    </Typography>
                  </Stack>

                  <dl className={styles.summaryList}>
                    <div className={styles.summaryItem}>
                      <dt>Время</dt>
                      <dd>3–5 минут</dd>
                    </div>
                    <div className={styles.summaryItem}>
                      <dt>Понадобится</dt>
                      <dd>Ответы и дата рождения</dd>
                    </div>
                    <div className={styles.summaryItem}>
                      <dt>Голос</dt>
                      <dd>Только по желанию</dd>
                    </div>
                    <div className={styles.summaryItem}>
                      <dt>Первый результат</dt>
                      <dd>Бесплатная часть</dd>
                    </div>
                  </dl>
                </Stack>
              </Surface>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="requirements-title" className={styles.section}>
        <Container size="wide">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" className={styles.eyebrow} variant="caption">
                Что понадобится
              </Typography>
              <Typography as="h2" id="requirements-title" variant="heading-lg">
                Только понятные и короткие шаги
              </Typography>
            </Stack>

            <div className={styles.cardGrid}>
              {requirements.map((requirement, index) => {
                const titleId = `requirement-${index + 1}-title`;

                return (
                  <Card
                    aria-labelledby={titleId}
                    className={styles.infoCard}
                    key={requirement.title}
                  >
                    <Stack gap="md">
                      <Stack align="start" direction="row" justify="between">
                        <Typography as="span" className={styles.cardLabel} variant="caption">
                          {requirement.label}
                        </Typography>
                        {'badge' in requirement ? (
                          <Badge tone="info">{requirement.badge}</Badge>
                        ) : null}
                      </Stack>
                      <Stack gap="sm">
                        <Typography as="h3" id={titleId} variant="heading-sm">
                          {requirement.title}
                        </Typography>
                        <Typography className={styles.mutedText}>
                          {requirement.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </div>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="outcomes-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.outcomesSurface}>
            <Stack gap="xl">
              <Stack className={styles.sectionIntroduction} gap="sm">
                <Typography as="p" className={styles.eyebrow} variant="caption">
                  Что получится
                </Typography>
                <Typography as="h2" id="outcomes-title" variant="heading-lg">
                  Результат, с которым удобно знакомиться постепенно
                </Typography>
              </Stack>

              <div className={styles.outcomeGrid}>
                {outcomes.map((outcome, index) => {
                  const titleId = `outcome-${index + 1}-title`;

                  return (
                    <div
                      aria-labelledby={titleId}
                      className={styles.outcomeItem}
                      key={outcome.title}
                    >
                      <Stack gap="sm">
                        {'badge' in outcome ? (
                          <Badge className={styles.outcomeBadge} tone="success">
                            {outcome.badge}
                          </Badge>
                        ) : null}
                        <Typography as="h3" id={titleId} variant="heading-sm">
                          {outcome.title}
                        </Typography>
                        <Typography className={styles.mutedText}>{outcome.description}</Typography>
                      </Stack>
                    </div>
                  );
                })}
              </div>
            </Stack>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="start-privacy-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.privacySurface} elevation="low">
            <div className={styles.privacyGrid}>
              <Stack gap="sm">
                <Typography as="p" className={styles.eyebrow} variant="caption">
                  Конфиденциальность
                </Typography>
                <Typography as="h2" id="start-privacy-title" variant="heading-lg">
                  Вы управляете тем, что добавляете
                </Typography>
              </Stack>
              <Typography className={styles.privacyCopy}>
                Голосовой этап необязателен. Исходная запись по умолчанию удаляется после анализа,
                если вы отдельно не выбрали сохранение.
              </Typography>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="start-cta-title" className={styles.finalSection}>
        <Container size="wide">
          <Stack align="center" className={styles.finalContent} gap="lg">
            <Stack align="center" className={styles.finalCopy} gap="sm">
              <Typography as="h2" id="start-cta-title" variant="heading-lg">
                Начнём с нескольких простых вопросов
              </Typography>
              <Typography>
                Готовые варианты помогут пройти первый этап без длинной анкеты.
              </Typography>
            </Stack>
            <Button className={styles.primaryButton} onClick={startQuestions}>
              Начать
            </Button>
          </Stack>
        </Container>
      </section>
    </div>
  );
}
