import { useEffect } from 'react';

import type {
  Insight,
  PersonalityProfile,
  PersonalityRecommendation,
} from '@entities/personality-profile';
import { PortraitMark } from '@entities/personality-profile';
import { focusElementByIdOnNextFrame } from '@shared/lib/focus';
import { Badge, Button, Card, Container, Stack, Surface, Typography } from '@shared/ui';

import styles from './ResultPreview.module.css';

type ResultPreviewProps = {
  onOpenFullResult: () => void;
  profile: PersonalityProfile;
};

function getSourceLabel(insight: Insight, profile: PersonalityProfile) {
  const source = profile.sourceDetails.find((item) => item.id === insight.sources[0]?.id);
  const fallback =
    profile.locale === 'en'
      ? 'Confirmed answers'
      : profile.locale === 'uk'
        ? 'Підтверджені відповіді'
        : 'Подтверждённые ответы';
  return source?.label ?? fallback;
}

export function ResultPreview({ onOpenFullResult, profile }: ResultPreviewProps) {
  useEffect(() => focusElementByIdOnNextFrame('result-preview-title'), []);
  const observations: readonly Insight[] = profile.strengths.slice(0, 3);
  const recommendations: readonly PersonalityRecommendation[] = profile.recommendations.slice(0, 2);
  const copy = {
    en: {
      badge: 'Your free preview is ready',
      title: 'Your first portrait is ready',
      lead: 'Start with three observations assembled from your confirmed answers and selected sources.',
      important: 'Important',
      caution:
        'This is not a diagnosis or a final definition of personality. Treat each observation as an invitation to reflect.',
      observationEyebrow: 'First observations',
      observationTitle: 'What may already be visible',
      recommendationEyebrow: 'Small actions',
      recommendationTitle: 'Two ideas you can test',
      continueEyebrow: 'Keep exploring',
      continueTitle: 'See how the observations work together',
      continueLead:
        'The full version reveals connections, context and practical steps. It opens locally without payment in this version.',
      open: 'Open full portrait',
    },
    ru: {
      badge: 'Бесплатная часть готова',
      title: 'Ваш первый портрет готов',
      lead: 'Начните с трёх коротких наблюдений, собранных из ваших подтверждённых ответов и выбранных источников.',
      important: 'Важно',
      caution:
        'Это не диагноз и не окончательное определение личности. Любой вывод можно воспринимать как повод для саморефлексии.',
      observationEyebrow: 'Первые наблюдения',
      observationTitle: 'Что можно заметить уже сейчас',
      recommendationEyebrow: 'Небольшие действия',
      recommendationTitle: 'Две идеи, которые легко проверить',
      continueEyebrow: 'Продолжить исследование',
      continueTitle: 'Посмотрите, как наблюдения работают вместе',
      continueLead:
        'Полная версия раскрывает связи, контекст и практические шаги. На этом этапе она открывается локально, без оплаты.',
      open: 'Открыть полный портрет',
    },
    uk: {
      badge: 'Безплатна частина готова',
      title: 'Ваш перший портрет готовий',
      lead: 'Почніть із трьох коротких спостережень, зібраних із підтверджених відповідей та обраних джерел.',
      important: 'Важливо',
      caution:
        'Це не діагноз і не остаточне визначення особистості. Кожен висновок можна сприймати як привід для саморефлексії.',
      observationEyebrow: 'Перші спостереження',
      observationTitle: 'Що можна помітити вже зараз',
      recommendationEyebrow: 'Невеликі дії',
      recommendationTitle: 'Дві ідеї, які легко перевірити',
      continueEyebrow: 'Продовжити дослідження',
      continueTitle: 'Подивіться, як спостереження працюють разом',
      continueLead:
        'Повна версія розкриває зв’язки, контекст і практичні кроки. На цьому етапі вона відкривається локально, без оплати.',
      open: 'Відкрити повний портрет',
    },
  }[profile.locale];

  return (
    <div className={styles.root}>
      <section aria-labelledby="result-preview-title" className={styles.hero}>
        <Container size="wide">
          <Surface className={styles.heroSurface} elevation="low">
            <div className={styles.heroGrid}>
              <Stack align="start" gap="lg">
                <Badge tone="success">{copy.badge}</Badge>
                <Stack gap="sm">
                  <Typography
                    as="h1"
                    className={styles.title}
                    id="result-preview-title"
                    tabIndex={-1}
                    variant="display"
                  >
                    {profile.revealHeadline}
                  </Typography>
                  <Typography className={styles.lead} variant="lead">
                    {profile.revealLead}
                  </Typography>
                </Stack>
                <PortraitMark
                  identity={profile.visualIdentity}
                  label={profile.revealHeadline}
                  size="sm"
                />
              </Stack>

              <Surface className={styles.heroNote} elevation="medium">
                <Stack gap="xs">
                  <Typography as="p" variant="caption">
                    {copy.important}
                  </Typography>
                  <Typography>{copy.caution}</Typography>
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
                {copy.observationEyebrow}
              </Typography>
              <Typography as="h2" id="observations-title" variant="heading-lg">
                {copy.observationTitle}
              </Typography>
            </Stack>

            <div className={styles.observationGrid}>
              {observations.map((observation) => (
                <Card
                  aria-labelledby={`${observation.id}-title`}
                  className={styles.observationCard}
                  key={observation.id}
                >
                  <Stack gap="md">
                    <Badge className={styles.sourceBadge} tone="info">
                      {getSourceLabel(observation, profile)}
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
                  {copy.recommendationEyebrow}
                </Typography>
                <Typography as="h2" id="recommendations-title" variant="heading-lg">
                  {copy.recommendationTitle}
                </Typography>
              </Stack>

              <div className={styles.recommendationList}>
                {recommendations.map((recommendation, index) => (
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
                  {copy.continueEyebrow}
                </Typography>
                <Typography as="h2" id="continue-research-title" variant="heading-lg">
                  {copy.continueTitle}
                </Typography>
                <Typography className={styles.muted}>{copy.continueLead}</Typography>
              </Stack>

              <Button onClick={onOpenFullResult} prominence="primary" size="large">
                {copy.open}
              </Button>
            </Stack>
          </Surface>
        </Container>
      </section>
    </div>
  );
}
