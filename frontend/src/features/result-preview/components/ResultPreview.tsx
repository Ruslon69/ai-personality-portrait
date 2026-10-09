import { reportCopy } from '@features/personality-report/data/report-copy';
import { previewCopy } from './../data/preview-copy';
import { getSourceReference, type ProfileLocale } from '@entities/personality-profile';
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
  locale?: ProfileLocale;
};

function getSourceLabel(insight: Insight, profile: PersonalityProfile, locale: ProfileLocale) {
  const source = profile.sourceDetails.find((item) => item.id === insight.sources[0]?.id);
  const fallback = reportCopy[locale].answersSource;
  return source ? getSourceReference(source.id, locale).label : fallback;
}

export function ResultPreview({
  onOpenFullResult,
  profile,
  locale = profile.locale,
}: ResultPreviewProps) {
  useEffect(() => focusElementByIdOnNextFrame('result-preview-title'), []);
  const observations: readonly Insight[] = profile.strengths.slice(0, 3);
  const recommendations: readonly PersonalityRecommendation[] = profile.recommendations.slice(0, 2);
  const copy = previewCopy[locale];

  return (
    <div className={styles.root} lang={locale} data-result-locale={profile.locale}>
      <section aria-labelledby="result-preview-title" className={styles.hero}>
        <Container size="wide">
          <Surface className={styles.heroSurface} elevation="low">
            <div className={styles.heroGrid}>
              <Stack align="start" className={styles.heroMain} gap="lg">
                <div className={styles.resultState}>
                  <Badge tone="success">{copy.badge}</Badge>
                </div>
                <Stack gap="sm">
                  <Typography
                    as="h1"
                    className={styles.title}
                    lang={profile.locale}
                    id="result-preview-title"
                    tabIndex={-1}
                    variant="display"
                  >
                    {profile.revealHeadline}
                  </Typography>
                  <Typography className={styles.lead} lang={profile.locale} variant="lead">
                    {profile.revealLead}
                  </Typography>
                </Stack>
              </Stack>

              <div aria-hidden="true" className={styles.signature}>
                <PortraitMark className={styles.mark} identity={profile.visualIdentity} size="lg" />
              </div>

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
                      {getSourceLabel(observation, profile, locale)}
                    </Badge>
                    <Typography
                      as="h3"
                      lang={profile.locale}
                      id={`${observation.id}-title`}
                      variant="heading-sm"
                    >
                      {observation.title}
                    </Typography>
                    <Typography className={styles.muted} lang={profile.locale}>
                      {observation.description}
                    </Typography>
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
                {recommendations.map((recommendation) => (
                  <article
                    lang={profile.locale}
                    className={styles.recommendation}
                    key={recommendation.id}
                  >
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
