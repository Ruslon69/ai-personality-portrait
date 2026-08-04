import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { Badge, ButtonLink, Card, Container, Stack, Typography } from '@shared/ui';
import { SourceChip } from './SourceChip';
import styles from './PortraitSummary.module.css';

export function PortraitSummary({ profile }: { profile: PersonalityProfile }) {
  const copy = {
    en: {
      eyebrow: 'Your portrait on one screen',
      title: 'The whole combination, before the details',
      contrast: 'Context contrast',
      interest: 'Main interest',
      recommendation: 'One experiment',
      open: 'Explore',
    },
    ru: {
      eyebrow: 'Ваш портрет на одном экране',
      title: 'Вся комбинация — до подробностей',
      contrast: 'Контраст контекста',
      interest: 'Главный интерес',
      recommendation: 'Один эксперимент',
      open: 'Исследовать',
    },
    uk: {
      eyebrow: 'Ваш портрет на одному екрані',
      title: 'Уся комбінація — до подробиць',
      contrast: 'Контраст контексту',
      interest: 'Головний інтерес',
      recommendation: 'Один експеримент',
      open: 'Дослідити',
    },
  }[profile.locale];
  const contrast = profile.contrasts[0];
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
                <div className={styles.traits}>
                  {profile.keyTraits.map((trait) => (
                    <Badge key={trait} tone="info">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              {contrast ? (
                <ButtonLink className={styles.tile} href="#contrasts">
                  <span>{copy.contrast}</span>
                  <strong>{contrast.meaning}</strong>
                  <small>{copy.open} →</small>
                </ButtonLink>
              ) : null}
              {profile.primaryInterest ? (
                <div className={styles.tile}>
                  <span>{copy.interest}</span>
                  <strong>{profile.primaryInterest}</strong>
                </div>
              ) : null}
              {recommendation ? (
                <ButtonLink className={styles.tile} href="#recommendations">
                  <span>{copy.recommendation}</span>
                  <strong>{recommendation.actionLabel}</strong>
                  <small>{copy.open} →</small>
                </ButtonLink>
              ) : null}
              <div className={styles.sources}>
                {profile.sourceDetails
                  .filter((source) => source.status !== 'omitted')
                  .map((source) => (
                    <SourceChip key={source.id} locale={profile.locale} source={source} />
                  ))}
              </div>
            </div>
          </Card>
        </Stack>
      </Container>
    </section>
  );
}
