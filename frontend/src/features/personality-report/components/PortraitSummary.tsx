import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { Badge, ButtonLink, Card, Container, Stack, Typography } from '@shared/ui';
import styles from './PortraitSummary.module.css';

export function PortraitSummary({ profile }: { profile: PersonalityProfile }) {
  const copy = {
    en: {
      eyebrow: 'At a glance',
      title: 'What are you like?',
      recommendation: 'One useful next step',
      open: 'See action',
    },
    ru: {
      eyebrow: 'Коротко о вас',
      title: 'Какой вы человек?',
      recommendation: 'Один полезный шаг',
      open: 'Посмотреть действие',
    },
    uk: {
      eyebrow: 'Коротко про вас',
      title: 'Яка ви людина?',
      recommendation: 'Один корисний крок',
      open: 'Переглянути дію',
    },
  }[profile.locale];
  const recommendation = profile.recommendations[0];
  return (
    <section aria-labelledby="summary-title" className={styles.section} id="summary">
      <Container size="wide">
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography as="h2" id="summary-title" variant="heading-lg">
              {copy.title}
            </Typography>
          </Stack>
          <Card className={styles.card}>
            <div className={styles.grid}>
              <div className={styles.mark}>
                <PortraitMark identity={profile.visualIdentity} size="lg" />
              </div>
              <div className={styles.statement}>
                <Typography as="h3" variant="heading-md">
                  {profile.revealHeadline}
                </Typography>
                <Typography>{profile.revealLead}</Typography>
                <div className={styles.traits}>
                  {profile.keyTraits.slice(0, 3).map((trait) => (
                    <Badge key={trait} tone="info">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              {recommendation ? (
                <ButtonLink className={styles.tile} href="#recommendations">
                  <span>{copy.recommendation}</span>
                  <strong>{recommendation.actionLabel}</strong>
                  <small>{copy.open} →</small>
                </ButtonLink>
              ) : null}
            </div>
          </Card>
        </Stack>
      </Container>
    </section>
  );
}
