import { Badge, Button, Card, Container, Stack, Typography } from '@shared/ui';
import { PortraitMark, type PersonalityProfile } from '@entities/personality-profile';

import { formatProfileDate } from '../utils';
import styles from './UserProfileSections.module.css';

type LatestPortraitSectionProps = {
  onOpenPortrait: () => void;
  profile: PersonalityProfile;
};

export function LatestPortraitSection({ onOpenPortrait, profile }: LatestPortraitSectionProps) {
  const includedSources = profile.sourceDetails.filter((source) => source.status !== 'omitted');

  return (
    <section aria-labelledby="latest-portrait-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              Последний портрет
            </Typography>
            <Typography as="h2" id="latest-portrait-title" variant="heading-lg">
              Вернитесь к главному результату
            </Typography>
          </Stack>

          <Card className={styles.latestCard}>
            <div className={styles.latestGrid}>
              <PortraitMark
                className={styles.latestMark}
                identity={profile.visualIdentity}
                size="sm"
              />
              <Stack gap="md">
                <Typography className={styles.muted} variant="caption">
                  Создан{' '}
                  <time dateTime={profile.createdAt}>{formatProfileDate(profile.createdAt)}</time>
                </Typography>
                <Typography as="h3" className={styles.keyPhrase} variant="heading-md">
                  {profile.revealHeadline}
                </Typography>
                <div aria-label="Использованные источники" className={styles.sourceList}>
                  {includedSources.map((source) => (
                    <Badge key={source.id} tone="info">
                      {source.label}
                    </Badge>
                  ))}
                </div>
              </Stack>

              <Button onClick={onOpenPortrait} prominence="primary" size="large">
                Открыть портрет
              </Button>
            </div>
          </Card>
        </Stack>
      </Container>
    </section>
  );
}
