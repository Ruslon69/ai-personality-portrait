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
  const copy = {
    es: {
      eyebrow: 'Último resultado',
      title: 'Vuelve a tu resultado principal',
      created: 'Creado',
      sources: 'Fuentes utilizadas',
      open: 'Abrir reflexión personal',
    },
    en: {
      eyebrow: 'Latest result',
      title: 'Return to your main result',
      created: 'Created',
      sources: 'Sources used',
      open: 'Open personal reflection',
    },
    ru: {
      eyebrow: 'Последний результат',
      title: 'Вернитесь к главному результату',
      created: 'Создан',
      sources: 'Использованные источники',
      open: 'Открыть личный разбор',
    },
    uk: {
      eyebrow: 'Останній результат',
      title: 'Поверніться до головного результату',
      created: 'Створено',
      sources: 'Використані джерела',
      open: 'Відкрити особистий розбір',
    },
  }[profile.locale];

  return (
    <section aria-labelledby="latest-portrait-title" className={styles.section}>
      <Container size="wide">
        <Stack gap="lg">
          <Stack className={styles.sectionIntroduction} gap="sm">
            <Typography as="p" variant="eyebrow">
              {copy.eyebrow}
            </Typography>
            <Typography as="h2" id="latest-portrait-title" variant="heading-lg">
              {copy.title}
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
                  {copy.created}{' '}
                  <time dateTime={profile.createdAt}>
                    {formatProfileDate(profile.createdAt, profile.locale)}
                  </time>
                </Typography>
                <Typography as="h3" className={styles.keyPhrase} variant="heading-md">
                  {profile.revealHeadline}
                </Typography>
                <div aria-label={copy.sources} className={styles.sourceList}>
                  {includedSources.map((source) => (
                    <Badge key={source.id} tone="info">
                      {source.label}
                    </Badge>
                  ))}
                </div>
              </Stack>

              <Button onClick={onOpenPortrait} prominence="primary" size="large">
                {copy.open}
              </Button>
            </div>
          </Card>
        </Stack>
      </Container>
    </section>
  );
}
