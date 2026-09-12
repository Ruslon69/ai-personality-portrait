import { Badge, Container, Stack, Typography } from '@shared/ui';
import type { ProfileLocale } from '@entities/personality-profile';

import styles from './UserProfileSections.module.css';

type ProfileHeroProps = {
  greeting: string;
  introduction: string;
  locale: ProfileLocale;
};

export function ProfileHero({ greeting, introduction, locale }: ProfileHeroProps) {
  return (
    <section aria-labelledby="profile-title" className={styles.hero}>
      <Container size="wide">
        <Stack className={styles.heroContent} gap="lg">
          <Badge className={styles.badge} tone="info">
            {locale === 'en'
              ? 'Saved locally'
              : locale === 'uk'
                ? 'Локальний профіль'
                : 'Локальный профиль'}
          </Badge>
          <Stack gap="sm">
            <Typography
              as="h1"
              className={styles.heroTitle}
              id="profile-title"
              tabIndex={-1}
              variant="display"
            >
              {greeting}
            </Typography>
            <Typography variant="lead">{introduction}</Typography>
          </Stack>
        </Stack>
      </Container>
    </section>
  );
}
