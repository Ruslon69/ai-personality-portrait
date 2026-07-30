import { useEffect } from 'react';

import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { Badge, Button, Card, Container, Stack, Surface, Typography } from '@shared/ui';

import { previewObservations, previewRecommendations } from '../data';
import styles from './ResultPreview.module.css';

type ResultPreviewProps = {
  onOpenFullResult: () => void;
};

export function ResultPreview({ onOpenFullResult }: ResultPreviewProps) {
  useEffect(() => focusElementByIdOnNextFrame('result-preview-title'), []);

  return (
    <div className={styles.root}>
      <section aria-labelledby="result-preview-title" className={styles.hero}>
        <Container size="wide">
          <Surface className={styles.heroSurface} elevation="low">
            <div className={styles.heroGrid}>
              <Stack align="start" gap="lg">
                <Badge tone="success">Бесплатная часть готова</Badge>
                <Stack gap="sm">
                  <Typography
                    as="h1"
                    className={styles.title}
                    id="result-preview-title"
                    tabIndex={-1}
                    variant="display"
                  >
                    Ваш первый портрет готов
                  </Typography>
                  <Typography className={styles.lead} variant="lead">
                    Начните с трёх коротких наблюдений. Формулировки ниже показывают структуру
                    будущего результата и используют локальные демонстрационные данные.
                  </Typography>
                </Stack>
              </Stack>

              <Surface className={styles.heroNote} elevation="medium">
                <Stack gap="xs">
                  <Typography as="p" variant="caption">
                    Важно
                  </Typography>
                  <Typography>
                    Это не диагноз и не окончательное определение личности. Любой вывод можно
                    воспринимать как повод для саморефлексии.
                  </Typography>
                </Stack>
              </Surface>
            </div>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="observations-title" className={styles.section}>
        <Container size="wide">
          <Stack gap="lg">
            <Stack className={styles.sectionIntroduction} gap="sm">
              <Typography as="p" variant="eyebrow">
                Первые наблюдения
              </Typography>
              <Typography as="h2" id="observations-title" variant="heading-lg">
                Что можно заметить уже сейчас
              </Typography>
            </Stack>

            <div className={styles.observationGrid}>
              {previewObservations.map((observation) => (
                <Card
                  aria-labelledby={`${observation.id}-title`}
                  className={styles.observationCard}
                  key={observation.id}
                >
                  <Stack gap="md">
                    <Badge className={styles.sourceBadge} tone="info">
                      {observation.source}
                    </Badge>
                    <Typography as="h3" id={`${observation.id}-title`} variant="heading-sm">
                      {observation.title}
                    </Typography>
                    <Typography className={styles.muted}>{observation.description}</Typography>
                  </Stack>
                </Card>
              ))}
            </div>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="recommendations-title" className={styles.section}>
        <Container size="wide">
          <Surface className={styles.recommendationsSurface}>
            <Stack gap="lg">
              <Stack className={styles.sectionIntroduction} gap="sm">
                <Typography as="p" variant="eyebrow">
                  Небольшие действия
                </Typography>
                <Typography as="h2" id="recommendations-title" variant="heading-lg">
                  Две идеи, которые легко проверить
                </Typography>
              </Stack>

              <div className={styles.recommendationList}>
                {previewRecommendations.map((recommendation, index) => (
                  <article className={styles.recommendation} key={recommendation.id}>
                    <span aria-hidden="true" className={styles.recommendationNumber}>
                      {index + 1}
                    </span>
                    <Stack gap="sm">
                      <Typography as="h3" variant="heading-sm">
                        {recommendation.title}
                      </Typography>
                      <Typography className={styles.muted}>{recommendation.description}</Typography>
                    </Stack>
                  </article>
                ))}
              </div>
            </Stack>
          </Surface>
        </Container>
      </section>

      <section aria-labelledby="continue-research-title" className={styles.finalSection}>
        <Container size="wide">
          <Surface className={styles.continueSurface} elevation="low">
            <Stack align="center" gap="lg">
              <Stack align="center" className={styles.continueCopy} gap="sm">
                <Typography as="p" variant="eyebrow">
                  Продолжить исследование
                </Typography>
                <Typography as="h2" id="continue-research-title" variant="heading-lg">
                  Посмотрите, как наблюдения работают вместе
                </Typography>
                <Typography className={styles.muted}>
                  Полная версия раскрывает связи, контекст и практические шаги. На этом этапе она
                  открывается локально, без оплаты.
                </Typography>
              </Stack>

              <Button onClick={onOpenFullResult} prominence="primary" size="large">
                Открыть полный портрет
              </Button>
            </Stack>
          </Surface>
        </Container>
      </section>
    </div>
  );
}
