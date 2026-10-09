import { summaryCopy } from './../data/summary-copy';
import type { ProfileLocale } from '@entities/personality-profile';
import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';
import { Badge, Card, Container, Stack, Typography } from '@shared/ui';
import { navigateToPortraitSection } from './navigate-to-portrait-section';
import styles from './PortraitSummary.module.css';

export function PortraitSummary({
  profile,
  locale = profile.locale,
}: {
  profile: PersonalityProfile;
  locale?: ProfileLocale;
}) {
  const copy = summaryCopy[locale];
  const recommendation = profile.recommendations[0];
  return (
    <section aria-labelledby="summary-title" className={styles.section} id="summary">
      <Container size="wide">
        <Stack gap="lg">
          <Stack gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography as="h2" id="summary-title" tabIndex={-1} variant="heading-lg">
              {copy.title}
            </Typography>
          </Stack>
          <Card className={styles.card}>
            <div className={styles.grid}>
              <div className={styles.mark}>
                <PortraitMark identity={profile.visualIdentity} size="lg" />
              </div>
              <div className={styles.statement} lang={profile.locale}>
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
                <div className={styles.actionBridge}>
                  <span>{copy.recommendation}</span>
                  <strong id="summary-action-title" lang={profile.locale}>
                    {recommendation.actionLabel}
                  </strong>
                  <p>{copy.bridgeLead}</p>
                  <a
                    aria-describedby="summary-action-title"
                    className={styles.actionLink}
                    href="#recommendations"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateToPortraitSection('recommendations', true);
                    }}
                  >
                    <span>{copy.open}</span>
                    <span aria-hidden="true" className={styles.actionArrow}>
                      →
                    </span>
                  </a>
                </div>
              ) : null}
            </div>
          </Card>
        </Stack>
      </Container>
    </section>
  );
}
